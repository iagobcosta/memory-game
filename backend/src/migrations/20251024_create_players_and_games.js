/**
 * Migration: create players and games tables
 */
exports.up = async function (knex) {
  await knex.schema.createTable('players', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable().unique();
    table.string('password_hash').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('games', (table) => {
    table.increments('id').primary();
    table.integer('player_id').unsigned().references('id').inTable('players').onDelete('CASCADE');
    table.integer('moves').notNullable();
    table.integer('time_elapsed').notNullable();
    table.integer('score').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('games');
  await knex.schema.dropTableIfExists('players');
};
