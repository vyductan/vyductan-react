import type React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, Form, useForm } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";
import { z } from "zod";

const formSchema = z.object({
  username: z.string().min(1, { message: "Please input your username!" }),
  password: z.string().min(1, { message: "Please input your password!" }),
  remember: z.boolean().optional(),
});

const App: React.FC = () => {
  const form = useForm({
    schema: formSchema,
    defaultValues: {
      username: "",
      password: "",
      remember: true,
    },
    onSubmit: (data) => {
      console.log("data", data);
    },
  });

  return (
    <Form
      form={form}
      name="basic"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      style={{ maxWidth: 600 }}
      autoComplete="off"
      // labelAlign="left"
      // layout="vertical"
    >
      <Field
        label={
          <div className="flex items-center gap-2">
            <User />
            <span>Username</span>
          </div>
        }
        name="username"
        control={form.control}
      >
        <Input />
      </Field>

      <Form.Item label="Password Long" name="password" control={form.control}>
        <Input.Password />
      </Form.Item>

      <Form.Item
        name="remember"
        control={form.control}
        valuePropName="checked"
        label={null}
      >
        <Checkbox>Remember me</Checkbox>
      </Form.Item>

      <Form.Item label={null}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default App;
