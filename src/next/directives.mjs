export const directivesConfigs = [
  {
    name: "directives/server-action",
    files: ["src/features/**/actions/server.action.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Program > :first-child:not(ExpressionStatement[expression.value='use server'])",
          message: 'server.action.ts must start with "use server" directive.',
        },
      ],
    },
  },
  {
    name: "directives/admin-action",
    files: ["src/features/**/actions/admin.action.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Program > :first-child:not(ExpressionStatement[expression.value='use server'])",
          message: 'admin.action.ts must start with "use server" directive.',
        },
      ],
    },
  },
  {
    name: "directives/client-action",
    files: ["src/features/**/actions/client.action.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExpressionStatement[expression.value='use server']",
          message:
            'client.action.ts must NOT have "use server" directive. It uses @/lib/supabase/client.',
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
