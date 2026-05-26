export const LIB_BOUNDARY_PATTERNS = [
  {
    regex: "^@/lib/(?!.*/utils$).+",
    message:
      "lib/* は queries からのみ import 可 (lib/**/utils.ts の純粋ヘルパーは全層から可)。他層は queries 経由で使う。",
  },
];

export const LIB_OUTBOUND_PATTERNS = [
  {
    regex: "^@/(?!lib/).+",
    message:
      "lib は app 内部 (@/features 等) を import 不可。lib は最下層の API 橋渡し。外部 SDK と @/lib/** のみ依存可。",
  },
];

export const LIB_UTILS_PURITY_PATTERNS = [
  ...LIB_OUTBOUND_PATTERNS,
  {
    regex: "^@/lib/(?!.*/types$).+",
    message:
      "lib/**/utils.ts は純粋ヘルパー。client/index は import 不可、@/lib/**/types のみ可。",
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
