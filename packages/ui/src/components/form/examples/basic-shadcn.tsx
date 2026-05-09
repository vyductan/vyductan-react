import type React from "react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Info } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
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
  paymentTime: z.string().optional(),
  softLimitPerPax: z
    .string()
    .min(1, { message: "Please input your soft limit!" }),
  hardLimitPerPax: z
    .string()
    .min(1, { message: "Please input your hard limit!" }),
  sameAsShipping: z.boolean().optional(),
  comments: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function App(): React.JSX.Element {
  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(formSchema),
    defaultValues: {
      card_name: "",
      number: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      paymentTime: "",
      softLimitPerPax: "",
      hardLimitPerPax: "",
      sameAsShipping: true,
      comments: "",
    },
  });

  function onSubmit(data: FormValues) {
    console.log("data", data);
  }

  return (
    <div className="w-full max-w-md">
      <form id="form-basic-shadcn" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Payment Method</FieldLegend>
            <FieldLegendDescription>
              All transactions are secure and encrypted
            </FieldLegendDescription>
            <FieldGroup>
              <Controller
                name="card_name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="basic-shadcn-card-name">
                      Name on Card
                    </FieldLabel>
                    <Input
                      {...field}
                      id="basic-shadcn-card-name"
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
              <Controller
                name="number"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="basic-shadcn-card-number">
                      Card Number
                    </FieldLabel>
                    <InputNumber
                      {...field}
                      id="basic-shadcn-card-number"
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
                <Controller
                  name="expiryMonth"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="basic-shadcn-expiry-month">
                        Month
                      </FieldLabel>
                      <Select
                        {...field}
                        id="basic-shadcn-expiry-month"
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
                <Controller
                  name="expiryYear"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="basic-shadcn-expiry-year">
                        Year
                      </FieldLabel>
                      <Select
                        {...field}
                        id="basic-shadcn-expiry-year"
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
                <Controller
                  name="cvv"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="basic-shadcn-cvv">CVV</FieldLabel>
                      <InputNumber
                        {...field}
                        id="basic-shadcn-cvv"
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
              <Controller
                name="paymentTime"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="basic-shadcn-payment-time">
                      Payment Time
                    </FieldLabel>
                    <Input
                      {...field}
                      id="basic-shadcn-payment-time"
                      type="time"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-x-4">
                  <Controller
                    name="softLimitPerPax"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1" data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="basic-shadcn-soft-limit-per-pax">
                          Soft Limit / Pax
                        </FieldLabel>
                        <InputNumber
                          {...field}
                          id="basic-shadcn-soft-limit-per-pax"
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
                  <Controller
                    name="hardLimitPerPax"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1" data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="basic-shadcn-hard-limit-per-pax">
                          Hard Limit / Pax
                        </FieldLabel>
                        <InputNumber
                          {...field}
                          id="basic-shadcn-hard-limit-per-pax"
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
              <Controller
                name="sameAsShipping"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                    <Checkbox
                      id="basic-shadcn-same-as-shipping"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldLabel
                      htmlFor="basic-shadcn-same-as-shipping"
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
              <Controller
                name="comments"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="basic-shadcn-comments">
                      Comments
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id="basic-shadcn-comments"
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
      </form>
    </div>
  );
}

export default App;
