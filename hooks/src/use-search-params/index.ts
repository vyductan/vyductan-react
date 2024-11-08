import { useSearchParams as rrdUseSearchParams } from "react-router-dom";

export const useSearchParams = () => {
  const [searchparam] = rrdUseSearchParams();

  return searchparam;
};
