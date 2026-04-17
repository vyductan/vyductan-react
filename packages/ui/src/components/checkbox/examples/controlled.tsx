import type React from "react";
import { useState } from "react";

import type { CheckboxProps } from "@acme/ui/components/checkbox";
import { Button } from "@acme/ui/components/button";
import { Checkbox } from "@acme/ui/components/checkbox";

const App: React.FC = () => {
  const [checked, setChecked] = useState(true);
  const [disabled, setDisabled] = useState(false);

  const toggleChecked = () => {
    setChecked(!checked);
  };

  const toggleDisable = () => {
    setDisabled(!disabled);
  };

  const onChange: CheckboxProps["onChange"] = (e) => {
    console.log("checked =", e.target.checked);
    setChecked(e.target.checked);
  };

  const label = `${checked ? "Checked" : "Unchecked"}-${disabled ? "Disabled" : "Enabled"}`;

  return (
    <>
      <Checkbox checked={checked} disabled={disabled} onChange={onChange} />

      <p style={{ marginBottom: "20px" }}>
        <Checkbox checked={checked} disabled={disabled} onChange={onChange}>
          {label}
        </Checkbox>
      </p>
      <p>
        <Button type="primary" size="small" onClick={toggleChecked}>
          {checked ? "Uncheck" : "Check"}
        </Button>
        <Button
          style={{ margin: "0 10px" }}
          type="primary"
          size="small"
          onClick={toggleDisable}
        >
          {disabled ? "Enable" : "Disable"}
        </Button>
      </p>
    </>
  );
};

export default App;
