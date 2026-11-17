import nextConfig from "eslint-config-next";

export default [
  // Vendored from the editorcn shadcn registry; kept as shipped so it can be re-pulled.
  { ignores: ["src/components/block-editor/**"] },
  ...nextConfig,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
    },
  },
];
