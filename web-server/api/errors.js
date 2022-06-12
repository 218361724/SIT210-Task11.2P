// API errors (common)

import isDefined from '@talos-sdk/jsutil/is-defined';
import SimpleSchema from 'simpl-schema';
import find from 'lodash.find';

// Application errors
const applicationErrors = {
  internal: 'Something unexpected went wrong.',
};
export default applicationErrors;

// -- Schema validation errors

/* Override simple schema URL regex (default is much too restrictive e.g. will reject
  'example.com' without protocol which will suprise many users) */
const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/;

const regExpMessagesEn = [
  // Default
  { exp: SimpleSchema.RegEx.Email, text: () => 'Must be a valid email address' },
  { exp: SimpleSchema.RegEx.EmailWithTLD, text: () => 'Must be a valid email address' },
  { exp: SimpleSchema.RegEx.Domain, text: () => 'Must be a valid domain' },
  { exp: SimpleSchema.RegEx.WeakDomain, text: () => 'Must be a valid domain' },
  { exp: SimpleSchema.RegEx.IP, text: () => 'Must be a valid IPv4 or IPv6 address' },
  { exp: SimpleSchema.RegEx.IPv4, text: () => 'Must be a valid IPv4 address' },
  { exp: SimpleSchema.RegEx.IPv6, text: () => 'Must be a valid IPv6 address' },
  { exp: urlRegex, text: () => 'Must be a valid URL (e.g https://example.com)' },
  { exp: SimpleSchema.RegEx.Id, text: () => 'Must be a valid alphanumeric ID' },
  { exp: SimpleSchema.RegEx.ZipCode, text: () => 'Must be a valid ZIP code' },
  { exp: SimpleSchema.RegEx.Phone, text: () => 'Must be a valid phone number' },
  // Custom
  { exp: /^\S*$/, text: (label) => `${label} must not contain spaces` },
];

SimpleSchema.setDefaultMessages({
  messages: {
    en: {
      ...applicationErrors,
      genericInvalid: '{{label}} is invalid',
      passwordMismatch: 'Passwords do not match',
      datetimeFuture: 'Must be in the future',
      dateAfterStart: 'Must be after start',
      // Simpleschema defaults
      required: 'Required',
      minString: 'Must be at least {{min}} characters',
      maxString: 'Cannot exceed {{max}} characters',
      minNumber: 'Must be at least {{min}}',
      maxNumber: 'Cannot exceed {{max}}',
      minNumberExclusive: 'Must be greater than {{min}}',
      maxNumberExclusive: 'Must be less than {{max}}',
      minDate: 'Cannot be before {{max}}',
      maxDate: 'Cannot be after {{max}}',
      badDate: 'Must be a valid date',
      minCount: 'You must specify at least {{minCount}}',
      maxCount: 'You cannot specify more than {{maxCount}}',
      noDecimal: 'Must be a whole amount (no decimal)',
      notAllowed: 'Not an allowed value',
      expectedType: 'Must be of type {{dataType}}',
      regEx({ label, regExp }) {
        // Lookup predefined text for expression
        let matchingMessage;
        if (isDefined(regExp)) {
          matchingMessage = find(
            regExpMessagesEn,
            (message) => message.exp && message.exp.toString() === regExp,
          );
        }
        // Generate message with matching predefined text
        if (isDefined(matchingMessage)) { return matchingMessage.text(label); }
        // Fallback to generic text
        return 'Failed regular expression validation';
      },
    },
  },
});
