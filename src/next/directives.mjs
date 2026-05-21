export const directivesConfigs = [
  {
    name: "directives/server-entry",
    files: ["src/features/**/entries/server.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Program > :first-child:not(ExpressionStatement[expression.value='use server'])",
          message:
            'entries/server.ts must start with "use server" directive.',
        },
      ],
    },
  },
  {
    name: "directives/admin-entry",
    files: ["src/features/**/entries/admin.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Program > :first-child:not(ExpressionStatement[expression.value='use server'])",
          message:
            'entries/admin.ts must start with "use server" directive.',
        },
      ],
    },
  },
  {
    name: "directives/client-entry",
    files: ["src/features/**/entries/client.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExpressionStatement[expression.value='use server']",
          message:
            'entries/client.ts must NOT have "use server" directive. It uses @/lib/supabase/client.',
        },
      ],
    },
  },
  {
    name: "directives/hooks",
    files: ["src/features/**/hooks/*.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Program > :first-child:not(ExpressionStatement[expression.value='use client'])",
          message: 'Hooks must start with "use client" directive.',
        },
      ],
    },
  },
];
