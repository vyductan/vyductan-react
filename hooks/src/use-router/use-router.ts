// export {useRouter} from 'next/navigation'
import { useNavigate } from "react-router";

export const useRouter = () => {
  const navigate = useNavigate();
  const router = {
    push: (url: URL | string) => void navigate(url.toString()),
    replace: (url: URL | string) =>
      void navigate(url.toString(), { replace: true }),
  };
  return router;
};
