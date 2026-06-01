import jsdocPlugin from "eslint-plugin-jsdoc";

import { featuresGlob } from "../_internal/constants.mjs";

/**
 * queries / services の public 関数に JSDoc を必須化する:
 *
 * - 「非自明か」の免除判断を作らせないため require を決定論的に強制する
 * - 冗長でも全関数で強制し例外ゼロ＝判断ゼロを優先する
 * - description が Why-not か What かは機械判断できず Claude に委ねる
 * - TS が型の真実源なので tags は強制しない（@param 等は二重写し）
 */
export function createJsdocConfigs({ featureRoot }) {
  return [
    {
      name: "jsdoc",
      files: [
        ...featuresGlob(featureRoot, "**/queries/*.ts"),
        ...featuresGlob(featureRoot, "**/services*/*.ts"),
      ],
      plugins: {
        jsdoc: jsdocPlugin,
      },
      rules: {
        "jsdoc/require-jsdoc": [
          "warn",
          {
            publicOnly: true,
            require: {
              FunctionDeclaration: true,
              ArrowFunctionExpression: true,
              FunctionExpression: true,
            },
            checkGetters: false,
            checkSetters: false,
            checkConstructors: false,
          },
        ],
        "jsdoc/require-description": [
          "warn",
          {
            contexts: ["any"],
          },
        ],
      },
    },
  ];
}
