import { Steps } from "@acme/ui/components/steps";

const SemanticSlotsExample = () => {
  return (
    <div className="w-full min-w-[720px] rounded-lg border border-dashed p-4">
      <Steps
        current={1}
        classNames={{
          root: "rounded-md bg-muted/30 p-4",
          item: "px-2",
          itemIcon: "shadow-sm",
          itemTitle: "tracking-tight",
          itemContent: "max-w-44",
        }}
        styles={{
          itemRail: { opacity: 0.5 },
          itemSubtitle: { letterSpacing: "0.02em" },
        }}
        items={[
          {
            title: "Draft",
            subTitle: "Step 1",
            content: "Prepare the first revision.",
          },
          {
            title: "Review",
            subTitle: "Step 2",
            content: "Share the draft for feedback.",
          },
          {
            title: "Publish",
            subTitle: "Step 3",
            content: "Make the final version available.",
          },
        ]}
      />
    </div>
  );
};

export default SemanticSlotsExample;
