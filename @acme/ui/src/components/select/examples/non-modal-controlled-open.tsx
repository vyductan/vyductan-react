import React from "react";

import { Select } from "@acme/ui/components/select";

// Controlled `open` on a single Select renders through Popover (non-modal), so
// the rest of the page stays interactive while the panel is open — hover the
// buttons and their cursor/background still react (Radix Select would block it).
//
// `onPointerDownOutside` controls dismissal per target: clicking the "keep open"
// button calls `preventDefault()` so the panel stays open; clicking anywhere
// else outside (incl. the "closes normally" button) dismisses as usual.
const App: React.FC = () => {
  const [open, setOpen] = React.useState(true);
  const [value, setValue] = React.useState<string>();
  const keepOpenRef = React.useRef<HTMLButtonElement>(null);

  const handleChange = (next: string) => {
    setValue(next);
  };

  return (
    <div className="flex items-start gap-4">
      <Select
        open={open}
        onOpenChange={setOpen}
        value={value}
        onChange={handleChange}
        allowClear
        placeholder="Controlled open"
        className="w-[200px]"
        onPointerDownOutside={(event) => {
          if (keepOpenRef.current?.contains(event.target as Node)) {
            event.preventDefault();
          }
        }}
        options={[
          { value: "1", label: "Option 1" },
          { value: "2", label: "Option 2" },
          { value: "3", label: "Option 3" },
          { value: "4", label: "Option 4" },
        ]}
      />
      <button
        ref={keepOpenRef}
        type="button"
        className="hover:bg-accent hover:text-accent-foreground h-8 cursor-pointer rounded-md border px-3 text-sm"
        onClick={() => setValue(undefined)}
      >
        Clear (keeps panel open)
      </button>
      <button
        type="button"
        className="hover:bg-accent hover:text-accent-foreground h-8 cursor-pointer rounded-md border px-3 text-sm"
      >
        Closes normally
      </button>
    </div>
  );
};

export default App;
