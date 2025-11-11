module.exports = {
  root: true,
  env: { browser: true, es2023: true, node: true },
  extends: ["eslint:recommended", "plugin:react-hooks/recommended"],
  parserOptions: {
    ecmaVersion: 2023,
    sourceType: "module"
  }
};
