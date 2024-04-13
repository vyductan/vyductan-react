import { cx } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const clsm = (...inputs: Parameters<typeof cx>) => twMerge(cx(inputs));

export { clsm };
