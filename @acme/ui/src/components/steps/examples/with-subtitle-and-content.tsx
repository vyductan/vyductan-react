import { Steps } from "@acme/ui/components/steps";

const WithSubtitleAndContentExample = () => {
  return (
    <div className="w-full min-w-[720px]">
      <Steps
        current={1}
        items={[
          {
            title: "Login",
            subTitle: "Completed",
            content: "Authentication details were verified.",
          },
          {
            title: "Verification",
            subTitle: "00:01:12",
            content: "Waiting for the final approval callback.",
          },
          {
            title: "Complete",
            subTitle: "Pending",
            content: "The order will be confirmed after verification.",
          },
        ]}
      />
    </div>
  );
};

export default WithSubtitleAndContentExample;
