const redis = require('redis');

// Create Redis client
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

// Handle connection events
let redisErrorLogged = false;

client.on('connect', () => {
  console.log('Connected to Redis');
  client.isConnected = true;
});

client.on('error', (err) => {
  client.isConnected = false;
});

client.on('ready', () => {
  client.isConnected = true;
});

client.on('end', () => {
  client.isConnected = false;
});

// Connect to Redis
(async () => {
  try {
    await client.connect();
  } catch (err) {
    console.log('Redis not available, running without cache');
    client.isConnected = false;
  }
})();

module.exports = client;