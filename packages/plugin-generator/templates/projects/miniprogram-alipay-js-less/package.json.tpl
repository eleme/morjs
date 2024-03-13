{
  "name": "<%= name %>",
  "version": "1.0.0",
  "description": "<%= desc %>",
  "scripts": {
    "dev": "mor compile --watch",
    "compile": "mor compile --production"<% if (isSupportWeb) {%>,<% } %>
    <% if (isSupportWeb) { %>"dev:web": "mor compile --name web -w",
    <% } %><% if (isSupportWeb) { %>"compile:web": "mor compile --name web --production"
    <% } %>
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
