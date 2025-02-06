import { useParams as rrUseParams } from "react-router";

type Params = Record<string, string | string[]>;

export const useParams = <T extends Params = Params>(): T => {
  const params = rrUseParams();
  return params as T;
};
