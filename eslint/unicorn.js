import eslintPluginUnicorn from "eslint-plugin-unicorn";

export default [
  eslintPluginUnicorn.configs["flat/recommended"],
  {
    rules: {
      "unicorn/prevent-abbreviations": [
        "error",
        {
          allowList: {
            args: true,
            Args: true,
            def: true,
            Def: true,
            ref: true,
            Ref: true,
            params: true,
            Params: true,
            prev: true,
            Prev: true,
            prop: true,
            Prop: true,
            props: true,
            Props: true,
          },
        },
      ],
      "unicorn/no-nested-ternary": "off",
    },
  },
];
