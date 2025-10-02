import type { TooltipPlacement } from "../tooltip";
import type { Color } from "./color";

export type ColorFormat = "hex" | "rgb" | "hsl";
export type ColorPickerSize = "small" | "middle" | "large";
export type ColorPickerTrigger = "click" | "hover";

export type TriggerPlacement = TooltipPlacement; // Alias, to prevent breaking changes.

export interface ColorPickerProps {
  /**
   * The current color value
   */
  value?: Color;

  /**
   * Default color value
   */
  defaultValue?: Color;

  /**
   * Callback when color changes
   */
  onChange?: (color?: Color) => void;

  /**
   * Callback when popover open state changes
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Whether the popover is open (controlled)
   */
  open?: boolean;

  /**
   * Whether the color picker is disabled
   */
  disabled?: boolean;

  /**
   * Size of the color picker
   */
  size?: ColorPickerSize;

  /**
   * Color format for display
   */
  format?: ColorFormat;

  /**
   * Whether to show text input
   */
  showText?: boolean;

  /**
   * Whether to allow clearing the color
   */
  allowClear?: boolean;

  /**
   * Preset colors
   */
  presets?: string[];

  /**
   * Trigger type
   */
  trigger?: ColorPickerTrigger;

  /**
   * Placement of the popover
   */
  placement?: TriggerPlacement;

  /**
   * Additional CSS class
   */
  className?: string;

  /**
   * Additional styles
   */
  style?: React.CSSProperties;

  /**
   * Custom trigger element
   */
  children?: React.ReactNode;
}

export interface ColorPickerPanelProps {
  /**
   * The current color value
   */
  value?: Color;

  /**
   * Callback when color changes
   */
  onChange?: (color: Color) => void;

  /**
   * Callback when clear button is clicked
   */
  onClear?: () => void;

  /**
   * Color format for display
   */
  format?: ColorFormat;

  /**
   * Preset colors
   */
  presets?: string[];

  /**
   * Additional CSS class
   */
  className?: string;
}
