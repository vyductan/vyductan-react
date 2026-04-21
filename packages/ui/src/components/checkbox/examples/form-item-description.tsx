import type React from "react";
import { z } from "zod";

import { Checkbox } from "@acme/ui/components/checkbox";
import { Form, FormItem, useForm } from "@acme/ui/components/form";

const formSchema = z.object({
  p_allows_custom_start_time: z.boolean().default(false),
});

const App: React.FC = () => {
  const form = useForm({
    schema: formSchema,
    defaultValues: {
      p_allows_custom_start_time: false,
    },
    onSubmit: (values) => {
      void values;
    },
  });

  return (
    <Form form={form} style={{ maxWidth: 420 }}>
      <FormItem
        name="p_allows_custom_start_time"
        control={form.control}
        valuePropName="checked"
      >
        <Checkbox
          id="allow-custom-start-time"
          description="Customers can choose any time to start instead of selecting from predefined slots."
        >
          Allow custom start time
        </Checkbox>
      </FormItem>
    </Form>
  );
};

export default App;
