// Sensor logs collection: methods (server)

import { Meteor } from 'meteor/meteor';
import { expressApp } from '../../../startup/server/environment.js';
import { meteorSettings } from '../../../startup/environment.js';
import { sendAlarmHealthSms } from '../../../startup/server/sms-notifier.js';
import SensorLogs from '../schema.js';

const { clientApiKey } = meteorSettings;

// [POST] Log sensor data readings
expressApp.post('/api/sensor-logs', async (req, res) => {
  const {
    apiKey,
    value,
  } = req.body;

  // Reject invalid client api key
  if (apiKey !== clientApiKey) {
    res.sendStatus(403);
    return;
  }

  // Store provided sensor log data
  const [smoke, co] = value.split(',');
  SensorLogs.insert({
    smoke: Number(smoke),
    co: Number(co),
  });

  res.sendStatus(200);
});

// [POST] Log sensor health event
expressApp.post('/api/sensor-logs/health', async (req, res) => {
  const {
    apiKey,
    value,
  } = req.body;

  // Reject invalid client api key
  if (apiKey !== clientApiKey) {
    res.sendStatus(403);
    return;
  }

  // Queue SMS in background when audible alarm is not working
  if (value === 'raspi-client-conn-down') {
    Meteor.defer(sendAlarmHealthSms);
  }

  res.sendStatus(200);
});
