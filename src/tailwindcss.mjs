import betterTailwindcss from "eslint-plugin-better-tailwindcss";

export default [
  {
    name: "tailwindcss/rules",
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "better-tailwindcss": betterTailwindcss },
    settings: {
      "better-tailwindcss": { entryPoint: "src/app/globals.css" },
    },
    rules: {
      "better-tailwindcss/enforce-consistent-class-order": "warn",
    },
  },
];
