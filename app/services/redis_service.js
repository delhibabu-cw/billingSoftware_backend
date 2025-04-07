/* eslint-disable no-undef */
const { asyncRedis } = require('./imports');
const config = require('../config/config');

const client = asyncRedis.createClient({
  port: 6379,
  host: '127.0.0.1',
});
console.log('config-------', config.redis_options.port);

if (config.redis_options.password) {
  client.auth(config.redis_options.password, (err, resp) => {
    if (err) {
      console.log('\nRedis-Auth-err:', err);
    }
    console.log('\n redis auth success...', resp);
  });
}

client.on('connect', () => {
  console.log('client connected to redis');
});

client.on('ready', () => {
  console.log('redis client is ready to use');
});

client.on('error', (err) => {
  console.log('redis error', err);
});

client.on('end', () => {
  console.log('redis client disconnected');
});

process.on('SIGINT', () => {
  console.log('process.on SIGINT');
  client.quit();
  process.exit(0);
});

module.exports = client;
