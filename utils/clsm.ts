import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const clsm = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export default clsm;
