const Knex = require('knex');
const { parse } = require('pg-connection-string');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;
let config;
if (databaseUrl) {
  const parsed = parse(databaseUrl);
  config = {
    client: 'pg',
    connection: {
      host: parsed.host,
      port: parsed.port,
      user: parsed.user,
      password: parsed.password,
      database: parsed.database,
      ssl: parsed.ssl
    },
    pool: { min: 0, max: 10 }
  };
} else {
  config = {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'db',
      user: process.env.DB_USER || 'memory_user',
      password: process.env.DB_PASS || 'memory_pass',
      database: process.env.DB_NAME || 'memory_game'
    },
    pool: { min: 0, max: 10 }
  };
}

module.exports = Knex(config);
