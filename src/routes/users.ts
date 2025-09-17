import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

interface UserCreateBody {
  name: string;
  password: string;
  email: string;
}
export async function usersRoutes(app: FastifyInstance) {
  app.get("/", async (req, reply) => {
    const getUsers = await db.select().from("users").returning("*");
    reply.status(201).send(getUsers);
  });

  app.post<{ Body: UserCreateBody }>("/", async (req, reply) => {
    const { name, password, email } = req.body;
    let hashPassword = "";
    if (password) {
      hashPassword = bcrypt.hashSync(password, 10);
    }
    await db("users").insert({
      id: uuidv4(),
      username: name,
      password_hash: hashPassword,
      email: email,
    });

    reply.status(201).send("created users with successful");
  });
}
