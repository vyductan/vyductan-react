import type React from "react";
import { Info } from "lucide-react";
import { z } from "zod";

import { Button } from "@acme/ui/components/button";
import { Checkbox } from "@acme/ui/components/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldLegendDescription,
  FieldSeparator,
  FieldSet,
} from "@acme/ui/components/field";
import { Form, FormController, useForm } from "@acme/ui/components/form";
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
  cvv: z.string().min(1, { message: "Please input your cvv!" }),
  softLimitPerPax: z
    .string()
    .min(1, { message: "Please input your soft limit!" }),
  hardLimitPerPax: z
    .string()
    .min(1, { message: "Please input your hard limit!" }),
  sameAsShipping: z.boolean().optional(),
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
      cvv: "",
      softLimitPerPax: "",
      hardLimitPerPax: "",
      sameAsShipping: true,
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
              <FormController
                name="card_name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-demo-card-name">
                      Name on Card
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-demo-card-name"
                      aria-invalid={fieldState.invalid}
                      placeholder="Evil Rabbit"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <FormController
                name="number"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="checkout-7j9-card-number-uw1">
                      Card Number
                    </FieldLabel>
                    <InputNumber
                      {...field}
                      id="checkout-7j9-card-number-uw1"
                      aria-invalid={fieldState.invalid}
                      placeholder="1234 5678 9012 3456"
                    />
                    <FieldDescription>
                      Enter your 16-digit card number
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <div className="grid grid-cols-3 gap-4">
                <FormController
                  name="expiryMonth"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="checkout-exp-month-ts6">
                        Month
                      </FieldLabel>
                      <Select
                        {...field}
                        id="checkout-exp-month-ts6"
                        aria-invalid={fieldState.invalid}
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
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <FormController
                  name="expiryYear"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="checkout-7j9-exp-year-f59">
                        Year
                      </FieldLabel>
                      <Select
                        {...field}
                        id="checkout-7j9-exp-year-f59"
                        aria-invalid={fieldState.invalid}
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
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <FormController
                  name="cvv"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="checkout-7j9-cvv">CVV</FieldLabel>
                      <InputNumber
                        {...field}
                        id="checkout-7j9-cvv"
                        aria-invalid={fieldState.invalid}
                        placeholder="123"
                        controls={false}
                        max={3}
                        min={3}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-x-4">
                  <FormController
                    name="softLimitPerPax"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        className="gap-1"
                        data-invalid={fieldState.invalid}
                      >
                        <FieldLabel htmlFor="checkout-soft-limit-per-pax">
                          Soft Limit / Pax
                        </FieldLabel>
                        <InputNumber
                          {...field}
                          id="checkout-soft-limit-per-pax"
                          aria-invalid={fieldState.invalid}
                          inputMode="decimal"
                          placeholder="0"
                          prefix="¥"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <FormController
                    name="hardLimitPerPax"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        className="gap-1"
                        data-invalid={fieldState.invalid}
                      >
                        <FieldLabel htmlFor="checkout-hard-limit-per-pax">
                          Hard Limit / Pax
                        </FieldLabel>
                        <Input
                          {...field}
                          id="checkout-hard-limit-per-pax"
                          aria-invalid={fieldState.invalid}
                          inputMode="decimal"
                          placeholder="0"
                          prefix="¥"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
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
              <FormController
                name="sameAsShipping"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    orientation="horizontal"
                    data-invalid={fieldState.invalid}
                  >
                    <Checkbox
                      id="checkout-7j9-same-as-shipping-wgm"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldLabel
                      htmlFor="checkout-7j9-same-as-shipping-wgm"
                      className="font-normal"
                    >
                      Same as shipping address
                    </FieldLabel>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>
          <FieldSet>
            <FieldGroup>
              <FormController
                name="comments"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="checkout-7j9-optional-comments">
                      Comments
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id="checkout-7j9-optional-comments"
                      placeholder="Add any additional comments"
                      className="resize-none"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
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
