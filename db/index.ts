import knex from "knex";
import type { Knex } from "knex";
import "dotenv/config";
import env from "../src/env/index.js";

export const config: Knex.Config = {
  client: "pg",
  version: "17.6",
  connection: {
    port: 5432,
    user: env.data?.USER!,
    password: env.data?.PASSWORD!,
    database: env.data?.DATABASE!,
  },
  migrations: {
    extension: "ts",
    directory: "./db/migrations",
  },
};
export const db = knex(config);
