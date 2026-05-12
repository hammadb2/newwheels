import next from "eslint-config-next";

const config = [
  ...next,
  {
    ignores: [".next/**", "node_modules/**", "out/**"],
  },
  {
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
];

export default config;
