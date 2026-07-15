import type { SizeType } from "@acme/ui/components/config-provider/size-context";
import { z } from "zod";

import { Button } from "@acme/ui/components/button";
import { Field } from "@acme/ui/components/field";
import { Form, requiredNumberSchema, useForm } from "@acme/ui/components/form";
import { Input, InputNumber } from "@acme/ui/components/input";
import { Select } from "@acme/ui/components/select";

const schema = z.object({
  name: z.string().min(1, { message: "Please input your name!" }),
  plan: z.string().min(1, { message: "Please select a plan!" }),
  seats: requiredNumberSchema("Please input seats!", { min: 1 }),
});

/**
 * One <Form> at a single size. `<Form size>` sets the ambient SizeContext, so
 * controls (Input, InputNumber, Select), Button, and <Field> (label font + gap
 * + radius) all scale from one prop — no per-control wiring.
 */
const SizedForm = ({ size }: { size: SizeType }) => {
  const form = useForm({
    schema,
    defaultValues: { name: "", plan: "", seats: undefined },
    onSubmit: (data) => console.log(`size=${size ?? "middle"}`, data),
  });

  return (
    <Form
      name={`sizes-${size ?? "middle"}`}
      form={form}
      size={size}
      className="flex flex-col gap-4"
    >
      <div className="text-muted-foreground mb-1 text-sm font-medium">
        size=&quot;{size ?? "middle"}&quot;
      </div>
      <Field name="name" control={form.control} label="Name">
        <Input placeholder="Evil Rabbit" />
      </Field>
      <Field name="plan" control={form.control} label="Plan">
        <Select
          placeholder="Select a plan"
          options={[
            { label: "Free", value: "free" },
            { label: "Pro", value: "pro" },
            { label: "Enterprise", value: "enterprise" },
          ]}
        />
      </Field>
      <Field name="seats" control={form.control} label="Seats">
        <InputNumber placeholder="0" min={1} />
      </Field>
      <Button type="submit" className="self-start">
        Submit
      </Button>
    </Form>
  );
};

/** Same form rendered at all three sizes side by side. */
const FormSizesDemo = () => {
  const sizes: SizeType[] = ["small", "middle", "large"];
  return (
    <div className="grid w-[900px] grid-cols-3 gap-10">
      {sizes.map((size) => (
        <SizedForm key={size} size={size} />
      ))}
    </div>
  );
};

export default FormSizesDemo;
