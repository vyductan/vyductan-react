import type React from "react";

import type { CheckboxOptionType } from "@acme/ui/components/checkbox";
import { Checkbox } from "@acme/ui/components/checkbox";

const onChange = (checkedValues: string[]) => {
  console.log("checked =", checkedValues);
};

const options: CheckboxOptionType<string>[] = [
  { label: "Apple", value: "Apple" },
  { label: "Pear", value: "Pear", className: "text-green-500" },
  { label: "Orange", value: "Orange", className: "text-blue-500" },
];

const optionsWithDisabled: CheckboxOptionType<string>[] = [
  { label: "Apple", value: "Apple" },
  { label: "Pear", value: "Pear", className: "text-green-500" },
  {
    label: "Orange",
    value: "Orange",
    className: "text-blue-500",
    disabled: false,
  },
];

const audienceOptions: CheckboxOptionType<string>[] = [
  {
    label: (
      <div className="grid gap-1">
        <span className="font-medium">Product managers</span>
        <span className="text-muted-foreground text-sm">
          Roadmaps, priorities, and launch plans.
        </span>
      </div>
    ),
    value: "product-managers",
  },
  {
    label: (
      <div className="grid gap-1">
        <span className="font-medium">Engineers</span>
        <span className="text-muted-foreground text-sm">
          APIs, implementation details, and technical updates.
        </span>
      </div>
    ),
    value: "engineers",
  },
  {
    label: (
      <div className="grid gap-1">
        <span className="font-medium">Designers</span>
        <span className="text-muted-foreground text-sm">
          UX reviews, components, and design system changes.
        </span>
      </div>
    ),
    value: "designers",
  },
];

const App: React.FC = () => (
  <div className="grid gap-6">
    <Checkbox.Group
      options={options}
      defaultValue={["Pear"]}
      onChange={onChange}
    />

    <Checkbox.Group
      options={optionsWithDisabled}
      disabled
      defaultValue={["Apple"]}
      onChange={onChange}
    />

    <div className="grid gap-3">
      <div className="grid gap-1">
        <h3 className="text-sm font-medium">Choose your audience</h3>
        <p className="text-muted-foreground text-sm">
          Select the teams that should receive this update.
        </p>
      </div>
      <Checkbox.Group
        options={audienceOptions}
        optionVariant="card"
        defaultValue={["engineers"]}
        className="grid gap-3 md:grid-cols-3"
        onChange={onChange}
      />
    </div>
  </div>
);

export default App;
