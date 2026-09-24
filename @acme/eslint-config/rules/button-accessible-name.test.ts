// Run with: node --test rules/  (Node strips the types; no test runner needed)
import { describe, it } from "node:test";
import { RuleTester } from "eslint";

import { buttonAccessibleNameRule } from "./button-accessible-name.ts";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

const missingName = [{ messageId: "missingName" }];

ruleTester.run("button-accessible-name", buttonAccessibleNameRule, {
  valid: [
    // Visible text.
    "<Button>Save</Button>",
    "<Button icon={<Plus />}>Add</Button>",
    // Named by an attribute.
    '<Button icon={<Plus />} aria-label="Add" />',
    '<Button icon={<Plus />} title="Add" />',
    '<Button srOnly="Add" icon={<Plus />} />',
    '<Button icon={<Icon icon="x" srOnly="Close" />} />',
    // Icon as a child, named by an attribute.
    'import { Minus } from "lucide-react"; <Button aria-label="Decrease"><Minus /></Button>',
    // Icon plus text is not icon-only.
    'import { Minus } from "lucide-react"; <Button><Minus /> Less</Button>',
    // Expressions and non-icon components may render text — not flagged.
    "<Button>{label}</Button>",
    '<Button><Trans id="save" /></Button>',
    'import { Minus } from "lucide-react"; <Button><Minus />{label}</Button>',
    // Component imported from somewhere that isn't an icon module.
    'import { Label } from "./label"; <Button><Label /></Button>',
    // A spread may carry the label.
    "<Button {...props}><svg /></Button>",
  ],
  invalid: [
    { code: "<Button icon={<Plus />} />", errors: missingName },
    { code: "<Button loading />", errors: missingName },
    // Icon-only via children: the font-size stepper's shape.
    {
      code: 'import { Minus } from "lucide-react"; <Button variant="outlined" shape="icon"><Minus className="size-3" /></Button>',
      errors: missingName,
    },
    {
      code: 'import { X } from "@acme/ui/icons"; <Button>\n  <X />\n</Button>',
      errors: missingName,
    },
    { code: "<Button><svg /></Button>", errors: missingName },
    {
      code: '<Button><Icon icon="icon-[lucide--x]" /></Button>',
      errors: missingName,
    },
    // Icon-named components don't need their import to be seen.
    { code: "<Button><TrashIcon /></Button>", errors: missingName },
    { code: "<Button><Icons.Trash /></Button>", errors: missingName },
    // Aliased import is still an icon.
    {
      code: 'import { Plus as Add } from "lucide-react"; <Button><Add /></Button>',
      errors: missingName,
    },
    // Two icons, still no name.
    {
      code: 'import { Plus, Minus } from "lucide-react"; <Button><Plus /><Minus /></Button>',
      errors: missingName,
    },
  ],
});
