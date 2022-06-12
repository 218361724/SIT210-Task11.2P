// Mongo indexes (server)

import SensorLogs from '../../api/sensor-logs/schema.js';

SensorLogs.createIndex({ createdAt: 1 });
