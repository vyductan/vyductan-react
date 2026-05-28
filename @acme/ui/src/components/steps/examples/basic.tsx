import { Steps } from "@acme/ui/components/steps";

const BasicExample = () => {
  return (
    <div className="w-full min-w-[720px]">
      <Steps
        current={1}
        items={[
          { title: "Finished" },
          { title: "In Progress" },
          { title: "Waiting" },
        ]}
      />
    </div>
  );
};

export default BasicExample;
