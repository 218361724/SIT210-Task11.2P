// Template helpers

import truncate from 'lodash.truncate';
import moment from 'moment-timezone';
import isEqual from 'lodash.isequal';
import { Blaze } from 'meteor/blaze';
import { Template } from 'meteor/templating';
import { formatTime, formatDate } from '../api/utilities.js';
import { currentEnv, currentTimezone } from '../startup/environment.js';

export const getInstance = ($selection) => Blaze.getView($selection[0]).templateInstance();

// Debug helpers
if (currentEnv === 'dev') {
  // eslint-disable-next-line no-console
  Template.registerHelper('see', (value) => console.log('Template debug: ', value));
}

// Data helpers
Template.registerHelper('now', () => new Date());
Template.registerHelper('currentEnv', currentEnv);

// Formatting helpers
Template.registerHelper('formatDate', formatDate);
Template.registerHelper('formatTime', formatTime);
Template.registerHelper('formatDateTime', (date) => moment(date).tz(currentTimezone).format('MMMM Do YYYY [at] h:mma'));
Template.registerHelper('formatDateCustom', (date, format) => moment(date).tz(currentTimezone).format(format));
Template.registerHelper('formatDateRelative', (date) => moment(date).fromNow());
Template.registerHelper('formatDateDiff', (from, to, unit) => moment(from).diff(to, unit));
Template.registerHelper('truncate', (text, length) => truncate(text, { length }));
// Date helpers
Template.registerHelper('dateIsAfter', (before, after) => moment(before).isAfter(after));
Template.registerHelper('dateIsBetween', (date, start, end) => moment(date).isBetween(start, end));

// Array helpers
Template.registerHelper('getElement', (array, index) => array[index]);
Template.registerHelper('getFirstElement', (array) => array[0]);
Template.registerHelper('isLastElement', (index, array) => index === (array.length - 1));
Template.registerHelper('includes', (array, item) => array && array.includes(item));
Template.registerHelper('hasElements', (...arrays) => {
  arrays.pop(); // Drop Spacebars.kw to get provided arrays
  return arrays.some((array) => Array.isArray(array) && array.length > 0);
});

// Logic helpers
Template.registerHelper('bool', (a) => Boolean(a));
Template.registerHelper('not', (a) => Boolean(!a));
Template.registerHelper('and', (a, b) => Boolean(a && b));
Template.registerHelper('or', (a, b) => Boolean(a || b));
Template.registerHelper('gt', (a, b) => Number(a) > Number(b));
Template.registerHelper('equals', (a, b) => a === b);
Template.registerHelper('deepEquals', (a, b) => isEqual(a, b));
Template.registerHelper('emptyFunc', () => () => {});

// Math helpers
Template.registerHelper('add', (a, b) => Number(a) + Number(b));
Template.registerHelper('subtract', (a, b) => Number(a) - Number(b));
