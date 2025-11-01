#!/bin/sh
set -e

echo "Running knex migrations..."
npx knex migrate:latest --knexfile src/config/knexfile.js

echo "Running knex seeds..."
npx knex seed:run --knexfile src/config/knexfile.js

echo "Starting server..."
node src/server.js
