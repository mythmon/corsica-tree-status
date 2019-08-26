module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    ecmaFeatures: { jsx: true },
    project: "./tsconfig.json",
    extraFileExtensions: [".tsx"],
  },
  env: { browser: true, es6: true },
  plugins: ["react", "@typescript-eslint/eslint-plugin"],
  settings: { react: { version: "detect" } },
};
