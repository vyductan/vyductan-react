import type React from "react";
import dayjs from "dayjs";
import { Info } from "lucide-react";
import { z } from "zod";

import { Button } from "@acme/ui/components/button";
import { Checkbox } from "@acme/ui/components/checkbox";
import {
  Field,
  FieldGroup,
  FieldLegend,
  FieldLegendDescription,
  FieldSeparator,
  FieldSet,
} from "@acme/ui/components/field";
import { Form, requiredNumberSchema, useForm } from "@acme/ui/components/form";
import { Input, InputNumber } from "@acme/ui/components/input";
import { Select } from "@acme/ui/components/select";
import { Switch } from "@acme/ui/components/switch";
import { Textarea } from "@acme/ui/components/textarea";
import { TimePicker } from "@acme/ui/components/time-picker";

const formSchema = z.object({
  card_name: z.string().min(1, { message: "Please input your card name!" }),
  number: requiredNumberSchema("Please input your card number!", { min: 1 }),
  expiryMonth: z
    .string()
    .min(1, { message: "Please input your expiry month!" }),
  expiryYear: z.string().min(1, { message: "Please input your expiry year!" }),
  cvv: requiredNumberSchema("Please input your cvv!", { min: 1 }),
  paymentTime: z.string().optional(),
  softLimitPerPax: requiredNumberSchema("Please input your soft limit!", {
    min: 1,
  }),
  hardLimitPerPax: requiredNumberSchema("Please input your hard limit!", {
    min: 1,
  }),
  sameAsShipping: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
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
      paymentTime: "",
      softLimitPerPax: undefined,
      hardLimitPerPax: undefined,
      sameAsShipping: true,
      emailNotifications: false,
      comments: "",
    },
    onSubmit: (data) => {
      console.log("data", data);
    },
  });

  return (
    <div className="w-full max-w-md">
      <Form name="form-demo" form={form}>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Payment Method</FieldLegend>
            <FieldLegendDescription>
              All transactions are secure and encrypted
            </FieldLegendDescription>
            <FieldGroup>
              <Field
                name="card_name"
                control={form.control}
                label="Name on Card"
              >
                <Input placeholder="Evil Rabbit" autoComplete="off" />
              </Field>
              <Field
                name="number"
                control={form.control}
                label="Card Number"
                description="Enter your 16-digit card number"
              >
                <InputNumber placeholder="1234 5678 9012 3456" />
              </Field>
              <div className="grid grid-cols-3 gap-4">
                <Field name="expiryMonth" control={form.control} label="Month">
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
                </Field>
                <Field name="expiryYear" control={form.control} label="Year">
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
                </Field>
                <Field name="cvv" control={form.control} label="CVV">
                  <InputNumber
                    placeholder="123"
                    controls={false}
                    max={3}
                    min={3}
                  />
                </Field>
              </div>
              <Field
                name="paymentTime"
                control={form.control}
                label="Payment Time"
                getValueProps={(value) => ({
                  value: value && dayjs(value, "HH:mm"),
                })}
                normalize={(value) =>
                  value && `${dayjs(value).format("HH:mm")}`
                }
              >
                <TimePicker placeholder="Select payment time" format="HH:mm" />
              </Field>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-x-4">
                  <Field
                    name="softLimitPerPax"
                    control={form.control}
                    label="Soft Limit / Pax"
                    className="gap-1"
                  >
                    <InputNumber
                      inputMode="decimal"
                      placeholder="0"
                      prefix="¥"
                    />
                  </Field>
                  <Field
                    name="hardLimitPerPax"
                    control={form.control}
                    label="Hard Limit / Pax"
                    className="gap-1"
                  >
                    <InputNumber
                      inputMode="decimal"
                      placeholder="0"
                      prefix="¥"
                    />
                  </Field>
                </div>
                <div className="flex items-start gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    <strong>Note:</strong> Soft limit must be less than or equal
                    to the hard limit. Enter 0 or leave empty for unlimited.
                  </p>
                </div>
              </div>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet>
            <FieldLegend>Billing Address</FieldLegend>
            <FieldLegendDescription>
              The billing address associated with your payment method
            </FieldLegendDescription>
            <FieldGroup>
              <Field
                name="sameAsShipping"
                control={form.control}
                valuePropName="checked"
              >
                <Checkbox>Same as shipping address</Checkbox>
              </Field>
              <Field
                name="emailNotifications"
                control={form.control}
                label="Email Notifications"
                description="Receive payment and billing updates."
                valuePropName="checked"
              >
                <Switch />
              </Field>
            </FieldGroup>
          </FieldSet>
          <FieldSet>
            <FieldGroup>
              <Field name="comments" control={form.control} label="Comments">
                <Textarea
                  placeholder="Add any additional comments"
                  className="resize-none"
                />
              </Field>
            </FieldGroup>
          </FieldSet>
          <Field orientation="horizontal">
            <Button type="submit">Submit</Button>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Field>
        </FieldGroup>
      </Form>
    </div>
  );
}

export default App;
