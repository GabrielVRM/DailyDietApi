"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/server.ts
var import_fastify = __toESM(require("fastify"), 1);

// db/index.ts
var import_knex = __toESM(require("knex"), 1);
var import_config2 = require("dotenv/config");

// src/env/index.ts
var import_config = require("dotenv/config");
var import_zod = require("zod");
var envSchema = import_zod.z.object({
  DATABASE: import_zod.z.string(),
  USER: import_zod.z.string(),
  PASSWORD: import_zod.z.string(),
  PORT: import_zod.z.coerce.number().default(3e3)
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
var db = (0, import_knex.default)(config);

// src/routes/users.ts
var import_uuid = require("uuid");
var import_bcrypt = __toESM(require("bcrypt"), 1);
var import_zod2 = __toESM(require("zod"), 1);
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
        hashPassword = import_bcrypt.default.hashSync(password, 10);
      }
      await db("user").insert({
        id: (0, import_uuid.v4)(),
        username: name,
        password_hash: hashPassword,
        email
      });
      reply.status(201).send("created users with successful");
    } catch (error) {
      if (error instanceof import_zod2.default.ZodError) {
        console.log(error);
        error.issues;
      }
      reply.status(400).send("Error " + error.detail);
    }
  });
}

// src/routes/meals.ts
var import_uuid2 = require("uuid");
var import_zod3 = __toESM(require("zod"), 1);

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
      const createSchemaTypeMeals = import_zod3.default.object({
        description: import_zod3.default.string(),
        name: import_zod3.default.string(),
        isDiet: import_zod3.default.boolean()
      });
      const result = createSchemaTypeMeals.safeParse(req.body);
      if (result.error) {
        return reply.status(422).send({ message: "Dados inv\xE1lidos", errors: result.error.issues });
      }
      await db("meals").insert({
        id: (0, import_uuid2.v4)(),
        usuario_id: authUser,
        name: (_a2 = result.data) == null ? void 0 : _a2.name,
        description: (_b2 = result.data) == null ? void 0 : _b2.description,
        isDiet: (_c2 = result.data) == null ? void 0 : _c2.isDiet
      });
      reply.status(201).send("meals created with successful");
    } catch (error) {
      console.log(error);
      if (error instanceof import_zod3.default.ZodError) {
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
      const schemaBodyDeleteMeals = import_zod3.default.object({
        id: import_zod3.default.array(import_zod3.default.string())
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
var import_zod4 = __toESM(require("zod"), 1);
var import_bcrypt2 = require("bcrypt");
function loginRoutes(app2) {
  app2.post("/", async (req, reply) => {
    var _a2;
    try {
      const createSchemaTypeMeals = import_zod4.default.object({
        email: import_zod4.default.string(),
        password: import_zod4.default.string()
      });
      const result = createSchemaTypeMeals.safeParse(req.body);
      const login = await db().select("*").from("user").where({
        email: (_a2 = result.data) == null ? void 0 : _a2.email
      }).returning("*").first();
      let comparePassword;
      if (login) {
        comparePassword = await (0, import_bcrypt2.compare)(
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
      if (error instanceof import_zod4.default.ZodError) {
        error.issues;
      }
      reply.status(400).send("Error " + error);
    }
  });
}

// src/server.ts
var import_cookie = __toESM(require("@fastify/cookie"), 1);
var app = (0, import_fastify.default)();
app.register(import_cookie.default);
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
