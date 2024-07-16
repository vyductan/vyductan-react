import type {
  RegisteredRouter,
  RoutePathsAutoComplete,
  UseNavigateResult,
} from "@tanstack/react-router";
import { useRouter } from "next/navigation";

export const useNavigate = <
  TDefaultFrom extends string = string,
>(_defaultOpts?: {
  from?: RoutePathsAutoComplete<RegisteredRouter["routeTree"], TDefaultFrom>;
}): UseNavigateResult<TDefaultFrom> => {
  const router = useRouter();
  const navigate: UseNavigateResult<TDefaultFrom> = async (params) => {
    const href = params.to;
    if (href) router.push(href);
  };
  return navigate;
};
