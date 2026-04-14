import { Combobox as ShadcnCombobox } from "@acme/ui/shadcn/combobox";

function ComboboxPrimitive<
  Value,
  Multiple extends boolean | undefined = false,
>({
  autoHighlight = true,
  ...properties
}: React.ComponentProps<
  typeof ShadcnCombobox<Value, Multiple>
>): React.JSX.Element {
  return <ShadcnCombobox autoHighlight={autoHighlight} {...properties} />;
}

export { ComboboxPrimitive };
