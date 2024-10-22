export type WaveAllowedComponent = "Button" | "Checkbox" | "Radio";
export type ShowWaveEffect = (
  element: HTMLElement,
  info: {
    className: string;
    component?: WaveAllowedComponent;
    event: MouseEvent;
  },
) => void;

export type ShowWave = (event: MouseEvent) => void;
