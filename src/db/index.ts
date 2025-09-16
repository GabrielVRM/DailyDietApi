import knex from "knex";
import type { Knex } from "knex";

export const config: Knex.Config = {
  client: "pg",
  version: "17.6",
  connection: {
    port: 5432,
    user: "admin",
    password: "admin@123",
    database: "dailydietapi",
  },
  migrations: {
    extension: "ts",
    directory: "./src/db/migrations",
  },
};
export const db = knex(config);
