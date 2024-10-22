import eslintPluginUnicorn from "eslint-plugin-unicorn";

/** @type {Awaited<import('typescript-eslint').Config>} */
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
            ctx: true,
            Ctx: true,
            def: true,
            Def: true,
            e: true,
            env: true,
            Env: true,
            opts: true,
            Opts: true,
            ref: true,
            Ref: true,
            param: true,
            Param: true,
            params: true,
            Params: true,
            prev: true,
            Prev: true,
            prop: true,
            Prop: true,
            props: true,
            Props: true,
            src: true,
            Src: true,
          },
        },
      ],
      "unicorn/no-nested-ternary": "off",
    },
  },
];
