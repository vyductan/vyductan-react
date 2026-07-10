import type React from "react";
import { useState } from "react";
import { z } from "zod";

import { Button } from "@acme/ui/components/button";
import { Drawer } from "@acme/ui/components/drawer";
import { Field, FieldGroup } from "@acme/ui/components/field";
import { Form, useForm } from "@acme/ui/components/form";
import { Input } from "@acme/ui/components/input";
import { Select } from "@acme/ui/components/select";
import { Textarea } from "@acme/ui/components/textarea";

const formSchema = z.object({
  name: z.string().min(1, { message: "Please enter user name" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  role: z.string().min(1, { message: "Please choose the role" }),
  description: z.string().optional(),
});

const App: React.FC = () => {
  const [open, setOpen] = useState(false);

  const form = useForm({
    schema: formSchema,
    defaultValues: {
      name: "",
      email: "",
      role: "",
      description: "",
    },
    // onFinish equivalent — runs ONLY after validation passes.
    // TODO(you): decide the post-submit behavior. This is a UX call:
    //   - close + reset (clean slate next open)   <- current default
    //   - keep open + toast success (rapid entry)
    //   - keep values (let user tweak & resubmit)
    // Also send `data` to your API here.
    onSubmit: (data) => {
      console.log("submitted", data);
      form.resetFields();
      setOpen(false);
    },
  });

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        New account
      </Button>
      <Drawer
        title="Create a new account"
        description="Fill in the information below to create the account."
        open={open}
        onOpenChange={setOpen}
        width={480}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="primary" onClick={() => void form.submit()}>
              Submit
            </Button>
          </div>
        }
      >
        <Form name="drawer-form" form={form}>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Field name="name" control={form.control} label="Name">
                <Input placeholder="Please enter user name" />
              </Field>
              <Field name="email" control={form.control} label="Email">
                <Input placeholder="Please enter email" />
              </Field>
            </div>
            <Field name="role" control={form.control} label="Role">
              <Select
                placeholder="Please choose the role"
                options={[
                  { label: "Owner", value: "owner" },
                  { label: "Admin", value: "admin" },
                  { label: "Member", value: "member" },
                ]}
              />
            </Field>
            <Field name="description" control={form.control} label="Description">
              <Textarea
                rows={4}
                placeholder="Please enter a description"
                className="resize-none"
              />
            </Field>
          </FieldGroup>
        </Form>
      </Drawer>
    </>
  );
};

export default App;
