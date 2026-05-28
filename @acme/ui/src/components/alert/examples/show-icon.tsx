import { Alert } from "@acme/ui/components/alert";

const ShowIconExample = () => {
  return (
    <div className="w-full min-w-[520px]">
      <Alert
        message="Usage approaching limit"
        description="Archive completed runs or upgrade the plan before the next scheduled batch."
        showIcon
        type="warning"
      />
    </div>
  );
};

export default ShowIconExample;
