import { FloatingLabelTextarea } from "@acme/ui/components/floating-label-input";

const TextareaExample = () => {
  return (
    <div className="flex w-[320px] flex-col gap-5">
      <FloatingLabelTextarea label="Message" required />
      <FloatingLabelTextarea
        label="Bio"
        size="sm"
        defaultValue="Prefilled content floats the label."
      />
      <FloatingLabelTextarea
        label="Notes"
        status="error"
        defaultValue="Something invalid"
      />
    </div>
  );
};

export default TextareaExample;
