import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Downgrade no-explicit-any to warning since there are many instances
      "@typescript-eslint/no-explicit-any": "warn",
      // Downgrade unused vars to warning
      "@typescript-eslint/no-unused-vars": "warn",
      // Keep these as errors as they're easy to fix
      "react/no-unescaped-entities": "warn",
      "@next/next/no-html-link-for-pages": "error",
      "@typescript-eslint/no-require-imports": "error",
      "@typescript-eslint/ban-ts-comment": "error",
      "prefer-const": "error",
      "react-hooks/rules-of-hooks": "warn",
    },
  },
];

export default eslintConfig;
