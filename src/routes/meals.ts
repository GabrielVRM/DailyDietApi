import type { FastifyInstance } from "fastify";
import { db } from "../../db/index.js";
import { v4 as uuidv4 } from "uuid";
import z, { array, string, success } from "zod";

export function mealsRoutes(app: FastifyInstance) {
  app.post("/", async (req, reply) => {
    try {
      let authUser = req.cookies.auth;
      if (!authUser) {
        throw new Error(
          "Você precisa estar logado, por favor faça o login! ❌"
        );
      }
      console.log(authUser);
      const createSchemaTypeMeals = z.object({
        description: z.string(),
        name: z.string(),
        isDiet: z.boolean(),
      });
      const result = createSchemaTypeMeals.safeParse(req.body);
      if (result.error) {
        console.log("entrei");
      }
      await db("meals").insert({
        id: uuidv4(),
        usuario_id: authUser,
        name: result.data?.name,
        description: result.data?.description,
        isDiet: result.data?.isDiet,
      });
      reply.status(201).send("meals created with successful");
    } catch (error) {
      console.log(error);
      if (error instanceof z.ZodError) {
        console.log(error);
        error.issues;
      }
      reply.status(400).send("Error " + error);
    }
  });

  app.get("/", async (req, reply) => {
    let authUser = req.cookies.auth;
    if (!authUser) {
      throw new Error("Você precisa estar logado, por favor faça o login! ❌");
    }
    const meals = await db
      .select("*")
      .from("meals")
      .where({ usuario_id: authUser })
      .returning("*");

    reply.status(201).send({ meals });
  });

  app.get("/:id", async (req, reply) => {
    let authUser = req.cookies.auth;
    if (!authUser) {
      throw new Error("Você precisa estar logado, por favor faça o login! ❌");
    }
    const { id } = req.params;
    console.log({ id, authUser });
    const users = await db
      .select("*")
      .from("meals")
      .where({ id: id, usuario_id: authUser })
      .returning("*");

    reply.status(201).send({ users });
  });
  app.get("/metrics", async (req, reply) => {
    let authUser = req.cookies.auth;
    if (!authUser) {
      throw new Error("Você precisa estar logado, por favor faça o login! ❌");
    }

    console.log({ authUser });
    const mealsMetrics = await db
      .select("*")
      .from("meals")
      .where({ usuario_id: authUser })
      .returning("*");

    const metrics = {
      total: 0,
      isDiet: 0,
      isNotDiet: 0,
    };
    mealsMetrics.reduce(
      (acc, current) =>
        current.isDiet === true ? metrics.isDiet++ : metrics.isNotDiet++,
      0
    );
    let n = 0;
    mealsMetrics.map((current, index, array) => {
      const previous = array[index - n]; // pega o anterior, se existir
      n = n === 0 ? n + 1 : n;

      if (previous) {
        console.log(`Anterior: ${previous.isDiet}, Atual: ${current.isDiet}`);
      }
    });

    metrics.total += metrics.isDiet + metrics.isNotDiet;
    reply.status(201).send({ mealsMetrics, metrics });
  });
  app.put("/:id", async (req, reply) => {
    let authUser = req.cookies.auth;

    const { id } = req.params;
    const { name, description, isDiet } = req.body;
    console.log(name);
    if (!authUser) {
      throw new Error("Você precisa estar logado, por favor faça o login! ❌");
    }
    const users = await db("meals")
      .where({ id: id, usuario_id: authUser })
      .update({ name, description, isDiet });

    reply.status(201).send({ users });
  });

  app.delete("/", async (req, reply) => {
    try {
      let authUser = req.cookies.auth;

      const schemaBodyDeleteMeals = z.object({
        id: z.array(z.string()),
      });

      const result = schemaBodyDeleteMeals.safeParse(req.body);

      if (!result.success) {
        return reply.status(400).send({ error: result.error });
      }
      console.log(result.data.id);
      if (!authUser) {
        throw new Error(
          "Você precisa estar logado, por favor faça o login! ❌"
        );
      }
      const meals = await db("meals")
        .where({ usuario_id: authUser })
        .whereIn("id", result.data.id)
        .del();
      console.log(meals);
      if (!meals) {
        throw new Error("essa refeição não existe");
      }
      reply.status(201).send("refeição foi deletada com sucesso ✅");
    } catch (erro) {
      reply.status(400).send(erro);
    }
  });
}
