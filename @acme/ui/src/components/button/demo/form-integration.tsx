import type React from "react";
import { z } from "zod";

import { Button } from "@acme/ui/components/button";
import { Form, FormItem, useForm } from "@acme/ui/components/form";
import { Input } from "@acme/ui/components/input";

const formSchema = z.object({
  username: z.string().min(1, { message: "Please input your username!" }),
  password: z.string().min(1, { message: "Please input your password!" }),
});

const App: React.FC = () => {
  const form = useForm({
    schema: formSchema,
    defaultValues: {
      username: "",
      password: "",
    },
    onSubmit: () => {},
  });

  return (
    <Form form={form} style={{ maxWidth: 360 }}>
      <FormItem name="username" control={form.control} label="Username">
        <Input />
      </FormItem>
      <FormItem name="password" control={form.control} label="Password">
        <Input.Password />
      </FormItem>
      <FormItem>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </FormItem>
    </Form>
  );
};

export default App;
