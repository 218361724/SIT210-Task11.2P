// Body template

import moment from 'moment-timezone';
import isDefined from '@talos-sdk/jsutil/is-defined';
import { Tracker } from 'meteor/tracker';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';
import { meteorSettings } from '../startup/environment.js';
import SensorLogs from '../api/sensor-logs/schema.js';

const { dangerLevel } = meteorSettings.public;

Template.body.onCreated(function () {
  const templateInstance = this;

  // Ensure loading takes at least 200ms to prevent flicker
  templateInstance.noFlicker = new ReactiveVar(false);
  Meteor.setTimeout(() => templateInstance.noFlicker.set(true), 200);

  // Fetch sensor logs data
  templateInstance.subscribe('sensor-logs.public.dashboard');
});

Template.body.helpers({
  isReady: () => {
    const templateInstance = Template.instance();
    return templateInstance.noFlicker.get() && templateInstance.subscriptionsReady();
  },
  lastReadingAt: () => {
    const lastReading = SensorLogs.findOne({}, { sort: { createdAt: -1 } });

    /* Refresh in 1 minute - handles scenario where sensor stops
      working or is disconnected. */
    Meteor.setTimeout(() => {
      if (!isDefined(Tracker.currentComputation)) { return; }
      Tracker.currentComputation.invalidate();
    }, 60000);

    return lastReading.createdAt;
  },
  currentSensorData: () => {
    // Filter out any readings older than 5m ago
    const at5MinsAgo = moment().subtract(5, 'minutes').toDate();
    const rawSensorData = SensorLogs.find(
      { createdAt: { $gt: at5MinsAgo } },
      { sort: { createdAt: -1 } },
    ).fetch();

    // Abort when no fresh data
    if (rawSensorData.length < 1) { return false; }

    // Calculate moving averages to reduce sensor noise
    const denoisedValues = { smoke: 0, co: 0 };
    rawSensorData.forEach((rawValue) => {
      denoisedValues.smoke += rawValue.smoke;
      denoisedValues.co += rawValue.co;
    });
    denoisedValues.smoke = (denoisedValues.smoke / rawSensorData.length).toFixed(3);
    denoisedValues.co = (denoisedValues.co / rawSensorData.length).toFixed(3);

    // Calculate alarm status based on danger thresholds
    denoisedValues.isSmokeDanger = denoisedValues.smoke >= dangerLevel.smoke;
    denoisedValues.isCoDanger = denoisedValues.co >= dangerLevel.co;

    /* Recompute data in 30 seconds - handles scenario where sensor stops
     working or is disconnected */
    Meteor.setTimeout(() => {
      if (!isDefined(Tracker.currentComputation)) { return; }
      Tracker.currentComputation.invalidate();
    }, 30000);

    return denoisedValues;
  },
});
