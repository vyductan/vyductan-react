import { FloatingLabelSelect } from "@acme/ui/components/floating-label-input";

const SelectExample = () => {
  return (
    <div className="flex w-[320px] flex-col gap-5">
      <FloatingLabelSelect label="Country" required>
        <option value="vn">Vietnam</option>
        <option value="us">United States</option>
        <option value="jp">Japan</option>
      </FloatingLabelSelect>
      <FloatingLabelSelect label="Plan (sm)" size="sm" defaultValue="pro">
        <option value="free">Free</option>
        <option value="pro">Pro</option>
        <option value="team">Team</option>
      </FloatingLabelSelect>
      <FloatingLabelSelect label="Role" status="error">
        <option value="admin">Admin</option>
        <option value="user">User</option>
      </FloatingLabelSelect>
    </div>
  );
};

export default SelectExample;
