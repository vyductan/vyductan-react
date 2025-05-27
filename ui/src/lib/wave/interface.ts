export const TARGET_CLS = `wave-target`;

export type ShowWaveEffect = (
  element: HTMLElement,
  info: {
    className: string;
    component?: WaveComponent;
    event: MouseEvent;
  },
) => void;

export type ShowWave = (event: MouseEvent) => void;

export type WaveComponent = "Tag" | "Button" | "Checkbox" | "Radio" | "Switch";

export interface WaveConfig {
  /**
   * @descEN Whether to use wave effect. If it needs to close, set to `false`.
   * @default true
   */
  disabled?: boolean;
  /**
   * @descEN Customized wave effect.
   */
  showEffect?: ShowWaveEffect;
}
