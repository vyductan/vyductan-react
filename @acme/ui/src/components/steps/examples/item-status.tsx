import { Steps } from "@acme/ui/components/steps";

const ItemStatusExample = () => {
  return (
    <div className="w-full min-w-[720px]">
      <Steps
        current={1}
        items={[
          { title: "Login", status: "finish" },
          { title: "Verification", status: "error" },
          { title: "Pay", status: "wait" },
        ]}
      />
    </div>
  );
};

export default ItemStatusExample;
