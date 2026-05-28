import { useState } from "react";

import { Button } from "@acme/ui/components/button";
import { Steps } from "@acme/ui/components/steps";
import { Icon } from "@acme/ui/icons";

const statusItems = [
  { title: "Queued" },
  { title: "Processing" },
  { title: "Review" },
  { title: "Done" },
];
const operationCurrent = 2;
const operationItemClassName = "w-24";
const operationItems = [
  {
    title: "Scheduled",
    icon: <Icon icon="icon-[lucide--check]" className="size-4" />,
    className: operationItemClassName,
  },
  {
    title: "In Prep",
    icon: <Icon icon="icon-[lucide--check]" className="size-4" />,
    className: operationItemClassName,
  },
  {
    title: "Accepted",
    className: "w-32",
    icon: <Icon icon="icon-[lucide--handshake]" className="size-4" />,
    content: (
      <div className="bg-muted relative mt-2 flex w-max flex-col items-center gap-2 rounded-lg border p-3 text-center shadow-sm">
        <div className="bg-muted absolute -top-1.5 left-1/2 z-20 size-3 -translate-x-1/2 rotate-45 rounded-tl-[2px] border-t border-l" />
        <span className="text-muted-foreground relative z-10 text-xs leading-relaxed">
          Guide accepted.
          <br />
          Next step: generate reminder.
        </span>
        <Button
          className="relative z-10 gap-1 text-xs"
          size="small"
          color="primary"
          variant="solid"
        >
          <Icon icon="icon-[lucide--mail]" className="size-3.5" />
          Generate Reminder Email
        </Button>
      </div>
    ),
  },
  {
    title: "Reminder",
    className: operationItemClassName,
    icon: <Icon icon="icon-[lucide--bell]" className="size-4" />,
  },
  {
    title: "Ready",
    className: operationItemClassName,
    icon: <Icon icon="icon-[lucide--flag]" className="size-4" />,
  },
  {
    title: "Started",
    className: operationItemClassName,
    icon: <Icon icon="icon-[lucide--play]" className="size-4" />,
  },
  {
    title: "Ended",
    className: operationItemClassName,
    icon: <Icon icon="icon-[lucide--circle-check]" className="size-4" />,
  },
];
const initialCurrent = 1;

function StatusBarExample() {
  const [current, setCurrent] = useState(initialCurrent);
  const processingActions = (
    <div className="flex items-center justify-center gap-2">
      <Button
        size="small"
        variant="outlined"
        disabled={current === 0}
        onClick={() => setCurrent((value) => Math.max(value - 1, 0))}
      >
        Revert
      </Button>
      <Button
        size="small"
        color="primary"
        variant="solid"
        onClick={() => setCurrent((value) => Math.min(value + 1, 2))}
      >
        Done
      </Button>
    </div>
  );
  const reviewActions = (
    <div className="flex items-center justify-center gap-2">
      <Button
        size="small"
        variant="outlined"
        onClick={() => setCurrent((value) => Math.max(value - 1, 1))}
      >
        Request changes
      </Button>
      <Button
        size="small"
        color="primary"
        variant="solid"
        onClick={() => setCurrent((value) => Math.min(value + 1, 3))}
      >
        Approve
      </Button>
    </div>
  );
  const items = statusItems.map(({ title }, index) => {
    let actions;

    if (index === 1) {
      actions = processingActions;
    } else if (index === 2) {
      actions = reviewActions;
    }

    return {
      title,
      actions,
    };
  });

  return (
    <div className="flex w-full min-w-[720px] flex-col gap-4">
      <Steps
        current={current}
        items={items}
        iconRender={(oriNode, { index }) => (current < index ? null : oriNode)}
      />
      <Steps
        titlePlacement="vertical"
        current={current}
        items={items}
        iconRender={(oriNode, { index }) => (current < index ? null : oriNode)}
      />
      <section className="bg-background rounded-xl border p-6 shadow-sm">
        <h3 className="text-muted-foreground mb-6 text-xs font-semibold tracking-[0.16em] uppercase">
          OPERATION STATUS
        </h3>
        <div className="overflow-x-auto pb-2">
          <Steps
            current={operationCurrent}
            titlePlacement="vertical"
            items={operationItems}
            classNames={{
              root: "relative min-w-[1120px] justify-between pt-2 before:absolute before:left-0 before:right-0 before:top-6 before:z-0 before:h-1 before:rounded-full before:bg-muted after:absolute after:left-0 after:top-6 after:z-0 after:h-1 after:w-[33%] after:rounded-full after:bg-primary-600 after:transition-all after:duration-500",
              item: "z-10 flex-none",
              itemIcon:
                "size-8 min-h-8 min-w-8 border-0 bg-background text-muted-foreground shadow-[0_0_0_4px_var(--background)] ring-1 ring-border in-data-[status=finish]:bg-primary-600 in-data-[status=finish]:text-white in-data-[status=finish]:ring-primary-600 in-data-[status=process]:bg-background in-data-[status=process]:text-primary-600 in-data-[status=process]:ring-2 in-data-[status=process]:ring-primary-600",
              itemTitle:
                "text-xs in-data-[status=process]:font-bold in-data-[status=process]:text-primary-600",
              itemContent: "mt-1 flex w-full justify-center",
              itemRail: "hidden",
            }}
          />
        </div>
      </section>
    </div>
  );
}

export default StatusBarExample;
