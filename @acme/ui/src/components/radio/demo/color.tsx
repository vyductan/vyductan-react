import type React from "react";
import { useState } from "react";

import type { RadioChangeEvent } from "@acme/ui/components/radio";
import { RadioGroup } from "@acme/ui/components/radio";

import type { RadioOptionType } from "../radio-group";

const options: RadioOptionType<string>[] = [
  { label: "Primary", value: "1", color: "default", className: "label-1" },
  { label: "Success", value: "2", color: "success" },
  { label: "Processing", value: "3", color: "primary", className: "label-3" },
  { label: "Error", value: "4", color: "red", className: "label-4" },
  { label: "Warning", value: "5", color: "amber", className: "label-5" },
  {
    label: "Disabled",
    value: "6",
    color: "default",
    className: "label-6",
    disabled: true,
  },
];

const numberOptions: RadioOptionType<number>[] = [
  { label: "Primary", value: 1, color: "default", className: "label-1" },
  { label: "Success", value: 2, color: "success" },
  { label: "Processing", value: 3, color: "primary", className: "label-3" },
  { label: "Error", value: 4, color: "red", className: "label-4" },
  { label: "Warning", value: 5, color: "amber", className: "label-5" },
  {
    label: "Disabled",
    value: 6,
    color: "default",
    className: "label-6",
    disabled: true,
  },
];

// const optionsWithDisabled: RadioOptionType<string>[] = [
//   {
//     label: "Default",
//     value: "d",
//     color: "default",
//     className: "label-d",
//     disabled: true,
//   },
//   { label: "Primary", value: "p", color: "primary", className: "label-p" },
//   { label: "Blue", value: "f", color: "blue", className: "label-f" },
//   { label: "Green", value: "g", color: "green", className: "label-g" },
//   { label: "Purple", value: "h", color: "purple", className: "label-h" },
//   {
//     label: "Pink",
//     value: "i",
//     color: "pink",
//     className: "label-i",
//     disabled: true,
//   },
//   {
//     label: "Teal",
//     value: "j",
//     color: "teal",
//     className: "label-j",
//     disabled: true,
//   },
// ];

const App: React.FC = () => {
  const [value1, setValue1] = useState("1");
  const [value2, setValue2] = useState(1);
  const [value3, setValue3] = useState("1");
  const [value4, setValue4] = useState("1");

  const onChange1 = ({ target: { value } }: RadioChangeEvent<string>) => {
    console.log("radio1 checked", value);
    setValue1(value);
  };

  const onChange2 = ({ target: { value } }: RadioChangeEvent<number>) => {
    console.log("radio2 checked", value);
    setValue2(value);
  };

  const onChange3 = ({ target: { value } }: RadioChangeEvent<string>) => {
    console.log("radio3 checked", value);
    setValue3(value);
  };
  const onChange4 = ({ target: { value } }: RadioChangeEvent<string>) => {
    console.log("radio4 checked", value);
    setValue4(value);
  };

  return (
    <>
      <br />
      <RadioGroup value={value1} options={options} onChange={onChange1} />
      <RadioGroup value={value2} options={numberOptions} onChange={onChange2} />
      <br />
      <RadioGroup
        value={value3}
        options={options}
        onChange={onChange3}
        optionType="button"
      />
      <br />
      <br />
      <RadioGroup
        options={options}
        value={value4}
        onChange={onChange4}
        optionType="button"
        buttonStyle="solid"
      />
    </>
  );
};

export default App;

// const App: React.FC = () => {
//   const [value1, setValue1] = useState("1");
//   const [value2, setValue2] = useState("a");

//   return (
//     <div className="space-y-6">
//       <div className="space-y-2">
//         <h4 className="text-sm font-medium">Basic Radio with Colors</h4>
//         <div className="space-y-4">
//           <RadioGroup
//             options={[
//               { label: "Primary", value: "1", color: "default" },
//               { label: "Success", value: "2", color: "success" },
//               { label: "Processing", value: "3", color: "primary" },
//               { label: "Error", value: "4", color: "red" },
//               { label: "Warning", value: "5", color: "amber" },
//             ]}
//             onChange={setValue1}
//             value={value1}
//           />
//         </div>
//       </div>

//       <div className="space-y-2">
//         <h4 className="text-sm font-medium">
//           Outline Button Style with Colors
//         </h4>
//         <div className="space-y-4">
//           <RadioGroup
//             options={[
//               { label: "Default", value: "a", color: "default" },
//               { label: "Primary", value: "p", color: "primary" },
//               { label: "Success", value: "b", color: "success" },
//               { label: "Processing", value: "c", color: "primary" },
//               { label: "Error", value: "d", color: "red" },
//               { label: "Warning", value: "e", color: "amber" },
//             ]}
//             onChange={setValue2}
//             value={value2}
//             optionType="button"
//           />
//         </div>
//       </div>

//       <div className="space-y-2">
//         <h4 className="text-sm font-medium">Solid Button Style with Colors</h4>
//         <div className="space-y-4">
//           <RadioGroup
//             options={[
//               { label: "Default", value: "d", color: "default" },
//               { label: "Primary", value: "p", color: "primary" },
//               { label: "Blue", value: "f", color: "blue" },
//               { label: "Green", value: "g", color: "green" },
//               { label: "Purple", value: "h", color: "purple" },
//               { label: "Pink", value: "i", color: "pink" },
//               { label: "Teal", value: "j", color: "teal" },
//             ]}
//             defaultValue="d"
//             optionType="button"
//             buttonStyle="solid"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default App;
