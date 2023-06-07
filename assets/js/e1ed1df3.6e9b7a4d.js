"use strict";(self.webpackChunkmorjs_site=self.webpackChunkmorjs_site||[]).push([[1902],{9613:(n,e,o)=>{o.d(e,{Zo:()=>c,kt:()=>d});var t=o(9496);function r(n,e,o){return e in n?Object.defineProperty(n,e,{value:o,enumerable:!0,configurable:!0,writable:!0}):n[e]=o,n}function a(n,e){var o=Object.keys(n);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(n);e&&(t=t.filter((function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable}))),o.push.apply(o,t)}return o}function i(n){for(var e=1;e<arguments.length;e++){var o=null!=arguments[e]?arguments[e]:{};e%2?a(Object(o),!0).forEach((function(e){r(n,e,o[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(o)):a(Object(o)).forEach((function(e){Object.defineProperty(n,e,Object.getOwnPropertyDescriptor(o,e))}))}return n}function s(n,e){if(null==n)return{};var o,t,r=function(n,e){if(null==n)return{};var o,t,r={},a=Object.keys(n);for(t=0;t<a.length;t++)o=a[t],e.indexOf(o)>=0||(r[o]=n[o]);return r}(n,e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(n);for(t=0;t<a.length;t++)o=a[t],e.indexOf(o)>=0||Object.prototype.propertyIsEnumerable.call(n,o)&&(r[o]=n[o])}return r}var l=t.createContext({}),p=function(n){var e=t.useContext(l),o=e;return n&&(o="function"==typeof n?n(e):i(i({},e),n)),o},c=function(n){var e=p(n.components);return t.createElement(l.Provider,{value:e},n.children)},k="mdxType",u={inlineCode:"code",wrapper:function(n){var e=n.children;return t.createElement(t.Fragment,{},e)}},m=t.forwardRef((function(n,e){var o=n.components,r=n.mdxType,a=n.originalType,l=n.parentName,c=s(n,["components","mdxType","originalType","parentName"]),k=p(o),m=r,d=k["".concat(l,".").concat(m)]||k[m]||u[m]||a;return o?t.createElement(d,i(i({ref:e},c),{},{components:o})):t.createElement(d,i({ref:e},c))}));function d(n,e){var o=arguments,r=e&&e.mdxType;if("string"==typeof n||r){var a=o.length,i=new Array(a);i[0]=m;var s={};for(var l in e)hasOwnProperty.call(e,l)&&(s[l]=e[l]);s.originalType=n,s[k]="string"==typeof n?n:r,i[1]=s;for(var p=2;p<a;p++)i[p]=o[p];return t.createElement.apply(null,i)}return t.createElement.apply(null,o)}m.displayName="MDXCreateElement"},6239:(n,e,o)=>{o.r(e),o.d(e,{assets:()=>l,contentTitle:()=>i,default:()=>u,frontMatter:()=>a,metadata:()=>s,toc:()=>p});var t=o(795),r=(o(9496),o(9613));const a={title:"Takin \u4ecb\u7ecd"},i="Takin",s={unversionedId:"api/takin",id:"api/takin",title:"Takin \u4ecb\u7ecd",description:"\u4ec0\u4e48\u662f Takin",source:"@site/docs/api/takin.md",sourceDirName:"api",slug:"/api/takin",permalink:"/api/takin",draft:!1,tags:[],version:"current",frontMatter:{title:"Takin \u4ecb\u7ecd"},sidebar:"apiSidebar",previous:{title:"Hooks",permalink:"/api/engineering-hooks"},next:{title:"Takin API",permalink:"/api/engineering-takin"}},l={},p=[{value:"\u4ec0\u4e48\u662f Takin",id:"\u4ec0\u4e48\u662f-takin",level:2},{value:"\u539f\u7406\u53ca\u6d41\u7a0b\u4ecb\u7ecd",id:"\u539f\u7406\u53ca\u6d41\u7a0b\u4ecb\u7ecd",level:2},{value:"\u57fa\u672c\u7528\u6cd5",id:"\u57fa\u672c\u7528\u6cd5",level:2},{value:"\u5feb\u901f\u5f00\u53d1\u4e00\u4e2a\u547d\u4ee4\u884c\u5de5\u5177",id:"\u5feb\u901f\u5f00\u53d1\u4e00\u4e2a\u547d\u4ee4\u884c\u5de5\u5177",level:3},{value:"\u914d\u7f6e takin \u529f\u80fd",id:"\u914d\u7f6e-takin-\u529f\u80fd",level:3},{value:"\u5b9a\u5236\u914d\u7f6e\u6587\u4ef6",id:"\u5b9a\u5236\u914d\u7f6e\u6587\u4ef6",level:4},{value:"\u591a\u914d\u7f6e\u80fd\u529b",id:"\u591a\u914d\u7f6e\u80fd\u529b",level:4},{value:"\u63a5\u53e3\u53ca\u63d2\u4ef6\u5f00\u53d1",id:"\u63a5\u53e3\u53ca\u63d2\u4ef6\u5f00\u53d1",level:2},{value:"\u63d2\u4ef6\u5b9a\u4e49",id:"\u63d2\u4ef6\u5b9a\u4e49",level:3},{value:"Hooks \u652f\u6301",id:"hooks-\u652f\u6301",level:3},{value:"\u5982\u4f55\u6269\u5c55 Hooks",id:"\u5982\u4f55\u6269\u5c55-hooks",level:3},{value:"\u63a5\u53e3",id:"\u63a5\u53e3",level:3}],c={toc:p},k="wrapper";function u(n){let{components:e,...o}=n;return(0,r.kt)(k,(0,t.Z)({},c,o,{components:e,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"takin"},"Takin"),(0,r.kt)("h2",{id:"\u4ec0\u4e48\u662f-takin"},"\u4ec0\u4e48\u662f Takin"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"takin")," \u662f\u4e00\u4e2a\u7528\u4e8e\u5f00\u53d1\u590d\u6742\u547d\u4ee4\u884c\u5de5\u5177\u7684\u57fa\u7840\u5e93\uff0c\u63d0\u4f9b\u5982\u4e0b\u7684\u80fd\u529b:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"\u76f8\u5bf9\u5b8c\u5584\u53ca\u7075\u6d3b\u7684\u63d2\u4ef6\u673a\u5236"),(0,r.kt)("li",{parentName:"ul"},"\u652f\u6301\u591a\u914d\u7f6e\u53ca\u591a\u4efb\u52a1\u673a\u5236"),(0,r.kt)("li",{parentName:"ul"},"\u9ad8\u5ea6\u53ef\u6269\u5c55\u7684\u63d2\u4ef6\u751f\u6001"),(0,r.kt)("li",{parentName:"ul"},"\u53ef\u7075\u6d3b\u65b0\u589e\u3001\u5b9a\u5236\u53ca\u6269\u5c55\u547d\u4ee4\u884c"),(0,r.kt)("li",{parentName:"ul"},"\u53cb\u597d\u7684 ",(0,r.kt)("inlineCode",{parentName:"li"},"typescript")," \u7c7b\u578b\u652f\u6301"),(0,r.kt)("li",{parentName:"ul"},"\u4e0d\u7ed1\u5b9a\u6253\u5305\u5de5\u5177, \u5982 webpack\u3001vite \u7b49"),(0,r.kt)("li",{parentName:"ul"},"\u652f\u6301\u901a\u8fc7 API \u8c03\u7528\u6ce8\u518c\u547d\u4ee4")),(0,r.kt)("p",null,"\u4e3a\u4ec0\u4e48\u5f00\u53d1\u8fd9\u4e2a\u5de5\u5177\u800c\u4e0d\u662f\u4f7f\u7528\u5df2\u6709\u7684 ",(0,r.kt)("inlineCode",{parentName:"p"},"build-scripts")," ?"),(0,r.kt)("p",null,"\u5728 MorJS \u5347\u7ea7\u8ba1\u5212\u542f\u52a8\u521d\u671f\uff0c\u7684\u786e\u66fe\u4ed4\u7ec6\u8bc4\u4f30\u8fc7\u662f\u5426\u8981\u4f7f\u7528\u96c6\u56e2\u7684 ",(0,r.kt)("inlineCode",{parentName:"p"},"build-scripts"),", \u6bd5\u7adf\u5176\u7528\u6237\u5e7f\u6cdb\u3001\u66f4\u52a0\u6210\u719f\u4e14\u5df2\u7ecf\u6709\u4e86\u4e30\u5bcc\u7684\u63d2\u4ef6\u751f\u6001\uff0c\u4f46\u7efc\u5408\u8bc4\u4f30\u4e0b\u6765\uff0c\u7531\u4e8e\u79cd\u79cd\u9650\u5236\u56e0\u7d20\uff0c",(0,r.kt)("inlineCode",{parentName:"p"},"build-scripts")," \u5e76\u4e0d\u80fd\u5f88\u597d\u7684\u6ee1\u8db3 MorJS \u5347\u7ea7\u6539\u9020\u573a\u666f\uff0c\u5982\uff1a"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"\u5199\u6b7b\u7684 ",(0,r.kt)("inlineCode",{parentName:"li"},"start|build|test")," \u547d\u4ee4\u4e14\u4e0d\u652f\u6301\u6269\u5c55"),(0,r.kt)("li",{parentName:"ul"},"\u7c7b\u578b\u63d0\u793a\u4e0d\u53cb\u597d, \u5982\u63d2\u4ef6\u7f16\u5199\u3001\u7528\u6237\u914d\u7f6e\u7b49"),(0,r.kt)("li",{parentName:"ul"},"\u4e0d\u652f\u6301\u6269\u5c55\u751f\u547d\u5468\u671f"),(0,r.kt)("li",{parentName:"ul"},"\u4e0d\u652f\u6301\u81ea\u5b9a\u4e49\u914d\u7f6e\u6587\u4ef6, \u53ea\u80fd\u4f7f\u7528 build.json"),(0,r.kt)("li",{parentName:"ul"},"\u7ed1\u5b9a\u4e86 webpack \u4e14\u56e0\u4e3a\u67d0\u4e9b\u539f\u56e0\u6682\u65f6\u53ea\u80fd\u4f7f\u7528 webpack 4"),(0,r.kt)("li",{parentName:"ul"},"\u4e0d\u652f\u6301\u901a\u8fc7 API \u8c03\u7528\u5df2\u6ce8\u518c\u7684\u547d\u4ee4"),(0,r.kt)("li",{parentName:"ul"},"\u65e5\u5fd7\u8f93\u51fa\u4e0d\u591f\u4f18\u7f8e")),(0,r.kt)("p",null,"\u6240\u4ee5\uff0c\u57fa\u4e8e\u4e0a\u8ff0\u539f\u56e0\uff0c\u6211\u4eec\u5f00\u53d1\u4e86 ",(0,r.kt)("inlineCode",{parentName:"p"},"takin")," \u8fd9\u4e2a\u5de5\u5177\u5e93\uff0c\u671f\u671b\u5728\u6ee1\u8db3 MorJS \u672c\u8eab\u67b6\u6784\u8bc9\u6c42\u7684\u57fa\u7840\u4e0a\uff0c\u80fd\u591f\u8fdb\u4e00\u6b65\u4f5c\u4e3a\u997f\u4e86\u4e48\u672a\u6765\u7684\u547d\u4ee4\u884c\u57fa\u7840\u5de5\u5177\u4f9b\u5404\u4e2a\u56e2\u961f\u4f7f\u7528\u548c\u6269\u5c55\u3002"),(0,r.kt)("h2",{id:"\u539f\u7406\u53ca\u6d41\u7a0b\u4ecb\u7ecd"},"\u539f\u7406\u53ca\u6d41\u7a0b\u4ecb\u7ecd"),(0,r.kt)("img",{src:"https://img.alicdn.com/imgextra/i1/O1CN01XMVGfc1m657YFC345_!!6000000004904-2-tps-6763-4669.png",width:"1200"}),(0,r.kt)("h2",{id:"\u57fa\u672c\u7528\u6cd5"},"\u57fa\u672c\u7528\u6cd5"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"takin")," \u5185\u90e8\u4ec5\u4ec5\u5185\u7f6e\u4e86\u90e8\u5206\u5168\u5c40\u547d\u4ee4\u884c\u9009\u9879\uff0c\u5e76\u672a\u5185\u7f6e\u4efb\u4f55\u547d\u4ee4\uff0c\u5168\u90e8\u529f\u80fd\u53ef\u901a\u8fc7\u63d2\u4ef6\u6765\u5b9e\u73b0\u3002"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"\u5185\u7f6e\u5168\u5c40\u547d\u4ee4\u9009\u9879:\n\n  --cwd [cwd]            \u5f53\u524d\u5de5\u4f5c\u76ee\u5f55, \u9ed8\u8ba4\u4e3a process.cwd()\n  -c, --config [path]    \u6307\u5b9a\u81ea\u5b9a\u4e49\u914d\u7f6e\u6587\u4ef6\u8def\u5f84, \u652f\u6301 .js, .ts, .json, .mjs \u7b49\u7c7b\u578b, \u5982 takin.config.js\n  --ignore-config        \u5ffd\u7565\u6216\u4e0d\u81ea\u52a8\u8f7d\u5165\u7528\u6237\u914d\u7f6e\u6587\u4ef6\n  --no-autoload-plugins  \u5173\u95ed\u81ea\u52a8\u8f7d\u5165\u63d2\u4ef6\u529f\u80fd (default: true)\n  -h, --help             \u663e\u793a\u5e2e\u52a9\u4fe1\u606f\n")),(0,r.kt)("h3",{id:"\u5feb\u901f\u5f00\u53d1\u4e00\u4e2a\u547d\u4ee4\u884c\u5de5\u5177"},"\u5feb\u901f\u5f00\u53d1\u4e00\u4e2a\u547d\u4ee4\u884c\u5de5\u5177"),(0,r.kt)("p",null,"\u4e0b\u9762\u6211\u4eec\u5c06\u6f14\u793a\u5982\u4f55\u5feb\u901f\u5f00\u53d1\u4e00\u4e2a\u547d\u4ee4\u884c\u5de5\u5177 \ud83d\udc47\ud83c\udffb"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"/**\n * 0. \u4ece\u5b89\u88c5 takin \u4f5c\u4e3a\u4f9d\u8d56, \u5e76\u65b0\u5efa\u4e00\u4e2a index.ts \u5f00\u59cb\n *    \u6267\u884c\u547d\u4ee4: npm i takin --save\n *    \u6267\u884c\u547d\u4ee4: touch index.ts\n */\n\n/**\n * 1. \u5f15\u5165 takin \u4f5c\u4e3a\u4f9d\u8d56\n */\nimport * as takin from 'takin'\n\n/**\n * 2. \u4e3a\u81ea\u5df1\u7684\u547d\u4ee4\u884c\u53d6\u4e00\u4e2a\u540d\u5b57, \u6bd4\u5982 MorJS \u5e76\u5bfc\u51fa\n */\nexport const mor = takin.takin('mor')\n\n/**\n * 3. \u7f16\u5199\u4f60\u7684\u7b2c\u4e00\u4e2a\u63d2\u4ef6\n */\nclass MyFirstTakinPlugin implements takin.Plugin {\n  name = 'MyFirstTakinPlugin'\n  apply(runner: takin.Runner) {\n    runner.hooks.cli.tap(this.name, function (cli) {\n      // \u5f00\u542f\u5e2e\u52a9\u4fe1\u606f\u663e\u793a\n      cli.help()\n\n      // \u5f00\u542f\u7248\u672c\u4fe1\u606f\u663e\u793a\n      cli.version('1.0.0')\n\n      // \u6ce8\u518c\u547d\u4ee4\n      cli\n        .command('compile [srcPath]', '\u7f16\u8bd1\u547d\u4ee4, \u652f\u6301\u6307\u5b9a\u6e90\u7801\u76ee\u5f55')\n        .option('--output-path [outputPath]', '\u6307\u5b9a\u4ea7\u7269\u76ee\u5f55')\n        .option('--production', '\u662f\u5426\u5f00\u542f\u751f\u4ea7\u6a21\u5f0f')\n        // \u6ce8\u518c\u547d\u4ee4\u884c\u6267\u884c\u51fd\u6570\n        .action(function (command: takin.CommandOptions) {\n          // \u6253\u5370\u547d\u4ee4\u884c\u76f8\u5173\u4fe1\u606f\n          console.log(command)\n        })\n    })\n\n    // \u6ce8\u518c\u7528\u6237\u914d\u7f6e\n    runner.hooks.registerUserConfig.tap(this.name, function (schema, zod) {\n      return schema.extend({\n        mode: zod.nativeEnum(['production', 'development']).optional()\n      })\n    })\n  }\n}\n\n/**\n * 4. \u5e94\u7528\u63d2\u4ef6\n */\nmor.use([new MyFirstTakinPlugin()])\n\n/**\n * 5. \u8c03\u7528 `run` \u547d\u4ee4\u542f\u52a8\n */\nmor.run()\n")),(0,r.kt)("p",null,"\u7f16\u8bd1\u4e0a\u8ff0\u6587\u4ef6\u4e3a ",(0,r.kt)("inlineCode",{parentName:"p"},"index.js")," \u6587\u4ef6\u4e4b\u540e(\u4e5f\u53ef\u4ee5\u76f4\u63a5\u4f7f\u7528 javascript \u6765\u7f16\u5199\u4ee5\u907f\u514d\u7f16\u8bd1), \u5373\u53ef\u5c1d\u8bd5\u8fd0\u884c\u6587\u4ef6, \u5982:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre"},"#### \u83b7\u53d6\u5e2e\u52a9\u4fe1\u606f\n\u276f node index.js -h\n\nmor/1.0.0\n\nUsage:\n  $ mor <command> [options]\n\nCommands:\n  compile [srcPath]  \u7f16\u8bd1\u547d\u4ee4, \u652f\u6301\u6307\u5b9a\u6e90\u7801\u76ee\u5f55\n\nFor more info, run any command with the `--help` flag:\n  $ mor compile --help\n\nOptions:\n  --cwd [cwd]            \u5f53\u524d\u5de5\u4f5c\u76ee\u5f55, \u9ed8\u8ba4\u4e3a process.cwd()\n  -c, --config [path]    \u6307\u5b9a\u81ea\u5b9a\u4e49\u914d\u7f6e\u6587\u4ef6\u8def\u5f84, \u652f\u6301 .js, .ts, .json, .mjs \u7b49\u7c7b\u578b, \u5982 mor.config.js\n  --ignore-config        \u5ffd\u7565\u6216\u4e0d\u81ea\u52a8\u8f7d\u5165\u7528\u6237\u914d\u7f6e\u6587\u4ef6\n  --no-autoload-plugins  \u5173\u95ed\u81ea\u52a8\u8f7d\u5165\u63d2\u4ef6\u529f\u80fd (default: true)\n  -h, --help             Display this message\n  -v, --version          Display version number\n\n\n\n\n#### \u83b7\u53d6\u7f16\u8bd1\u547d\u4ee4\u5e2e\u52a9\u4fe1\u606f\n\u276f node index.js compile -h\n\nmor/1.0.0\n\nUsage:\n  $ mor compile [srcPath]\n\nOptions:\n  --output-path [outputPath]  \u6307\u5b9a\u4ea7\u7269\u76ee\u5f55\n  --production                \u662f\u5426\u5f00\u542f\u751f\u4ea7\u6a21\u5f0f\n  --cwd [cwd]                 \u5f53\u524d\u5de5\u4f5c\u76ee\u5f55, \u9ed8\u8ba4\u4e3a process.cwd()\n  -c, --config [path]         \u6307\u5b9a\u81ea\u5b9a\u4e49\u914d\u7f6e\u6587\u4ef6\u8def\u5f84, \u652f\u6301 .js, .ts, .json, .mjs \u7b49\u7c7b\u578b, \u5982 mor.config.js\n  --ignore-config             \u5ffd\u7565\u6216\u4e0d\u81ea\u52a8\u8f7d\u5165\u7528\u6237\u914d\u7f6e\u6587\u4ef6\n  --no-autoload-plugins       \u5173\u95ed\u81ea\u52a8\u8f7d\u5165\u63d2\u4ef6\u529f\u80fd (default: true)\n  -h, --help                  Display this message\n\n\n\n#### \u6267\u884c\u7f16\u8bd1\u547d\u4ee4\n\u276f node index.js compile ./ --output-path ./dist --production\n{\n  name: 'compile',\n  args: [ './' ],\n  options: {\n    '--': [],\n    autoloadPlugins: true,\n    outputPath: './dist',\n    production: true\n  }\n}\n")),(0,r.kt)("h3",{id:"\u914d\u7f6e-takin-\u529f\u80fd"},"\u914d\u7f6e takin \u529f\u80fd"),(0,r.kt)("h4",{id:"\u5b9a\u5236\u914d\u7f6e\u6587\u4ef6"},"\u5b9a\u5236\u914d\u7f6e\u6587\u4ef6"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"takin")," \u652f\u6301\u5b9a\u4e49\u914d\u7f6e\u6587\u4ef6\u540d\u79f0\u548c\u7c7b\u578b, \u8be6\u7ec6\u5982\u4e0b:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"import { takin } from 'takin'\n\n// \u5b9e\u4f8b, \u9ed8\u8ba4\u60c5\u51b5\u4e0b\u5728\u6307\u5b9a\u4e86\u540d\u79f0\u4e4b\u540e\n// \u5373\u4f1a\u81ea\u52a8\u5f00\u542f\u5bf9 mor.config.{ts/js/mjs/json} \u7b49 4 \u4e2d\u6587\u4ef6\u7c7b\u578b\u7684\u914d\u7f6e\u652f\u6301\nconst mor = takin('mor')\n\n// \u4e5f\u53ef\u4ee5\u81ea\u5b9a\u4e49\u65b0\u7684\u914d\u7f6e\u6587\u4ef6\u540d\u79f0, \u5982:\n// \u589e\u52a0\u652f\u6301 mor.config.* \u548c alsc.mor.config.*\n// \u914d\u7f6e\u540e\u4f1a\u4f18\u5148\u8bfb\u53d6 mor.config.* \u5982\u679c\u672a\u627e\u5230\u5219\u5c1d\u8bd5\u8bfb\u53d6 alsc.mor.config.*\nmor.config.setSupportConfigFileNames(['mor.config', 'alsc.mor.config'])\n\n// \u4e5f\u53ef\u4ee5\u81ea\u5b9a\u4e49\u652f\u6301\u7684\u6587\u4ef6\u7c7b\u578b\n// \u76ee\u524d\u652f\u6301\u8bbe\u7f6e \".js\"\u3001\".json\"\u3001\".ts\"\u3001\".mjs\"\n// \u5982\u8bbe\u7f6e\u4e3a\u4ec5\u652f\u6301 ts \u6216 js\nmor.config.supportConfigExtensions(['.ts', '.js'])\n")),(0,r.kt)("h4",{id:"\u591a\u914d\u7f6e\u80fd\u529b"},"\u591a\u914d\u7f6e\u80fd\u529b"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"takin")," \u652f\u6301\u4e00\u952e\u5f00\u542f\u591a\u914d\u7f6e\u652f\u6301, \u8be6\u7ec6\u5982\u4e0b:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"import { takin } from 'takin'\n\n// \u5b9e\u4f8b\nconst mor = takin('mor')\n\n// \u5f00\u542f\u591a\u914d\u7f6e\u652f\u6301, \u5e76\u901a\u8fc7 `name` \u6765\u533a\u5206\u4e0d\u540c\u914d\u7f6e\n// \u591a\u914d\u7f6e\u652f\u6301\u793a\u4f8b: `[{ name: 'config-one' }, { name: 'config-two' }]`\nmor.config.enableMultipleConfig({ by: 'name' })\n\n// \u5173\u95ed\u591a\u914d\u7f6e\u652f\u6301\nmor.config.disableMultipleConfig()\n\n// \u5f00\u542f package.json \u914d\u7f6e\u652f\u6301\n// \u5373\u5141\u8bb8\u901a\u8fc7 `package.json` \u6587\u4ef6\u4e2d\u7684 MorJS \u5b57\u6bb5\u6765\u83b7\u53d6\u914d\u7f6e\n// \u5982: `{ mor: {} }`\nmor.config.enablePackageJsonConfig()\n\n// \u5173\u95ed package.json \u914d\u7f6e\u652f\u6301\nmor.config.disablePackageJsonConfig()\n")),(0,r.kt)("h2",{id:"\u63a5\u53e3\u53ca\u63d2\u4ef6\u5f00\u53d1"},"\u63a5\u53e3\u53ca\u63d2\u4ef6\u5f00\u53d1"),(0,r.kt)("h3",{id:"\u63d2\u4ef6\u5b9a\u4e49"},"\u63d2\u4ef6\u5b9a\u4e49"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"/**\n * \u63d2\u4ef6\u63a5\u53e3\u5b9a\u4e49\n */\ninterface Plugin {\n  /**\n   * \u63d2\u4ef6\u540d\u79f0\n   */\n  name: string\n  /**\n   * \u63d2\u4ef6\u7248\u672c\n   */\n  version?: string\n  /**\n   * \u63d2\u4ef6\u6267\u884c\u987a\u5e8f:\n   * - `\u8bbe\u7f6e\u4e3a enforce: 'pre'` \u7684\u63d2\u4ef6\n   * - \u901a\u8fc7 takin.config.usePlugins \u4f20\u5165\u7684\u63d2\u4ef6\n   * - \u666e\u901a\u63d2\u4ef6\n   * - \u8bbe\u7f6e\u4e3a `enforce: 'post'` \u7684\u63d2\u4ef6\n   */\n  enforce?: ObjectValues<typeof PluginEnforceTypes>\n  /**\n   * \u63d2\u4ef6\u56de\u8c03\u51fd\u6570: \u5f53\u63d2\u4ef6\u901a\u8fc7 takin \u5b9e\u4f8b\u7684 use \u65b9\u6cd5\u8f7d\u5165\u65f6\u81ea\u52a8\u89e6\u53d1, \u5e76\u4f20\u5165\u5f53\u524d\u547d\u4ee4\u884c\u7684\u5b9e\u4f8b\n   */\n  onUse?: (takin: Takin) => void\n  /**\n   * \u6267\u884c Runner \u63d2\u4ef6\u903b\u8f91, \u901a\u8fc7 Hooks \u6765\u5e72\u9884\u4e0d\u540c\u7684\u9636\u6bb5\n   */\n  apply: (runner: Runner) => void\n}\n")),(0,r.kt)("h3",{id:"hooks-\u652f\u6301"},"Hooks \u652f\u6301"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"takin")," \u4e2d\u63d2\u4ef6\u7684\u6269\u5c55\u80fd\u529b\u4e3b\u8981\u901a\u8fc7\u5bf9 ",(0,r.kt)("inlineCode",{parentName:"p"},"Hooks")," \u7684\u8c03\u7528\u6765\u5b9e\u73b0, \u76ee\u524d\u652f\u6301\u7684 ",(0,r.kt)("inlineCode",{parentName:"p"},"Hooks")," \u5982\u4e0b\uff1a"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"/**\n * \u53ef\u901a\u8fc7 takin.hooks \u6765\u4f7f\u7528\n * \u901a\u8fc7\u63d2\u4ef6\u4e2d onUse \u65b9\u6cd5\u4f20\u5165\n */\ninterface TakinHooks {\n  /**\n   * \u914d\u7f6e\u6587\u4ef6\u8f7d\u5165\u5b8c\u6210, \u53ef\u5728\u8fd9\u4e2a\u9636\u6bb5\u4fee\u6539\u6574\u4f53\u914d\u7f6e\n   * \u5982\u679c\u914d\u7f6e\u901a\u8fc7 run \u65b9\u6cd5\u76f4\u63a5\u4f20\u5165\u5219\u8be5 hook \u4e0d\u4f1a\u6267\u884c\n   */\n  configLoaded: AsyncSeriesHook<[Config, CommandOptions]>\n  /**\n   * \u914d\u7f6e\u5b8c\u6210\u7b5b\u9009, \u53ef\u5728\u8fd9\u4e2a\u9636\u6bb5\u8c03\u6574\u9700\u8981\u8fd0\u884c\u7684\u7528\u6237\u914d\u7f6e\n   */\n  configFiltered: AsyncSeriesWaterfallHook<[UserConfig[], CommandOptions]>\n}\n\n/**\n * \u53ef\u901a\u8fc7 runner.hooks \u6765\u4f7f\u7528\n * \u901a\u8fc7\u63d2\u4ef6\u4e2d\u7684 apply \u65b9\u6cd5\u4f20\u5165\n */\ninterface RunnerHooks {\n  /**\n   * \u521d\u59cb\u5316, \u5f53 runner \u88ab\u521d\u59cb\u5316\u5e76\u5b8c\u6210\u63d2\u4ef6\u52a0\u8f7d\u4e4b\u540e\u8fd0\u884c\n   */\n  initialize: SyncHook<Runner>\n  /**\n   * \u6784\u5efa\u547d\u4ee4\u884c\u65f6\u8fd0\u884c\n   */\n  cli: SyncHook<Cli>\n  /**\n   * \u83b7\u53d6\u5230\u5339\u914d\u547d\u4ee4\u7684\u9636\u6bb5\n   */\n  matchedCommand: AsyncSeriesHook<CommandOptions>\n  /**\n   * \u52a0\u8f7d\u7528\u6237 config \u9636\u6bb5\n   */\n  loadConfig: AsyncSeriesHook<CommandOptions>\n  /**\n   * \u4fee\u6539\u7528\u6237\u914d\u7f6e\n   */\n  modifyUserConfig: AsyncSeriesWaterfallHook<[UserConfig, CommandOptions]>\n  /**\n   * \u6ce8\u518c\u7528\u6237\u914d\u7f6e\u53ca\u6821\u9a8c schema\n   */\n  registerUserConfig: AsyncSeriesWaterfallHook<[AnyZodObject, Zod]>\n  /**\n   * \u662f\u5426\u9700\u8981\u8fd0\u884c\u540e\u7eed\u903b\u8f91\n   * \u6267\u884c\u7684\u65f6\u673a\u4e3a \u6821\u9a8c\u7528\u6237\u914d\u7f6e\u4e4b\u524d\n   */\n  shouldRun: SyncBailHook<Runner, boolean | undefined>\n  /**\n   * \u662f\u5426\u6821\u9a8c\u7528\u6237\u914d\u7f6e, \u90e8\u5206\u4e0d\u4f7f\u7528\u914d\u7f6e\u7684\u547d\u4ee4, \u53ef\u4f7f\u7528\u8be5 hook \u7ed3\u5408 runner \u7684\u4e0a\u4e0b\u6587\n   * \u6765\u9009\u62e9\u662f\u5426\u8df3\u8fc7\u7528\u6237\u914d\u7f6e\u6821\u9a8c\n   */\n  shouldValidateUserConfig: SyncBailHook<Runner, boolean | undefined>\n  /**\n   * \u7528\u6237\u914d\u7f6e\u6821\u9a8c\u5b8c\u6210\u4e4b\u540e\u6267\u884c\n   */\n  userConfigValidated: AsyncSeriesHook<UserConfig>\n  /**\n   * \u5f00\u59cb run \u4e4b\u524d\u7684 hook, \u53ef\u7528\u4e8e\u51c6\u5907\u4e00\u4e9b\u8fd0\u884c\u547d\u4ee4\u9700\u8981\u7684\u6570\u636e\u6216\u5185\u5bb9\n   */\n  beforeRun: AsyncSeriesHook<Runner>\n  /**\n   * \u8fd0\u884c\u547d\u4ee4\u903b\u8f91\n   */\n  run: HookMap<AsyncParallelHook<CommandOptions>>\n  /**\n   * runner \u8fd0\u884c\u5b8c\u6210\n   */\n  done: AsyncParallelHook<Runner>\n  /**\n   * runner \u8fd0\u884c\u5931\u8d25\n   */\n  failed: SyncHook<Error>\n}\n")),(0,r.kt)("h3",{id:"\u5982\u4f55\u6269\u5c55-hooks"},"\u5982\u4f55\u6269\u5c55 Hooks"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"takin")," \u652f\u6301\u901a\u8fc7\u5bf9 ",(0,r.kt)("inlineCode",{parentName:"p"},"TakinHooks")," \u6216 ",(0,r.kt)("inlineCode",{parentName:"p"},"RunnerHooks")," \u7c7b\u578b\u5b9a\u4e49\u8fdb\u884c\u6269\u5c55\u4ee5\u53ca\u8c03\u7528 ",(0,r.kt)("inlineCode",{parentName:"p"},"registerHooks")," \u65b9\u6cd5\u6ce8\u518c\u5de5\u5382\u51fd\u6570\u7684\u65b9\u5f0f\u5bf9 takin \u672c\u8eab\u7684 hooks \u8fdb\u884c\u6269\u5c55\uff0c\u5982:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"import { registerHooks, tapable as t } from 'takin'\n\n/**\n * \u6269\u5c55 takin.RunnerHooks \u4e2d\u7684 hook\n */\ndeclare module 'takin' {\n  interface RunnerHooks {\n    /**\n     * Compile Hook: config(json) \u6587\u4ef6\u89e3\u6790 hook\n     */\n    configParser: t.AsyncSeriesWaterfallHook<\n      [Record<string, any>, FileParserOptions]\n    >\n\n    /**\n     * Compile Hook: script(js/ts) \u6587\u4ef6\u89e3\u6790 hook\n     */\n    scriptParser: t.SyncWaterfallHook<[CustomTransformers, FileParserOptions]>\n\n    /**\n     * Compile Hook: template(*xml) \u6587\u4ef6\u89e3\u6790 hook\n     */\n    templateParser: t.AsyncSeriesWaterfallHook<\n      [PosthtmlNode, FileParserOptions]\n    >\n\n    /**\n     * Compile Hook: style(*css) \u6587\u4ef6\u89e3\u6790 hook\n     */\n    styleParser: t.AsyncSeriesWaterfallHook<\n      [PostCssAcceptedPlugin[], FileParserOptions]\n    >\n\n    /**\n     * Compile Hook: sjs(wxs/sjs) \u6587\u4ef6\u89e3\u6790 hook\n     */\n    sjsParser: t.SyncWaterfallHook<[CustomTransformers, FileParserOptions]>\n\n    /**\n     * Compile Hook: \u6587\u4ef6\u9884\u5904\u7406\u5668 hook\n     */\n    preprocessorParser: t.AsyncSeriesWaterfallHook<\n      [string, Record<string, any>, FileParserOptions]\n    >\n\n    /**\n     * Compile Hook: \u6587\u4ef6\u540e\u7f6e\u5904\u7406\u5668 hook\n     */\n    postprocessorParser: t.AsyncSeriesWaterfallHook<[string, FileParserOptions]>\n  }\n}\n\n/**\n * \u6ce8\u518c\u81ea\u5b9a\u4e49 hook \u5de5\u5382, \u548c\u4e0a\u65b9\u7684 RunnerHooks \u6269\u5c55\u4e00\u4e00\u5bf9\u5e94\n */\nregisterHooks({\n  configParser() {\n    return new t.AsyncSeriesWaterfallHook(['config', 'options'])\n  },\n  scriptParser() {\n    return new t.SyncWaterfallHook(['customTransformers', 'options'])\n  },\n  templateParser() {\n    return new t.AsyncSeriesWaterfallHook(['tree', 'options'])\n  },\n  styleParser() {\n    return new t.AsyncSeriesWaterfallHook(['postcssPlugins', 'options'])\n  },\n  sjsParser() {\n    return new t.SyncWaterfallHook(['customTransformers', 'options'])\n  },\n  preprocessorParser() {\n    return new t.AsyncSeriesWaterfallHook([\n      'fileContent',\n      'conditionalCompileContext',\n      'options'\n    ])\n  },\n  postprocessorParser() {\n    return new t.AsyncSeriesWaterfallHook(['fileContent', 'options'])\n  }\n})\n")),(0,r.kt)("p",null,"\u901a\u8fc7\u4e0a\u8ff0\u65b9\u6cd5\u6ce8\u5165\u7684 ",(0,r.kt)("inlineCode",{parentName:"p"},"Hooks")," \u6269\u5c55\u53ef\u5728\u63d2\u4ef6\u4e2d\u76f4\u63a5\u4f7f\u7528, \u5982:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"import * as takin from 'takin'\n\nclass MyTakinPlugin implements takin.Plugin {\n  name = 'MyTakinPlugin'\n  apply(runner: takin.Runner) {\n    runner.hooks.configParser.tap(...)\n    runner.hooks.scriptParser.tap(...)\n    runner.hooks.templateParser.tap(...)\n    runner.hooks.styleParser.tap(...)\n    runner.hooks.sjsParser.tap(...)\n    runner.hooks.preprocessorParser.tap(...)\n    runner.hooks.postprocessorParser.tap(...)\n  }\n}\n")),(0,r.kt)("h3",{id:"\u63a5\u53e3"},"\u63a5\u53e3"),(0,r.kt)("p",null,"\u53c2\u52a0\u6587\u6863\uff1a ",(0,r.kt)("a",{parentName:"p",href:"/api/engineering-takin"},"Takin API")))}u.isMDXComponent=!0}}]);