import "dotenv/config";

import { number, z } from "zod";

const envSchema = z.object({
  DATABASE: z.string(),
  USER: z.string(),
  PASSWORD: z.string(),
  PORT: z.coerce.number().default(3000),
});

const env = envSchema.safeParse(process.env);

if (env.success === false) {
  throw new Error("Invalid environment variables 🤬 " + env.error.message);
}
export default env;
