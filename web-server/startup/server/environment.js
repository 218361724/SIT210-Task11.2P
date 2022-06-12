// Environment setup (server)

import twilio from 'twilio';
import express from 'express';
import blocked from 'blocked-at';
import { DDPGracefulShutdown } from '@meteorjs/ddp-graceful-shutdown';
import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import { meteorSettings, logger, currentEnv } from '../environment.js';

// Report internal Meteor logs
Meteor._debug = function (message, ...args) { logger.debug(message, { args }); };

// Register SIGTERM handler
if (currentEnv === 'production') {
  new DDPGracefulShutdown({
    gracePeriodMillis: 1000 * process.env.METEOR_SIGTERM_GRACE_PERIOD_SECONDS,
    server: Meteor.server,
  }).installSIGTERMHandler();
}

// Configure Twilio SDK
const twilioSettings = meteorSettings.twilio;
export const twilioClient = twilio(
  twilioSettings.accountSid,
  twilioSettings.authToken,
);

// Setup webhooks API
export const expressApp = express();
expressApp.use(express.urlencoded({ extended: false }));
expressApp.use(express.json());
WebApp.connectHandlers.use(expressApp);

// Report slow sync execution
if (currentEnv === 'production') {
  blocked((time, stack) => {
    logger.debug(`Blocked for ${time}ms, operation started here:`, stack);
  }, {
    trimFalsePositives: true,
    threshold: 1000,
  });
}
