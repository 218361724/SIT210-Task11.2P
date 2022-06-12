// Entry-point (server)

// Setup environment
import '../environment.js'; // Common
import './environment.js'; // Server

// Register API
import '../register-api.js'; // Common
import './register-api.js'; // Server

// Run startup
import './mongo-indexes.js';
import './sms-notifier.js';
