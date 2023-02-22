{
  "name": "<%= name %>",
  "version": "1.0.0",
  "description": "<%= desc %> ",
  "homepage": "",
  "keywords": [
    "mor",
    "boilerplate",
    "<%= name %>"
  ],
  "authors": [
    "<%= user %> <<%= email %>>"
  ],
  "repository": {
    "type": "git",
    "url": "<%= git %>"
  },
  "files": [
    "templates",
    "custom-generator.ts"
  ],
  "main": "./custom-generator.ts",
  "scripts": {
    "lint": "eslint .",
    "format": "prettier --write .",
    "prepare": "husky install",
    "release": "standard-version"
  },
  "devDependencies": {
    "@commitlint/cli": "^13.2.1",
    "@commitlint/config-conventional": "^13.2.0",
    "@typescript-eslint/eslint-plugin": "^5.8.0",
    "@typescript-eslint/parser": "^5.8.0",
    "cz-conventional-changelog": "^3.3.0",
    "eslint": "^8.5.0",
    "eslint-define-config": "^1.2.0",
    "eslint-plugin-node": "^11.1.0",
    "husky": "^8.0.0",
    "lint-staged": "^11.2.6",
    "prettier": "^2.5.1",
    "prettier-plugin-organize-imports": "^2.3.4",
    "standard-version": "^9.3.2",
    "takin": "^0.1.6"
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
