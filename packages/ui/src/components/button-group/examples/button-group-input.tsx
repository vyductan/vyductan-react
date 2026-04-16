import { SearchIcon } from "lucide-react";

import { Button } from "@acme/ui/components/button";
import { ButtonGroup } from "@acme/ui/components/button-group";
import { Input } from "@acme/ui/components/input";

export function ButtonGroupInput() {
  return (
    <ButtonGroup>
      <Input placeholder="Search..." />
      <Button variant="outline" aria-label="Search">
        <SearchIcon />
      </Button>
    </ButtonGroup>
  );
}
