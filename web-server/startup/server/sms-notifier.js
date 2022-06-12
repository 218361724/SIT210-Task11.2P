// SMS Notifier (server)

import ms from 'ms';
import moment from 'moment-timezone';
import isDefined from '@talos-sdk/jsutil/is-defined';
import { Meteor } from 'meteor/meteor';
import { meteorSettings } from '../environment.js';
import { twilioClient } from './environment.js';
import SensorLogs from '../../api/sensor-logs/schema.js';

const { messagingServiceSid } = meteorSettings.twilio;
const { smsAlertContact, dangerLevel } = meteorSettings.public;

// Implement audible alarm health warning sms
let lastAlarmHealthSmsAt;
export async function sendAlarmHealthSms() {
  // Abort if previous alert was less than 30 minutes ago
  const at30MinutesAgo = moment().subtract(30, 'minutes').toDate();
  if (isDefined(lastAlarmHealthSmsAt) && moment(lastAlarmHealthSmsAt).isAfter(at30MinutesAgo)) {
    return;
  }
  lastAlarmHealthSmsAt = new Date();

  await twilioClient.messages.create({
    body: `Your smoke alarm is not functioning properly! Please check the Raspberry Pi
      client is switched on and can connect to the internet/your home LAN.`,
    from: messagingServiceSid,
    to: smsAlertContact,
  });
}

// Implement smoke alarm danger warning sms
let lastAlarmDangerSmsAt;
Meteor.setInterval(async () => {
  const at5MinsAgo = moment().subtract(5, 'minutes').toDate();

  // Abort when no readings in the last 5 minutes
  const rawSensorData = SensorLogs.find(
    { createdAt: { $gt: at5MinsAgo } },
    { sort: { createdAt: -1 }, limit: 3 },
  ).fetch();
  if (rawSensorData.length < 1) { return; }

  // Calculate moving average of levels to reduce noise
  const denoisedValues = { smoke: 0, co: 0 };
  rawSensorData.forEach((rawValue) => {
    denoisedValues.smoke += rawValue.smoke;
    denoisedValues.co += rawValue.co;
  });
  denoisedValues.smoke /= rawSensorData.length;
  denoisedValues.co /= rawSensorData.length;

  // Abort if danger threshold is not exceeded
  if (denoisedValues.smoke <= dangerLevel.smoke && denoisedValues.co <= dangerLevel.co) {
    return;
  }
  // Abort if previous alert was less than 5 minutes ago
  if (isDefined(lastAlarmDangerSmsAt) && moment(lastAlarmDangerSmsAt).isAfter(at5MinsAgo)) {
    return;
  }
  // Send SMS to target mobile
  lastAlarmDangerSmsAt = new Date();
  await twilioClient.messages.create({
    body: 'WARNING! Dangerous smoke/CO levels detected. Please evacuate premises safely.',
    from: messagingServiceSid,
    to: smsAlertContact,
  });
}, ms('1 minute'));
