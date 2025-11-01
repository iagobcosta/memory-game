/**
 * Migration: create refresh_tokens table
 */
exports.up = async function (knex) {
  await knex.schema.createTable('refresh_tokens', (table) => {
    table.increments('id').primary();
    table.text('token').notNullable().unique();
    table.integer('player_id').unsigned().notNullable().references('id').inTable('players').onDelete('CASCADE');
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('refresh_tokens');
};
