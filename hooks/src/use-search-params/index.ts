import { useSearchParams as rrdUseSearchParams } from "react-router";

export const useSearchParams = () => {
  const [searchParam] = rrdUseSearchParams();

  return searchParam;
};
