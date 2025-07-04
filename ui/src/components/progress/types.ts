export type StrokeColorObject = Record<string, string | boolean>;

export type BaseStrokeColorType = string | StrokeColorObject;

export type StrokeColorType = BaseStrokeColorType | BaseStrokeColorType[];
