export const LIB_BOUNDARY_PATTERNS = [
  {
    group: ["@/lib/*", "@/lib/**"],
    message:
      "lib/* can only be imported from queries (lib-boundary violation)",
  },
];

export const MAPPING_PATTERNS = [
  {
    group: ["@/utils/mapping.util"],
    importNames: ["mapSnakeToCamel", "mapCamelToSnake"],
    message:
      "Mapping functions are only allowed in services. Snake/camel conversion belongs at the service boundary.",
  },
];
