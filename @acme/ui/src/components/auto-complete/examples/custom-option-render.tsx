import { AutoComplete } from "@acme/ui/components/auto-complete";

const repositoryOptions = [
  {
    label: "acme/ui",
    value: "ui",
    description: "Shared design system package",
    icon: "icon-[lucide--package]",
  },
  {
    label: "acme/www",
    value: "www",
    description: "Next.js application",
    icon: "icon-[lucide--globe]",
  },
] as const;

const CustomOptionRenderDemo = () => (
  <div className="w-[340px]">
    <AutoComplete
      placeholder="Choose a repository"
      options={[...repositoryOptions]}
      optionLabelProp="label"
      optionRender={{
        label: (option) => (
          <span className="inline-flex flex-col text-left align-top">
            <span className="font-medium">{String(option.label)}</span>
            <span className="text-muted-foreground text-xs">
              {String(option.description)}
            </span>
          </span>
        ),
      }}
      className="w-full"
    />
  </div>
);

export default CustomOptionRenderDemo;
