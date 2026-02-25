/**
 * @fileoverview Cardinality constraints for action-domain relationships.
 *
 * Each action file can only import its matching domain:
 * - server.action.ts → server.domain.ts only
 * - client.action.ts → client.domain.ts only
 * - admin.action.ts → admin.domain.ts only
 *
 * This prevents mixing server-side and client-side logic.
 */

/**
 * Cardinality constraint configurations.
 * @type {import("eslint").Linter.Config[]}
 */
export const cardinalityConfigs = [
  {
    name: "cardinality/server-action",
    files: ["**/actions/server.action.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/domain/client.domain*", "**/domain/admin.domain*"],
              message:
                "server.action can only import server.domain (cardinality violation)",
            },
          ],
        },
      ],
    },
  },
  {
    name: "cardinality/client-action",
    files: ["**/actions/client.action.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/domain/server.domain*", "**/domain/admin.domain*"],
              message:
                "client.action can only import client.domain (cardinality violation)",
            },
          ],
        },
      ],
    },
  },
  {
    name: "cardinality/admin-action",
    files: ["**/actions/admin.action.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/domain/server.domain*", "**/domain/client.domain*"],
              message:
                "admin.action can only import admin.domain (cardinality violation)",
            },
          ],
        },
      ],
    },
  },
];
