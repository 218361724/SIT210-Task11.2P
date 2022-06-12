// Sensor logs: schema (common)

import SimpleSchema from 'simpl-schema';
import { Mongo } from 'meteor/mongo';
import { mongoCollectionByName } from '../../startup/environment.js';
import { autoValueMethods } from '../utilities.js';

const SensorLogs = new Mongo.Collection('sensor-logs');
mongoCollectionByName['sensor-logs'] = SensorLogs;

SensorLogs.schemaObj = {
  // Metadata
  createdAt: {
    type: Date,
    autoValue: autoValueMethods.createdAt,
  },

  // Detected levels (in ppm)
  smoke: {
    type: Number,
  },
  co: {
    type: Number,
  },
};

SensorLogs.schema = new SimpleSchema(SensorLogs.schemaObj);
SensorLogs.attachSchema(SensorLogs.schema);

export default SensorLogs;
