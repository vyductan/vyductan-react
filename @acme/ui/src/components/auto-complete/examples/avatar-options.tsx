import { AutoComplete } from "@acme/ui/components/auto-complete";
import { Avatar } from "@acme/ui/components/avatar";

const guideOptions = [
  { label: "Alexandra Whitfield", value: "GD-1041" },
  { label: "Sam Reyes", value: "GD-1058" },
  { label: "Benjamin Castellanos-Ruiz", value: "GD-1072" },
] as const;

const AvatarOptionsDemo = () => (
  <div className="w-[200px]">
    <AutoComplete
      placeholder="Assign a guide"
      defaultValue="GD-1072"
      options={[...guideOptions]}
      optionRender={{
        icon: (option) => <Avatar size="small" alt={String(option.label)} />,
      }}
      className="w-full"
    />
  </div>
);

export default AvatarOptionsDemo;
