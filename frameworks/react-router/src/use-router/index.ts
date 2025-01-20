import type { NavigateOptions } from "react-router";
import { useNavigate } from "react-router";

export const useRouter = () => {
  const navigate = useNavigate();

  const router = {
    push: (url: URL | string, options?: NavigateOptions) =>
      void navigate(url.toString(), options),
    replace: (url: URL | string, options?: NavigateOptions) =>
      void navigate(url.toString(), { replace: true, ...options }),
  };
  return router;
};
