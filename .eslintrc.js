module.exports = {
    root: true,
    env: {
      node: true,
      es2022: true
    },
    extends: [
        "plugin:vue/strongly-recommended",
        "eslint:recommended",
        "@vue/typescript/recommended",
        "prettier",
    ],
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/component-definition-name-casing': 'off'
    },
  };
