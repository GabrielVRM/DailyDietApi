import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("meals", (table) => {
    table.uuid("id").primary();
    table.uuid("usuario_id").notNullable().references("id").inTable("user");
    table.text("name").notNullable();
    table.text("description").notNullable();
    table.boolean("isDiet").notNullable().defaultTo(false);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("meals");
}
