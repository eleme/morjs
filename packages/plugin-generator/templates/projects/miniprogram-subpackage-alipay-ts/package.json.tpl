{
  "name": "<%= name %>",
  "version": "1.0.0",
  "description": "<%= desc %>",
  "scripts": {
    "dev": "mor compile --watch",
    "compile": "mor compile --production"
  },
  "keywords": [],
  <%_ if (user || email) { -%>
  "author": "<%= user %> <<%= email %>>",
  <%_ } -%>
  <%_ if (git) { -%>
  "repository": {
    "type": "git",
    "url": "<%= git %>"
  },
  <%_ } -%>
  "license": "",
  "dependencies": {
    "@morjs/core": "*"
  },
  "devDependencies": {
    "@morjs/cli": "*"
  }
}
