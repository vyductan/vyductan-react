import { useSearchParams as rrdUseSearchParams } from "react-router";

export const useSearchParams = () => {
  const [searchparam] = rrdUseSearchParams();

  return searchparam;
};
