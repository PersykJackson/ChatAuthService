import globals from "globals";
import tseslint from "@typescript-eslint/eslint-plugin";
import tseslintParser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: globals.browser,
    },
    plugins: {
      prettier: prettierPlugin,
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "prettier/prettier": "error",
    },
  },
  {
    ignores: ["dist/**"],
    rules: {
      ...prettierConfig.rules,
      'semi': ['error', 'always'],
      'max-len': ['error', { 'code': 120 }],
    },
  },
];
