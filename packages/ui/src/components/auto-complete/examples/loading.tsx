import { AutoComplete } from "@acme/ui/components/auto-complete";

const loadingOptions = [
  { label: "Searching...", value: "searching" },
  { label: "Loading result", value: "loading-result" },
] as const;

const LoadingDemo = () => (
  <div className="flex w-[320px] flex-col gap-4">
    <AutoComplete
      placeholder="Loading combobox"
      options={[...loadingOptions]}
      loading
      className="w-full"
    />
    <AutoComplete
      mode="input"
      placeholder="Loading input"
      searchPlaceholder="Type to search"
      options={[...loadingOptions]}
      loading
    />
  </div>
);

export default LoadingDemo;
