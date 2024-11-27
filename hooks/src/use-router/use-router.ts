// export {useRouter} from 'next/navigation'
import { useNavigate } from "react-router-dom";

export const useRouter = () => {
  const navigate = useNavigate();
  const router = {
    push: navigate,
    replace: (url: URL | string) => navigate(url.toString(), { replace: true }),
  };
  return router;
};
