import type { ReactNode } from "react";

interface ListItemProps {
  children: ReactNode;
}
const ListItem = ({ children }: ListItemProps) => {
  return <li className="flex py-6">{children}</li>;
};
export default ListItem;
