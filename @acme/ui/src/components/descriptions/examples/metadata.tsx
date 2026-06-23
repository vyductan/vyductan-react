import type React from "react";

import {
  Descriptions,
  DescriptionsAvatar,
  DescriptionsItem,
  DescriptionsLabel,
  DescriptionsValue,
} from "@acme/ui/components/descriptions";

const metadataLabelClassName =
  "text-[0.6875rem] font-semibold uppercase tracking-wider";
const metadataValueClassName = "font-medium";

const App: React.FC = () => (
  <Descriptions className="p-6">
    <DescriptionsItem>
      <DescriptionsLabel className={metadataLabelClassName}>
        Guide Name
      </DescriptionsLabel>
      <DescriptionsValue className="flex items-center gap-2 font-medium">
        <DescriptionsAvatar>K1</DescriptionsAvatar>
        <span>KODO Guide 1</span>
      </DescriptionsValue>
    </DescriptionsItem>
    <DescriptionsItem>
      <DescriptionsLabel className={metadataLabelClassName}>
        Invoice No.
      </DescriptionsLabel>
      <DescriptionsValue className={metadataValueClassName} muted>
        --
      </DescriptionsValue>
    </DescriptionsItem>
    <DescriptionsItem>
      <DescriptionsLabel className={metadataLabelClassName}>
        Tour Reference No.
      </DescriptionsLabel>
      <DescriptionsValue className={metadataValueClassName}>
        TKE1258654
      </DescriptionsValue>
    </DescriptionsItem>
    <DescriptionsItem>
      <DescriptionsLabel className={metadataLabelClassName}>
        Unique Ref
      </DescriptionsLabel>
      <DescriptionsValue className={metadataValueClassName}>
        TKE1258654_25/Apr/26
      </DescriptionsValue>
    </DescriptionsItem>
    <DescriptionsItem>
      <DescriptionsLabel className={metadataLabelClassName}>
        Request Date
      </DescriptionsLabel>
      <DescriptionsValue className={metadataValueClassName} muted>
        --
      </DescriptionsValue>
    </DescriptionsItem>
    <DescriptionsItem className="col-span-2 md:col-span-1">
      <DescriptionsLabel className={metadataLabelClassName}>
        Tour
      </DescriptionsLabel>
      <DescriptionsValue
        className={metadataValueClassName}
        truncate
        title="TF - Experience: Full Day Tokyo City Tour"
      >
        TF - Experience: Full Day Tokyo City Tour
      </DescriptionsValue>
    </DescriptionsItem>
    <DescriptionsItem>
      <DescriptionsLabel className={metadataLabelClassName}>
        Tour Date
      </DescriptionsLabel>
      <DescriptionsValue className={metadataValueClassName}>
        25 April 2026
      </DescriptionsValue>
    </DescriptionsItem>
    <DescriptionsItem>
      <DescriptionsLabel className={metadataLabelClassName}>
        Pax
      </DescriptionsLabel>
      <DescriptionsValue className={metadataValueClassName}>
        2
      </DescriptionsValue>
    </DescriptionsItem>
  </Descriptions>
);

export default App;
