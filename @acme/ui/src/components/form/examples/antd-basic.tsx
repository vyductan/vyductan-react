import type React from "react";
import { Info } from "lucide-react";
import { z } from "zod";

import type { CheckboxChangeEvent } from "@acme/ui/components/checkbox";
import { Button } from "@acme/ui/components/button";
import { Checkbox } from "@acme/ui/components/checkbox";
import {
  Form,
  FormItem,
  requiredNumberSchema,
  useForm,
} from "@acme/ui/components/form";
import { Input, InputNumber } from "@acme/ui/components/input";
import { Select } from "@acme/ui/components/select";
import { Textarea } from "@acme/ui/components/textarea";

const formSchema = z.object({
  card_name: z.string().min(1, { message: "Please input your card name!" }),
  number: z.string().min(1, { message: "Please input your card number!" }),
  expiryMonth: z
    .string()
    .min(1, { message: "Please input your expiry month!" }),
  expiryYear: z.string().min(1, { message: "Please input your expiry year!" }),
  cvv: requiredNumberSchema("Please input your cvv!", { min: 1, max: 999 }),
  softLimitPerPax: requiredNumberSchema("Please input your soft limit!", {
    min: 1,
  }),
  hardLimitPerPax: z
    .string()
    .min(1, { message: "Please input your hard limit!" }),
  sameAsShipping: z.boolean().optional(),
  savePaymentMethod: z.boolean().optional(),
  comments: z.string().optional(),
});

function App(): React.JSX.Element {
  const form = useForm({
    schema: formSchema,
    defaultValues: {
      card_name: "",
      number: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: undefined,
      softLimitPerPax: undefined,
      hardLimitPerPax: "",
      sameAsShipping: true,
      savePaymentMethod: false,
      comments: "",
    },
    onSubmit: (data) => {
      console.log("data", data);
    },
  });

  return (
    <Form
      form={form}
      name="basic"
      layout="vertical"
      style={{ maxWidth: 600 }}
      autoComplete="off"
    >
      <FormItem label="Name on Card" name="card_name" control={form.control}>
        <Input placeholder="Evil Rabbit" autoComplete="off" />
      </FormItem>

      <FormItem
        label="Card Number"
        name="number"
        control={form.control}
        description="Enter your 16-digit card number"
      >
        <Input inputMode="numeric" placeholder="1234 5678 9012 3456" />
      </FormItem>

      <div className="grid grid-cols-3 gap-4">
        <FormItem label="Month" name="expiryMonth" control={form.control}>
          <Select
            placeholder="MM"
            options={[
              { label: "01", value: "01" },
              { label: "02", value: "02" },
              { label: "03", value: "03" },
              { label: "04", value: "04" },
              { label: "05", value: "05" },
              { label: "06", value: "06" },
              { label: "07", value: "07" },
              { label: "08", value: "08" },
              { label: "09", value: "09" },
              { label: "10", value: "10" },
              { label: "11", value: "11" },
              { label: "12", value: "12" },
            ]}
          />
        </FormItem>
        <FormItem label="Year" name="expiryYear" control={form.control}>
          <Select
            placeholder="YYYY"
            options={[
              { label: "2024", value: "2024" },
              { label: "2025", value: "2025" },
              { label: "2026", value: "2026" },
              { label: "2027", value: "2027" },
              { label: "2028", value: "2028" },
              { label: "2029", value: "2029" },
            ]}
          />
        </FormItem>
        <FormItem label="CVV" name="cvv" control={form.control}>
          <InputNumber placeholder="123" controls={false} min={0} max={999} />
        </FormItem>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-x-4">
          <FormItem
            label="Soft Limit / Pax"
            name="softLimitPerPax"
            control={form.control}
            className="mb-0 gap-1"
          >
            <InputNumber inputMode="decimal" placeholder="0" prefix="¥" />
          </FormItem>
          <FormItem
            label="Hard Limit / Pax"
            name="hardLimitPerPax"
            control={form.control}
            className="mb-0 gap-1"
          >
            <Input inputMode="decimal" placeholder="0" prefix="¥" />
          </FormItem>
        </div>
        <div className="flex items-start gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <strong>Note:</strong> Soft limit must be less than or equal to the
            hard limit. Enter 0 or leave empty for unlimited.
          </p>
        </div>
      </div>

      <FormItem
        name="sameAsShipping"
        control={form.control}
        valuePropName="checked"
        label={null}
        normalize={(event: CheckboxChangeEvent) => event.target.checked}
      >
        <Checkbox>Same as shipping address</Checkbox>
      </FormItem>

      <FormItem
        name="savePaymentMethod"
        control={form.control}
        valuePropName="checked"
        label={null}
        normalize={(event: CheckboxChangeEvent) => event.target.checked}
      >
        <Checkbox
          variant="card"
          description="Reuse this payment method for your next checkout."
        >
          Save payment method
        </Checkbox>
      </FormItem>

      <FormItem label="Comments" name="comments" control={form.control}>
        <Textarea
          placeholder="Add any additional comments"
          className="resize-none"
        />
      </FormItem>

      <FormItem label={null} className="mb-0">
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </FormItem>
    </Form>
  );
}

export default App;
