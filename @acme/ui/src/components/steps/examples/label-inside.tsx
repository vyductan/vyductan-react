import { Steps } from "@acme/ui/components/steps";

const items = [
  { title: "Finished" },
  { title: "In Progress" },
  { title: "Waiting" },
];

const LabelInsideExample = () => {
  return (
    <div className="flex w-full min-w-[720px] flex-col gap-6">
      <Steps current={1} titlePlacement="inside" items={items} />

      <Steps current={1} size="small" titlePlacement="inside" items={items} />
    </div>
  );
};

export default LabelInsideExample;
