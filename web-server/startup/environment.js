// Environment setup (common)

import isDefined from '@talos-sdk/jsutil/is-defined';
import winston from 'winston';
import { Meteor } from 'meteor/meteor';
// Server-only imports
if (Meteor.isServer) {
  require('winston-papertrail');
}
// Client-only imports
let clientImports;
if (Meteor.isClient) {
  clientImports = {
    LogStub: require('logstub'),
  };
}

// Ensure we have Meteor settings
export const meteorSettings = Meteor.settings;
if (!isDefined(meteorSettings)) { throw new Error('Meteor settings not found. Aborting.'); }

// Expose dictionary for mongo collections
export const mongoCollectionByName = {};

// Expose current environment
export const currentEnv = meteorSettings.public.environment;

// Set current country
export const currentTimezone = 'Australia/Sydney';
export const currentCountryCode = 'AU';

// Wrap server logger in common interface for client simulation methods
let currentLogger;
if (Meteor.isServer) {
  // Configure streaming to papertrail (with console fallback)
  let winstonTransport;
  const transportConfig = { handleExceptions: true, colorize: true, level: 'silly' };
  if (isDefined(meteorSettings.papertrail)) {
    winstonTransport = new winston.transports.Papertrail({
      ...transportConfig,
      ...meteorSettings.papertrail,
    });
  } else {
    winstonTransport = new winston.transports.Console(transportConfig);
  }
  currentLogger = new winston.Logger({ transports: [winstonTransport] });
  currentLogger.on('error', (error) => console.error(error)); // eslint-disable-line no-console
} else {
  // Stub interface on client
  currentLogger = new clientImports.LogStub();
}
export const logger = currentLogger;
