// export {useRouter} from 'next/navigation'
import { useNavigate } from "react-router-dom";

export const useRouter = () => {
  const navigate = useNavigate();
  const router = {
    replace: navigate,
  };
  return router;
};
