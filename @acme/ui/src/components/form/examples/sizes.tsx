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
 * One <Form> at a single size. `size` is passed to every control — Input,
 * InputNumber, Select, and the submit Button all share the SizeType scale
 * (small=h-6, middle=h-8, large=h-10). <Form> itself has no size prop; sizing
 * flows per-control (or via config-provider's SizeContext).
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
      className="flex flex-col gap-4"
    >
      <div className="text-muted-foreground mb-4 text-sm font-medium">
        size=&quot;{size ?? "middle"}&quot;
      </div>
      <Field name="name" control={form.control} label="Name">
        <Input placeholder="Evil Rabbit" size={size} />
      </Field>
      <Field name="plan" control={form.control} label="Plan">
        <Select
          placeholder="Select a plan"
          size={size}
          options={[
            { label: "Free", value: "free" },
            { label: "Pro", value: "pro" },
            { label: "Enterprise", value: "enterprise" },
          ]}
        />
      </Field>
      <Field name="seats" control={form.control} label="Seats">
        <InputNumber placeholder="0" size={size} min={1} />
      </Field>
      <Button type="submit" size={size} className="self-start">
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
