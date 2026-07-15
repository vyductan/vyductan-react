import { FloatingLabelInput } from "@acme/ui/components/floating-label-input";

/** md (56px, default) vs sm (48px, compact). */
const SizesExample = () => {
  return (
    <div className="flex w-[320px] flex-col gap-5">
      <FloatingLabelInput label="Medium (md)" size="md" defaultValue="hello" />
      <FloatingLabelInput label="Compact (sm)" size="sm" defaultValue="hello" />
    </div>
  );
};

export default SizesExample;
