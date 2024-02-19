export type Option<T extends string | number = string> = {
  label: React.ReactNode;
  value: T;
  icon?: string;
};
