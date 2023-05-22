{
  "plugins": [
    "@typescript-eslint",
    "prettier"
  ],
  "extends": [
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "plugin:prettier/recommended"
  ],
  "rules": {
    "prettier/prettier": 1,
    "no-mixed-operators": [0],
    "no-unused-expressions": [0],
    "class-methods-use-this": "off",
    "prefer-promise-reject-errors": "off",
    "camelcase": [0],
    "no-param-reassign": [0],
    "no-underscore-dangle": [0],
    "no-bitwise": ["error", { "allow": ["~", "<<"] }],
    "no-console": [0],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/ban-ts-comment": "off"
  },
  "env": {
    "es6": true,
    "browser": true
  },
  "globals": {
    "Page": true,
    "my": true,
    "wx": true,
    "swan": true,
    "tt": true,
    "getApp": true,
    "getCurrentPages": true,
    "Component": true,
    "App": true,
    "require": true,
    "requirePlugin": true,
    "AlipayJSBridge": true,
    "module": true
  },
  "settings": {
    "import/resolver": {
      "node": {
        "extensions": [".js", ".ts"]
      }
    }
  },
  "overrides": [
    {
      "files": ["mor.config.ts"],
      "rules": {
        "import/no-extraneous-dependencies": "off",
        "import/no-commonjs": "off",
        "func-names": "off"
      }
    }
  ]
}
