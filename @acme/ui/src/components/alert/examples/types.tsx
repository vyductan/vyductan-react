import { Alert } from "@acme/ui/components/alert";

const TypesExample = () => {
  return (
    <div className="flex w-full min-w-[560px] flex-col gap-3">
      <Alert
        message="Deployment ready"
        description="The preview build passed checks and can be promoted."
        type="success"
      />
      <Alert
        message="New policy available"
        description="Review the updated workspace access policy before inviting guests."
        type="info"
      />
      <Alert
        message="Usage approaching limit"
        description="This workspace has used 82% of its monthly automation quota."
        type="warning"
      />
      <Alert
        message="Payment failed"
        description="Update the billing method to keep scheduled runs active."
        type="error"
      />
    </div>
  );
};

export default TypesExample;
