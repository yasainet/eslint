export const LIB_BOUNDARY_PATTERNS = [
  {
    group: ["@/lib/*", "@/lib/**"],
    message:
      "lib/* は queries からのみ import 可。他層は queries 経由で使う。",
  },
];

export const MAPPING_PATTERNS = [
  {
    group: ["@/utils/mapping.util"],
    importNames: ["mapSnakeToCamel", "mapCamelToSnake"],
    message:
      "mapping 関数は services のみ許可。snake/camel 変換は service 境界で行う。",
  },
];
