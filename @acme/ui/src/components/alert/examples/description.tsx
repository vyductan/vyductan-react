import { Alert } from "@acme/ui/components/alert";

const DescriptionExample = () => {
  return (
    <div className="w-full min-w-[520px]">
      <Alert
        message="Scheduled maintenance"
        description="The dashboard will be read-only from 01:00 to 01:30 UTC while invoices are reconciled. Existing automations will continue to run."
        type="info"
      />
    </div>
  );
};

export default DescriptionExample;
