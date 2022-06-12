// API utilities (common)

import isDefined from '@talos-sdk/jsutil/is-defined';
import moment from 'moment-timezone';
import { currentTimezone } from '../startup/environment.js';

// Formatting helpers
export const timeStringFormat = 'h:mma';
export const dateStringFormat = 'DD/MM/YY';
export const formatDate = (date) => {
  if (!isDefined(date)) { return null; }
  return moment(date).tz(currentTimezone).format(dateStringFormat);
};
export const formatTime = (date) => {
  if (!isDefined(date)) { return null; }
  return moment(date).tz(currentTimezone).format(timeStringFormat);
};

export const autoValueMethods = {
  createdAt() {
    // Set only on insert
    const atNow = new Date();
    if (this.isInsert) { return atNow; }
    if (this.isUpsert) { return { $setOnInsert: atNow }; }
    // Prevent user from supplying their own value
    this.unset();
    return undefined;
  },
};
