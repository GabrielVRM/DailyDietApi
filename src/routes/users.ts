import type { FastifyInstance } from "fastify";
import { db } from "../../db/index.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import z from "zod";

interface UserCreateBody {
  name: string;
  password: string;
  email: string;
}
export async function usersRoutes(app: FastifyInstance) {
  app.get("/", async (req, reply) => {
    const getUsers = await db.select().from("user").returning("*");
    reply.status(201).send(getUsers);
  });

  app.get("/:id", async (req, reply) => {
    const { id }: any = req.params;
    if (!id) {
      throw new Error("erro: por favor insira ");
    }
    const getUsers = await db
      .select()
      .where("id", id)
      .from("user")
      .returning("*");
    reply.status(201).send(getUsers);
  });

  app.post<{ Body: UserCreateBody }>("/", async (req, reply) => {
    try {
      const { name, password, email } = req.body;
      let hashPassword = "";
      if (password) {
        hashPassword = bcrypt.hashSync(password, 10);
      }
      await db("user").insert({
        id: uuidv4(),
        username: name,
        password_hash: hashPassword,
        email: email,
      });

      reply.status(201).send("created users with successful");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        console.log(error);
        error.issues;
      }
      reply.status(400).send("Error " + error.detail);
    }
  });
}
