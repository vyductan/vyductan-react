import type {
  AnyRouter,
  NavigateOptions,
  RegisteredRouter,
  RoutePaths,
} from "@tanstack/react-router";
import { useRouter as tanstackUseRouter } from "@tanstack/react-router";

export const useRouter = <TRouter extends AnyRouter = RegisteredRouter>() => {
  const { navigate, history } = tanstackUseRouter<TRouter>();

  // opts: NavigateOptions<TRouter, TFrom, TTo, TMaskFrom, TMaskTo>
  const router = {
    push: async <
      TRouter extends RegisteredRouter,
      TTo extends string | undefined,
      TFrom extends RoutePaths<TRouter["routeTree"]> | string = string,
      TMaskFrom extends RoutePaths<TRouter["routeTree"]> | string = TFrom,
      TMaskTo extends string = "",
    >(
      options: NavigateOptions<TRouter, TFrom, TTo, TMaskFrom, TMaskTo>,
    ) => await navigate(options),
    replace: async <
      TRouter extends RegisteredRouter,
      TTo extends string | undefined,
      TFrom extends RoutePaths<TRouter["routeTree"]> | string = string,
      TMaskFrom extends RoutePaths<TRouter["routeTree"]> | string = TFrom,
      TMaskTo extends string = "",
    >(
      options: NavigateOptions<TRouter, TFrom, TTo, TMaskFrom, TMaskTo>,
    ) => await navigate({ replace: true, ...options }),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    back: async () => await history.go(-1),
  };
  return router;
};
