// Sensor logs collection: publications (server)

import validatedPublish from '@talos-sdk/meteor/validated-publish';
import SensorLogs from '../schema.js';

// -- Public access
// Dashboard
validatedPublish({
  name: 'sensor-logs.public.dashboard',
  validate: null,
  // Provide last 3 readings for moving average
  run: () => SensorLogs.find({}, {
    sort: { createdAt: -1 },
    limit: 3,
  }),
});
