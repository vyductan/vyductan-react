import { Alert } from "@acme/ui/components/alert";

const WithoutBorderExample = () => {
  return (
    <div className="w-full min-w-[520px] rounded-lg border bg-muted/30 p-4">
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
