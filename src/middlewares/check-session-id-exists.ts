import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export function checkSessionUser(
  req: FastifyRequest,
  reply: FastifyReply,
  done: any
) {
  let authUser = req.cookies.auth;

  if (!authUser) {
    return reply
      .status(401)
      .send("Você precisa estar logado, por favor faça o login! ❌");
  }

  done();
}
