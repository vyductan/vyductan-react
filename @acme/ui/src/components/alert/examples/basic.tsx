import { Alert } from "@acme/ui/components/alert";

const BasicExample = () => {
  return (
    <div className="w-full min-w-[420px]">
      <Alert message="Heads up! Your workspace has unsaved changes." />
    </div>
  );
};

export default BasicExample;
