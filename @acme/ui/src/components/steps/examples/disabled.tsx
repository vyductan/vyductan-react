import { Steps } from "@acme/ui/components/steps";

const DisabledExample = () => {
  return (
    <div className="flex w-full min-w-[720px] flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        Disabled items are visual-only in this MVP. They render as muted,
        non-interactive states and do not enable clickable step navigation.
      </p>

      <Steps
        current={1}
        items={[
          { title: "Account" },
          { title: "Profile", disabled: true },
          { title: "Confirm" },
        ]}
      />
    </div>
  );
};

export default DisabledExample;
