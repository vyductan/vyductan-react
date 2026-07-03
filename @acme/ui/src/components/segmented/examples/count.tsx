"use client";

import type React from "react";
import { useEffect, useState } from "react";

import { Badge } from "@acme/ui/components/badge";
import { Segmented } from "@acme/ui/components/segmented";
import { Skeleton } from "@acme/ui/components/skeleton";

interface Counts {
  all: number;
  active: number;
  done: number;
}

function LabelWithCount({
  label,
  count,
  loading,
}: {
  label: string;
  count?: number;
  loading: boolean;
}): React.JSX.Element {
  return (
    <span className="inline-flex items-center gap-2">
      {label}
      {loading ? (
        // skeleton cùng kích thước badge → không layout shift khi số về
        <Skeleton className="h-4 w-6 rounded-full" />
      ) : (
        <Badge
          variant="secondary"
          className="min-w-6 px-1.5 py-0 text-xs tabular-nums"
        >
          {count}
        </Badge>
      )}
    </span>
  );
}

const App: React.FC = () => {
  const [counts, setCounts] = useState<Counts>();

  useEffect(() => {
    // giả lập gọi API (thực tế thay bằng useQuery(trpc.x.queryOptions()))
    const timer = setTimeout(() => {
      setCounts({ all: 42, active: 8, done: 34 });
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const loading = !counts;

  return (
    <Segmented
      defaultValue="all"
      options={[
        {
          value: "all",
          label: <LabelWithCount label="All" count={counts?.all} loading={loading} />,
        },
        {
          value: "active",
          label: (
            <LabelWithCount label="Active" count={counts?.active} loading={loading} />
          ),
        },
        {
          value: "done",
          label: <LabelWithCount label="Done" count={counts?.done} loading={loading} />,
        },
      ]}
    />
  );
};

export default App;
