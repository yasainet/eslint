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
            'entries/server.ts は先頭に "use server" directive が必須。',
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
            'entries/admin.ts は先頭に "use server" directive が必須。',
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
            'entries/client.ts は "use server" 禁止。@/lib/supabase/client を使うため。',
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
          message: 'hooks は先頭に "use client" directive が必須。',
        },
      ],
    },
  },
];
