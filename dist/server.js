// src/server.ts
import fastify from "fastify";

// db/index.ts
import knex from "knex";
import "dotenv/config";

// src/env/index.ts
import "dotenv/config";
import { z } from "zod";
var envSchema = z.object({
  DATABASE: z.string(),
  USER: z.string(),
  PASSWORD: z.string(),
  PORT: z.coerce.number().default(3e3)
});
var env = envSchema.safeParse(process.env);
if (env.success === false) {
  throw new Error("Invalid environment variables \u{1F92C} " + env.error.message);
}
var env_default = env;

// db/index.ts
var _a, _b, _c;
var config = {
  client: "pg",
  version: "17.6",
  connection: {
    port: 5432,
    user: (_a = env_default.data) == null ? void 0 : _a.USER,
    password: (_b = env_default.data) == null ? void 0 : _b.PASSWORD,
    database: (_c = env_default.data) == null ? void 0 : _c.DATABASE
  },
  migrations: {
    extension: "ts",
    directory: "./db/migrations"
  }
};
var db = knex(config);

// src/routes/users.ts
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import z2 from "zod";
async function usersRoutes(app2) {
  app2.get("/", async (req, reply) => {
    const getUsers = await db.select().from("user").returning("*");
    reply.status(201).send(getUsers);
  });
  app2.get("/:id", async (req, reply) => {
    const { id } = req.params;
    if (!id) {
      throw new Error("erro: por favor insira ");
    }
    const getUsers = await db.select().where("id", id).from("user").returning("*");
    reply.status(201).send(getUsers);
  });
  app2.post("/", async (req, reply) => {
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
        email
      });
      reply.status(201).send("created users with successful");
    } catch (error) {
      if (error instanceof z2.ZodError) {
        console.log(error);
        error.issues;
      }
      reply.status(400).send("Error " + error.detail);
    }
  });
}

// src/routes/meals.ts
import { v4 as uuidv42 } from "uuid";
import z3 from "zod";

// src/middlewares/check-session-id-exists.ts
function checkSessionUser(req, reply, done) {
  let authUser = req.cookies.auth;
  if (!authUser) {
    return reply.status(401).send("Voc\xEA precisa estar logado, por favor fa\xE7a o login! \u274C");
  }
  done();
}

