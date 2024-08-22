import type {
  RegisteredRouter,
  UseNavigateResult,
} from "@tanstack/react-router";
import { useRouter } from "next/navigation";

export const useNavigate = <
  TDefaultFrom extends string = string,
>(_defaultOptions?: {
  from?: RegisteredRouter["routeTree"];
  // from?: RoutePathsAutoComplete<RegisteredRouter["routeTree"], TDefaultFrom>;
  //
}): UseNavigateResult<TDefaultFrom> => {
  const router = useRouter();
  const navigate: UseNavigateResult<TDefaultFrom> = async (parameters) => {
    const href = parameters.to;
    if (href) router.push(href);
  };
  return navigate;
};
