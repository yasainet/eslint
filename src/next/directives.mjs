/** Enforce "use server" / "use client" directives per file convention. */
export const directivesConfigs = [
  {
    name: "directives/server-interactor",
    files: ["src/features/**/interactors/server.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Program > :first-child:not(ExpressionStatement[expression.value='use server'])",
          message:
            'interactors/server.ts must start with "use server" directive.',
        },
      ],
    },
  },
  {
    name: "directives/admin-interactor",
    files: ["src/features/**/interactors/admin.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Program > :first-child:not(ExpressionStatement[expression.value='use server'])",
          message:
            'interactors/admin.ts must start with "use server" directive.',
        },
      ],
    },
  },
  {
    name: "directives/client-interactor",
    files: ["src/features/**/interactors/client.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExpressionStatement[expression.value='use server']",
          message:
            'interactors/client.ts must NOT have "use server" directive. It uses @/lib/supabase/client.',
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