// src/routes/meals.ts
function mealsRoutes(app2) {
  app2.post("/", { preHandler: checkSessionUser }, async (req, reply) => {
    var _a2, _b2, _c2;
    try {
      let authUser = req.cookies.auth;
      const createSchemaTypeMeals = z3.object({
        description: z3.string(),
        name: z3.string(),
        isDiet: z3.boolean()
      });
      const result = createSchemaTypeMeals.safeParse(req.body);
      if (result.error) {
        return reply.status(422).send({ message: "Dados inv\xE1lidos", errors: result.error.issues });
      }
      await db("meals").insert({
        id: uuidv42(),
        usuario_id: authUser,
        name: (_a2 = result.data) == null ? void 0 : _a2.name,
        description: (_b2 = result.data) == null ? void 0 : _b2.description,
        isDiet: (_c2 = result.data) == null ? void 0 : _c2.isDiet
      });
      reply.status(201).send("meals created with successful");
    } catch (error) {
      console.log(error);
      if (error instanceof z3.ZodError) {
        console.log(error);
        error.issues;
      }
      reply.status(400).send("Error " + error);
    }
  });
  app2.get("/", { preHandler: checkSessionUser }, async (req, reply) => {
    let authUser = req.cookies.auth;
    const meals = await db.select("*").from("meals").where({ usuario_id: authUser }).returning("*");
    reply.status(201).send({ meals });
  });
  app2.get("/:id", { preHandler: checkSessionUser }, async (req, reply) => {
    let authUser = req.cookies.auth;
    const { id } = req.params;
    console.log({ id, authUser });
    const users = await db.select("*").from("meals").where({ id, usuario_id: authUser }).returning("*");
    reply.status(201).send({ users });
  });
  app2.get("/metrics", { preHandler: checkSessionUser }, async (req, reply) => {
    let authUser = req.cookies.auth;
    console.log({ authUser });
    const mealsMetrics = await db.select("*").from("meals").where({ usuario_id: authUser }).returning("*");
    const metrics = {
      total: 0,
      isDiet: 0,
      isNotDiet: 0,
      isVeryGoodSequencia: 0
    };
    mealsMetrics.reduce(
      (acc, current) => current.isDiet === true ? metrics.isDiet++ : metrics.isNotDiet++,
      0
    );
    let n = 0;
    mealsMetrics.map((current, index, array) => {
      const previous = array[index - n];
      n = n === 0 ? n + 1 : n;
      if (previous) {
        if (previous.isDiet === true) {
          console.log(
            `Anterior: ${previous.isDiet} id-${index}, Atual: ${current.isDiet}  id-${index}`
          );
          metrics.isVeryGoodSequencia++;
        } else if (current.isDiet === false) {
          return;
        }
      }
    });
    metrics.total += metrics.isDiet + metrics.isNotDiet;
    reply.status(201).send({ mealsMetrics, metrics });
  });
  app2.put("/:id", { preHandler: checkSessionUser }, async (req, reply) => {
    let authUser = req.cookies.auth;
    const { id } = req.params;
    const { name, description, isDiet } = req.body;
    const users = await db("meals").where({ id, usuario_id: authUser }).update({ name, description, isDiet });
    reply.status(201).send({ users });
  });
  app2.delete("/", { preHandler: checkSessionUser }, async (req, reply) => {
    try {
      let authUser = req.cookies.auth;
      const schemaBodyDeleteMeals = z3.object({
        id: z3.array(z3.string())
      });
      const result = schemaBodyDeleteMeals.safeParse(req.body);
      if (!result.success) {
        return reply.status(400).send({ error: result.error });
      }
      console.log(result.data.id);
      const meals = await db("meals").where({ usuario_id: authUser }).whereIn("id", result.data.id).del();
      if (!meals) {
        throw new Error("essa refei\xE7\xE3o n\xE3o existe");
      }
      reply.status(201).send("refei\xE7\xE3o foi deletada com sucesso \u2705");
    } catch (erro) {
      reply.status(400).send(erro);
    }
  });
}

// src/routes/login.ts
import z4 from "zod";
import { compare } from "bcrypt";
function loginRoutes(app2) {
  app2.post("/", async (req, reply) => {
    var _a2;
    try {
      const createSchemaTypeMeals = z4.object({
        email: z4.string(),
        password: z4.string()
      });
      const result = createSchemaTypeMeals.safeParse(req.body);
      const login = await db().select("*").from("user").where({
        email: (_a2 = result.data) == null ? void 0 : _a2.email
      }).returning("*").first();
      let comparePassword;
      if (login) {
        comparePassword = await compare(
          result.data.password,
          login.password_hash
        );
      }
      console.log(`compara\xE7\xE3o das senhas ${comparePassword}`);
      if (!login || !comparePassword) {
        throw new Error("email ou senha invalido \u274C");
      }
      reply.cookie("auth", login.id, {
        path: "/",
        maxAge: 60 * 60
      });
      reply.status(201).send("Authenticate whit success \u2705");
    } catch (error) {
      if (error instanceof z4.ZodError) {
        error.issues;
      }
      reply.status(400).send("Error " + error);
    }
  });
}

// src/server.ts
import fastifyCookie from "@fastify/cookie";
var app = fastify();
app.register(fastifyCookie);
app.register(loginRoutes, {
  prefix: "auth"
});
app.register(usersRoutes, {
  prefix: "users"
});
app.register(mealsRoutes, {
  prefix: "meals"
});
var PORT = 3e3;
try {
  app.listen({ port: PORT }).then(() => console.log("server is running!"));
} catch (err) {
  console.log(err);
  process.exit(1);
}
