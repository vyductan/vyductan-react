// export interface InputFocusOptions extends FocusOptions {
//   cursor?: "start" | "end" | "all";
// }
// export interface InputRef {
//   focus: (options?: InputFocusOptions) => void;
//   blur: () => void;
//   setSelectionRange: (
//     start: number,
//     end: number,
//     direction?: "forward" | "backward" | "none",
//   ) => void;
//   select: () => void;
//   input: HTMLInputElement | null;
//   nativeElement: HTMLElement | null;
// }

export type InputRef = HTMLInputElement;
