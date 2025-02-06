import type { TRPCRouterRecord } from "@trpc/server";

import { invalidateSessionToken } from "@acme/auth";

import { protectedProcedure, publicProcedure } from "../trpc";

export const authRouter = {
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  getSecretMessage: protectedProcedure.query(() => {
    return "you can see this secret message!";
  }),
  signOut: protectedProcedure.mutation(async (options) => {
    if (!options.ctx.token) {
      return { success: false };
    }
    await invalidateSessionToken(options.ctx.token);
    return { success: true };
  }),
} satisfies TRPCRouterRecord;
