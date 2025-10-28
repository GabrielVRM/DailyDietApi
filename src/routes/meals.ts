import type { FastifyInstance } from "fastify";
import { db } from "../../db/index.js";
import { v4 as uuidv4 } from "uuid";
import z, { string } from "zod";

export function mealsRoutes(app: FastifyInstance) {
  app.post("/", async (req, reply) => {
    const createSchemaTypeMeals = z.object({
      description: z.string(),
      name: z.string(),
    });

    const { description, name } = createSchemaTypeMeals.parse(req.body);

    await db("meals").insert({
      id: uuidv4(),
      usuario_id: "67fd1c9d-36bb-4a6c-86dc-409269a741da",
      name: name,
      description: description,
    });

    console.log("deu certo");
  });
}
