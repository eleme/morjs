{
  "name": "<%= name %>",
  "version": "1.0.0",
  "description": "<%= desc %>",
  "scripts": {
    "dev": "mor compile --watch",
    "compile": "mor compile --production"
  },
  "keywords": [],
  <% if (user || email) { %>
  "author": "<%= user %> <<%= email %>>",
  <% } %>
  <% if (git) { %>
  "repository": {
    "type": "git",
    "url": "<%= git %>"
  },
  <% } %>
  "license": "",
  "dependencies": {
    "@morjs/core": "*"
  },
  "devDependencies": {
    "@morjs/cli": "*"
  }
}
