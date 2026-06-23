// Ambient module declarations needed when emitting declarations from src
// (rootDir is ./src, so the root-level types.d.ts is out of scope here).
// Empty ambient declarations merge with the root types.d.ts during typecheck.
declare module "*.css";
declare module "swiper/css";
declare module "swiper/css/*";
