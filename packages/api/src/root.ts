import { _exampleRouter } from "./routers/_example/router";
import { authRouter } from "./routers/auth";
import { englishRouter } from "./routers/english/router";
import { projectsRouter } from "./routers/projects/router";
import { tasksRouter } from "./routers/tasks/router";
import { wordsRouter } from "./routers/words/router";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  _example: _exampleRouter,
  auth: authRouter,
  words: wordsRouter,
  projects: projectsRouter,
  tasks: tasksRouter,
  english: englishRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
