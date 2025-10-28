import fastify from "fastify";
import { usersRoutes } from "./routes/users.js";
import { mealsRoutes } from "./routes/meals.js";

const app = fastify();

app.register(usersRoutes, {
  prefix: "users",
});
app.register(mealsRoutes, {
  prefix: "meals",
});

const PORT = 3000;

try {
  app.listen({ port: PORT }).then(() => console.log("server is running!"));
} catch (err) {
  console.log(err);
  process.exit(1);
}
