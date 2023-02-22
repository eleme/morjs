# 代码样式规范

`MorJS` 仓库已配置了 `eslint`、`tsconfig.json`、`prettier`、`husky`、`lint-staged` 等 `lint` 工具和格式化工具，用于确保多人协作下的代码样式和编码习惯保持基本一致。

以下为项目中各个 `lint` 的配置，如无必要，请勿修改。

## `eslint` 配置

```javascript
// @ts-check
const { defineConfig } = require('eslint-define-config')

module.exports = defineConfig({
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020
  },
  globals: {
    my: true,
    wx: true,
    tt: true,
    qq: true,
    swan: true,
    dd: true,
    Swiper: true
  },
  env: {
    node: true,
    browser: true,
    es6: true
  },
  rules: {
    eqeqeq: ['warn', 'always', { null: 'never' }],
    'no-debugger': ['error'],
    'no-empty': ['warn', { allowEmptyCatch: true }],
    'no-process-exit': 'off',
    'no-useless-escape': 'off',
    'prefer-const': [
      'warn',
      {
        destructuring: 'all'
      }
    ],

    'node/no-missing-import': [
      'error',
      {
        allowModules: ['types', 'estree', 'testUtils', 'stylus'],
        tryExtensions: ['.ts', '.js', '.d.ts']
      }
    ],
    'node/no-missing-require': [
      'error',
      {
        // for try-catching yarn pnp
        allowModules: ['pnpapi'],
        tryExtensions: ['.ts', '.js', '.d.ts']
      }
    ],
    'node/no-deprecated-api': 'off',
    'node/no-unpublished-import': 'off',
    'node/no-unpublished-require': 'off',
    'node/no-unsupported-features/es-syntax': 'off',
    '@typescript-eslint/no-empty-function': [
      'error',
      { allow: ['arrowFunctions'] }
    ],
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-extra-semi': 'off', // conflicts with prettier
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-var-requires': 'off'
  },
  overrides: [
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off'
      }
    },
    {
      files: ['*.d.ts'],
      rules: {
        '@typescript-eslint/triple-slash-reference': 'off'
      }
    }
  ]
})
```

## `tsconfig.json` 配置

基础 `tsconfig.base.json` 配置

```json
{
  "compilerOptions": {
    "declaration": true,
    "target": "ES2019",
    "importHelpers": true,
    "moduleResolution": "Node",
    "sourceMap": true,
    "noImplicitOverride": true,
    "noUnusedLocals": true,
    "esModuleInterop": true,
    "lib": ["ES6", "ESNext", "DOM"]
  }
}
```

运行时 `tsconfig.json` 配置

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES5",
    "rootDir": "./src",
    "outDir": "./lib",
    "module": "CommonJS",
    "skipLibCheck": true,
    "typeRoots": ["./node_modules/@types/"]
  },
  "include": ["./src"]
}
```

编译时 `tsconfig.json` 配置

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./lib",
    "module": "CommonJS",
    "typeRoots": ["./node_modules/@types/"]
  },
  "include": ["src"]
}
```

## `prettier` 配置

```json
{
  "semi": false,
  "tabWidth": 2,
  "singleQuote": true,
  "printWidth": 80,
  "trailingComma": "none",
  "overrides": [
    {
      "files": ["*.json5"],
      "options": {
        "singleQuote": false,
        "quoteProps": "preserve"
      }
    },
    {
      "files": ["*.yml"],
      "options": {
        "singleQuote": false
      }
    }
  ],
  "plugins": ["prettier-plugin-organize-imports"]
}
```
