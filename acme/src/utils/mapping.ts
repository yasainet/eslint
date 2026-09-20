import camelcaseKeys from "camelcase-keys";

type CamelCase<S extends string> = S extends `${infer P}_${infer Q}`
  ? `${P}${Capitalize<CamelCase<Q>>}`
  : S;

export type SnakeToCamel<T> = {
  [K in keyof T as K extends string ? CamelCase<K> : never]: T[K] extends Array<
    infer U
  >
    ? Array<U>
    : T[K] extends object
      ? SnakeToCamel<T[K]>
      : T[K];
};

export function mapSnakeToCamel<T>(data: unknown): T {
  if (data === null || data === undefined) {
    return data as T;
  }
  return camelcaseKeys(data as Record<string, unknown>, { deep: true }) as T;
}
