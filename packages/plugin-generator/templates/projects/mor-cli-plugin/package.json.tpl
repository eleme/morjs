{
  "name": "<%= name %>",
  "version": "1.0.0",
  "description": "<%= desc %>",
  "author": "<%= user %> <<%= email %>>",
  "keywords": [
    "mor",
    "plugin"
  ],
  "main": "lib/index.js",
  "directories": {
    "lib": "lib"
  },
  "files": [
    "lib"
  ],
  "homepage": "",
  "license": "ISC",
  <% if (!_.isEmpty(git)) { %>"repository": {
    "type": "git",
    "url": "<%= git %>"
  },<%_ } -%>
  "scripts": {
    "clean": "rm -rf ./lib",
    "build": "pnpm clean && pnpm format && tsc",
    "dev": "tsc --watch",
    "format": "prettier src --write --ignore-path .gitignore --ignore-unknown",
    "prepare": "husky install",
    "release": "standard-version",
    "pre-release": "standard-version --prerelease beta"
  },
  "dependencies": {},
  "devDependencies": {
    "@morjs/cli": "*",
    "@commitlint/cli": "^17.0.3",
    "@commitlint/config-conventional": "^13.2.0",
    "@typescript-eslint/eslint-plugin": "^5.30.5",
    "@typescript-eslint/parser": "^5.30.5",
    "cz-conventional-changelog": "^3.3.0",
    "commitizen": "^4.2.4",
    "eslint": "^8.19.0",
    "eslint-define-config": "^1.2.0",
    "eslint-plugin-node": "^11.1.0",
    "husky": "^8.0.1",
    "lint-staged": "13.0.3",
    "prettier": "^2.7.1",
    "prettier-plugin-organize-imports": "^2.3.4",
    "standard-version": "^9.3.2",
    "typescript": "^4.7.4"
  },
  "config": {
    "commitizen": {
      "path": "./node_modules/cz-conventional-changelog"
    }
  },
  "lint-staged": {
    "*.ts": "eslint --cache --fix",
    "*.{js,ts,css,md}": "prettier --write"
  }
}
