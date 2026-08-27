import type React from "react";

import { Image } from "@acme/ui/components/image";

const receipts = [
  { label: "Toll — Otowa Gamagori", amount: "¥6,900", seed: "acme-peek-1" },
  { label: "Fuel — Nagoya", amount: "¥4,200", seed: "acme-peek-2" },
  { label: "Parking — Kyoto", amount: "¥1,500", seed: "acme-peek-3" },
];

const App: React.FC = () => (
  <table className="w-full max-w-md text-sm">
    <thead>
      <tr className="text-muted-foreground border-b text-left">
        <th className="w-12 py-2 font-medium">Receipt</th>
        <th className="py-2 font-medium">Expense</th>
        <th className="py-2 text-right font-medium">Amount</th>
      </tr>
    </thead>
    <tbody>
      {receipts.map((receipt) => (
        <tr key={receipt.seed} className="border-b">
          <td className="py-2">
            {/* The row renders a small transform; `hover.src` points at a
                bigger one, fetched as soon as the pointer arrives so it is
                ready by the time the card opens. Clicking still opens the
                full viewer. */}
            <Image
              src={`https://picsum.photos/seed/${receipt.seed}/120/160`}
              alt={receipt.label}
              className="size-9 rounded-md object-cover"
              preview={{
                hover: {
                  src: `https://picsum.photos/seed/${receipt.seed}/900/1200`,
                },
              }}
            />
          </td>
          <td className="py-2">{receipt.label}</td>
          <td className="py-2 text-right tabular-nums">{receipt.amount}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default App;
