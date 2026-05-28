import { Steps } from "@acme/ui/components/steps";

const items = [
  {
    title: "Draft",
    subTitle: "Step 1",
    content: "Prepare the initial copy.",
  },
  {
    title: "Review",
    subTitle: "Step 2",
    content: "Share it for feedback.",
  },
  {
    title: "Publish",
    subTitle: "Step 3",
    content: "Finalize and release it.",
  },
];

const TitlePlacementExample = () => {
  return (
    <div className="flex w-full min-w-[720px] flex-col gap-6">
      <div className="space-y-3">
        <h4 className="text-sm font-medium">
          titlePlacement=&quot;horizontal&quot;
        </h4>
        <Steps current={1} titlePlacement="horizontal" items={items} />
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium">
          titlePlacement=&quot;vertical&quot;
        </h4>
        <Steps current={1} titlePlacement="vertical" items={items} />
      </div>
    </div>
  );
};

export default TitlePlacementExample;
