import type { FastifyInstance } from "fastify";
import { db } from "../../db/index.js";
import { v4 as uuidv4 } from "uuid";
import z, { string, success } from "zod";

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

  app.delete("/:id", async (req, reply) => {
    try {
      let authUser = req.cookies.auth;

      const { id } = req.params;
      if (!authUser) {
        throw new Error(
          "Você precisa estar logado, por favor faça o login! ❌"
        );
      }
      const meals = await db("meals")
        .where({ id: id, usuario_id: authUser })
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
