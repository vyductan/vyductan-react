import { Steps } from "@acme/ui/components/steps";

const VerticalExample = () => {
  return (
    <div className="w-full max-w-md">
      <Steps
        current={1}
        direction="vertical"
        items={[
          {
            title: "Create campaign",
            content: "Set up the campaign name and ownership details.",
          },
          {
            title: "Configure audience",
            content: "Choose segments and delivery preferences.",
          },
          {
            title: "Launch",
            content: "Review settings and schedule the launch.",
          },
        ]}
      />
    </div>
  );
};

export default VerticalExample;
