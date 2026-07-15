import { z } from "zod";

import { Button } from "@acme/ui/components/button";
import { Field } from "@acme/ui/components/field";
import {
  FloatingLabelInput,
  FloatingLabelSelect,
  FloatingLabelTextarea,
} from "@acme/ui/components/floating-label-input";
import { Form, useForm } from "@acme/ui/components/form";

const schema = z.object({
  name: z.string().min(1, { message: "Required" }),
  country: z.string().min(1, { message: "Required" }),
  bio: z.string().optional(),
});

/**
 * One <Form> at a given size — controls bound via <Field> (the floating label
 * lives inside the control, so Field's own label is omitted). Submit empty to
 * see the error state propagate through aria-invalid to the border + label.
 */
const SizedForm = ({
  size,
  formName,
}: {
  size: "md" | "sm";
  formName: string;
}) => {
  const form = useForm({
    schema,
    defaultValues: { name: "", country: "", bio: "" },
    onSubmit: (data) => console.log(formName, data),
  });

  return (
    <Form name={formName} form={form} className="flex flex-col gap-5">
      <div className="text-muted-foreground text-sm font-medium">
        size=&quot;{size}&quot;
      </div>
      <Field name="name" control={form.control}>
        <FloatingLabelInput label="Full name" size={size} required />
      </Field>
      <Field name="country" control={form.control}>
        <FloatingLabelSelect label="Country" size={size} required>
          <option value="vn">Vietnam</option>
          <option value="us">United States</option>
        </FloatingLabelSelect>
      </Field>
      <Field name="bio" control={form.control}>
        <FloatingLabelTextarea label="Bio" size={size} />
      </Field>
      <Button type="submit" className="self-start">
        Submit
      </Button>
    </Form>
  );
};

/** Floating-label controls (input / select / textarea) bound to acme <Form>,
 * shown at both sizes (md 56px vs sm 48px). */
const FloatingLabelSizesDemo = () => {
  return (
    <div className="grid w-[720px] grid-cols-2 gap-10">
      <SizedForm size="md" formName="floating-md" />
      <SizedForm size="sm" formName="floating-sm" />
    </div>
  );
};

export default FloatingLabelSizesDemo;
