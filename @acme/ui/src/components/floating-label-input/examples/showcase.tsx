import {
  FloatingLabelInput,
  FloatingLabelSelect,
  FloatingLabelTextarea,
} from "@acme/ui/components/floating-label-input";

/** Every control together, as it would look on a form. */
const ShowcaseExample = () => {
  return (
    <div className="flex w-[360px] flex-col gap-5">
      <FloatingLabelInput label="Full name" required />
      <FloatingLabelInput label="Email" type="email" defaultValue="a@b.com" />
      <FloatingLabelSelect label="Country" required>
        <option value="vn">Vietnam</option>
        <option value="us">United States</option>
      </FloatingLabelSelect>
      <FloatingLabelTextarea label="Message" size="sm" />
    </div>
  );
};

export default ShowcaseExample;
