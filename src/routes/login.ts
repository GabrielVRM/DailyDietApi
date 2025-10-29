import type { FastifyInstance } from "fastify";
import { db } from "../../db/index.js";
import z from "zod";
import { compare } from "bcrypt";
import { log } from "console";

interface UserSchema {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}
export function loginRoutes(app: FastifyInstance) {
  app.post("/", async (req, reply) => {
    try {
      const createSchemaTypeMeals = z.object({
        email: z.string(),
        password: z.string(),
      });
      const result = createSchemaTypeMeals.safeParse(req.body);

      const login: UserSchema = await db()
        .select("*")
        .from("user")
        .where({
          email: result.data?.email,
        })
        .returning("*")
        .first();
      let comparePassword;
      if (login) {
        comparePassword = await compare(
          result.data!.password,
          login.password_hash
        );
      }
      console.log(`comparação das senhas ${comparePassword}`);

      if (!login || !comparePassword) {
        throw new Error("email ou senha invalido ❌");
      }

      // Cookies para contexto entre requisições
      reply.cookie("auth", login.id, {
        path: "/",
        maxAge: 60,
      });

      reply.status(201).send("Authenticate whit success ✅");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        error.issues;
      }
      reply.status(400).send("Error " + error);
    }
  });
}
