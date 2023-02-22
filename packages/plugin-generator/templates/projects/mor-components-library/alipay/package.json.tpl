{
  "name": "<%= name %>",
  "version": "1.0.0",
  "description": "<%= desc %>",
  "author": "<%= user %> <<%= email %>>",
  "homepage": "",
  "license": "ISC",
  <% if (typeof git !== 'undefined') { %>
  "repository": {
    "type": "git",
    "url": "<%= git %>"
  },
  <% } %>
  "main": "alipay",
  "alipay": "alipay",
  "miniprogram": "miniprogram_dist",
  "files": [
    "lib",
    "alipay",
    "miniprogram_dist"
  ],
  "scripts": {
    "clean": "rm -rf lib miniprogram_dist",
    "build": "npm run clean && mor compile --production --config mor.build.config.ts",
    "prepublishOnly": "npm run build",
    "compile": "mor compile",
    "dev": "mor compile --watch"
  },
  "dependencies": {
    "@morjs/core": "beta"
  },
  "peerDependencies": {
    "tslib": "2"
  },
  "devDependencies": {
    "@morjs/cli": "beta",
    "@commitlint/cli": "^17.0.3",
    "@commitlint/config-conventional": "^13.2.0",
    "@mini-types/alipay": "^2.0.0",
    "@typescript-eslint/eslint-plugin": "^5.30.5",
    "@typescript-eslint/parser": "^5.30.5",
    "cz-conventional-changelog": "^3.3.0",
    "eslint": "^8.19.0",
    "eslint-config-prettier": "^8.5.0",
    "eslint-import-resolver-typescript": "^3.2.4",
    "eslint-module-utils": "^2.7.3",
    "eslint-plugin-import": "^2.26.0",
    "eslint-plugin-prettier": "^4.2.1",
    "husky": "^8.0.1",
    "lint-staged": "13.0.3",
    "prettier": "^2.7.1",
    "stylelint": "^14.9.1",
    "stylelint-config-recess-order": "^3.0.0",
    "stylelint-config-standard": "^26.0.0",
    "stylelint-order": "^5.0.0"
  },
  "config": {
    "commitizen": {
      "path": "./node_modules/cz-conventional-changelog"
    }
  },
  "lint-staged": {
    "*.{ts,js}": [
      "eslint --fix",
      "git add"
    ],
    "*.{ts,js,json,md}": [
      "prettier --write",
      "git add"
    ]
  }
}
