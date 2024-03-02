import type { CxOptions } from "class-variance-authority";
import { cx } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const clsm = (...inputs: CxOptions) => twMerge(cx(inputs));

export { clsm };
