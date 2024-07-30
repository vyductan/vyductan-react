import { cx } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export * from "./types";

const clsm = (...inputs: Parameters<typeof cx>) => twMerge(cx(inputs));

export { clsm };
