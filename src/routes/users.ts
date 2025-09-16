import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";

export async function usersRoutes(app: FastifyInstance) {
  app.get("/", async (req, reply) => {
    const teste = await db.select().from("users").returning("*");
    reply.status(201).send(teste);
  });

  app.post("/", async (req, reply) => {
    const teste = await db.select().from("users").returning("*");
    reply.status(201).send(teste);
  });
}
