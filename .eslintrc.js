module.exports = {
  "plugins": ["node"],
  "extends": ["eslint:recommended", "plugin:node/recommended"],
  "rules": {
    "node/exports-style": ["error", "module.exports"],
    "no-console": 0,
    "node/no-unsupported-features": ["error", {
      "version": 8,
      "ignores": []
    }]
  }
};