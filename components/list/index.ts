import InternalList from "./List";
import ListItem from "./ListItem";

export type { ListProps } from "./List";

export const List = Object.assign(InternalList, {
  Item: ListItem,
});
