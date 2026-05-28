import { Alert } from "@acme/ui/components/alert";

const WithoutBorderExample = () => {
  return (
    <div className="bg-muted/30 w-full min-w-[520px] rounded-lg border p-4">
      <Alert
        bordered={false}
        message="Background sync paused"
        description="Sync will resume when the workspace connection is restored."
        type="warning"
      />
    </div>
  );
};

export default WithoutBorderExample;
