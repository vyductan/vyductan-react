import { z } from "zod";

import { Button } from "@acme/ui/components/button";
import { Field } from "@acme/ui/components/field";
import { Form, useForm } from "@acme/ui/components/form";
import { Input, InputPassword } from "@acme/ui/components/input";

const schema = z.object({
  username: z
    .string()
    .min(4, { message: "Use 4 to 16 characters." })
    .max(16, { message: "Use 4 to 16 characters." }),
  password: z.string().min(1, { message: "Please input your password!" }),
});

/**
 * `description` vs `extra`. `description` (Username) sits between the control
 * and the error slot. `extra` (Password) is a persistent hint rendered BELOW
 * the error — it stays put when validation fails, matching AntD's `extra`.
 */
const FieldExtraDemo = () => {
  const form = useForm({
    schema,
    // Username starts valid so it shows only its `description`; password stays
    // empty so submit surfaces the error with `extra` persisting below it.
    defaultValues: { username: "evilrabbit", password: "" },
    onSubmit: (data) => console.log("field-extra", data),
  });

  return (
    <Form form={form} name="field-extra" className="flex w-80 flex-col gap-4">
      <Field
        name="username"
        control={form.control}
        label="Username"
        description="Use 4 to 16 characters."
      >
        <Input placeholder="Username" />
      </Field>
      <Field
        name="password"
        control={form.control}
        label="Password"
        extra="Password must contain letters and numbers."
      >
        <InputPassword placeholder="Password" />
      </Field>
      <Button type="submit" className="self-start">
        Submit
      </Button>
    </Form>
  );
};

export default FieldExtraDemo;
