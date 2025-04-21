// https://ant.design/docs/react/customize-theme#theme
import { cubicBezier } from "motion";

export const motionDurationFast = 0.1;
export const motionDurationMid = 0.2;
export const motionDurationSlow = 0.3;

export const motionEaseOutCirc = cubicBezier(0.08, 0.82, 0.17, 1);
export const motionEaseInOut = cubicBezier(0.645, 0.045, 0.355, 1);
