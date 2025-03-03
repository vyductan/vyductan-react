export type TreeDataNode = {
  key: React.Key;
  title: string;
  disabled?: boolean;
  children?: TreeDataNode[];
};
