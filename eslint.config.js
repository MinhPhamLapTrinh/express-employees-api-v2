import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  { files: ["**/*.js"], languageOptions: { sourceType: "module" } },
  {
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.module,
        ...globals.es2024,
        ...globals.node,
        ...globals.jest,
      },
    },
  },
  pluginJs.configs.recommended,
];
