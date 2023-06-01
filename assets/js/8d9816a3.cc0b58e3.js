"use strict";(self.webpackChunkmorjs_site=self.webpackChunkmorjs_site||[]).push([[5510],{9613:(e,n,t)=>{t.d(n,{Zo:()=>m,kt:()=>g});var r=t(9496);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function l(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function o(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?l(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):l(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function i(e,n){if(null==e)return{};var t,r,a=function(e,n){if(null==e)return{};var t,r,a={},l=Object.keys(e);for(r=0;r<l.length;r++)t=l[r],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(r=0;r<l.length;r++)t=l[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var p=r.createContext({}),u=function(e){var n=r.useContext(p),t=n;return e&&(t="function"==typeof e?e(n):o(o({},n),e)),t},m=function(e){var n=u(e.components);return r.createElement(p.Provider,{value:n},e.children)},s="mdxType",c={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},k=r.forwardRef((function(e,n){var t=e.components,a=e.mdxType,l=e.originalType,p=e.parentName,m=i(e,["components","mdxType","originalType","parentName"]),s=u(t),k=a,g=s["".concat(p,".").concat(k)]||s[k]||c[k]||l;return t?r.createElement(g,o(o({ref:n},m),{},{components:t})):r.createElement(g,o({ref:n},m))}));function g(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var l=t.length,o=new Array(l);o[0]=k;var i={};for(var p in n)hasOwnProperty.call(n,p)&&(i[p]=n[p]);i.originalType=e,i[s]="string"==typeof e?e:a,o[1]=i;for(var u=2;u<l;u++)o[u]=t[u];return r.createElement.apply(null,o)}return r.createElement.apply(null,t)}k.displayName="MDXCreateElement"},6702:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>p,contentTitle:()=>o,default:()=>c,frontMatter:()=>l,metadata:()=>i,toc:()=>u});var r=t(795),a=(t(9496),t(9613));const l={},o="\u63d2\u4ef6",i={unversionedId:"guides/basic/plugin",id:"guides/basic/plugin",title:"\u63d2\u4ef6",description:"\u63d2\u4ef6\u7c7b\u578b\u4ecb\u7ecd",source:"@site/docs/guides/basic/plugin.md",sourceDirName:"guides/basic",slug:"/guides/basic/plugin",permalink:"/guides/basic/plugin",draft:!1,tags:[],version:"current",frontMatter:{},sidebar:"documentSidebar",previous:{title:"\u8fd0\u884c\u65f6",permalink:"/guides/basic/runtime"},next:{title:"Mock",permalink:"/guides/basic/mock"}},p={},u=[{value:"\u63d2\u4ef6\u7c7b\u578b\u4ecb\u7ecd",id:"\u63d2\u4ef6\u7c7b\u578b\u4ecb\u7ecd",level:2},{value:"\u5982\u4f55\u4f7f\u7528\u63d2\u4ef6\uff1f",id:"\u5982\u4f55\u4f7f\u7528\u63d2\u4ef6",level:2},{value:"\u4f7f\u7528\u5de5\u7a0b\u63d2\u4ef6",id:"\u4f7f\u7528\u5de5\u7a0b\u63d2\u4ef6",level:3},{value:"\u4f7f\u7528\u8fd0\u884c\u65f6\u63d2\u4ef6/\u89e3\u51b3\u653e\u54ea",id:"\u4f7f\u7528\u8fd0\u884c\u65f6\u63d2\u4ef6\u89e3\u51b3\u653e\u54ea",level:3},{value:"\u5982\u4f55\u5f00\u53d1\u63d2\u4ef6\uff1f",id:"\u5982\u4f55\u5f00\u53d1\u63d2\u4ef6",level:2},{value:"\u5f00\u53d1\u5de5\u7a0b\u63d2\u4ef6",id:"\u5f00\u53d1\u5de5\u7a0b\u63d2\u4ef6",level:3},{value:"\u901a\u8fc7\u811a\u624b\u67b6\u7f16\u5199 MorJS \u5de5\u7a0b\u63d2\u4ef6",id:"\u901a\u8fc7\u811a\u624b\u67b6\u7f16\u5199-morjs-\u5de5\u7a0b\u63d2\u4ef6",level:4},{value:"mor.config.* \u7684\u5de5\u7a0b\u63d2\u4ef6\u5f00\u53d1(\u4e0d\u63a8\u8350)",id:"morconfig-\u7684\u5de5\u7a0b\u63d2\u4ef6\u5f00\u53d1\u4e0d\u63a8\u8350",level:4},{value:"\u5f00\u53d1\u8fd0\u884c\u65f6\u63d2\u4ef6",id:"\u5f00\u53d1\u8fd0\u884c\u65f6\u63d2\u4ef6",level:3},{value:"\u901a\u8fc7\u811a\u624b\u67b6\u7f16\u5199 MorJS \u8fd0\u884c\u65f6\u63d2\u4ef6",id:"\u901a\u8fc7\u811a\u624b\u67b6\u7f16\u5199-morjs-\u8fd0\u884c\u65f6\u63d2\u4ef6",level:4},{value:"app.ts \u7684\u8fd0\u884c\u65f6\u63d2\u4ef6\u5f00\u53d1(\u4e0d\u63a8\u8350)",id:"appts-\u7684\u8fd0\u884c\u65f6\u63d2\u4ef6\u5f00\u53d1\u4e0d\u63a8\u8350",level:4},{value:"\u5f00\u53d1\u8fd0\u884c\u65f6 Solution",id:"\u5f00\u53d1\u8fd0\u884c\u65f6-solution",level:3}],m={toc:u},s="wrapper";function c(e){let{components:n,...t}=e;return(0,a.kt)(s,(0,r.Z)({},m,t,{components:n,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"\u63d2\u4ef6"},"\u63d2\u4ef6"),(0,a.kt)("h2",{id:"\u63d2\u4ef6\u7c7b\u578b\u4ecb\u7ecd"},"\u63d2\u4ef6\u7c7b\u578b\u4ecb\u7ecd"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"\u5de5\u7a0b\u63d2\u4ef6\uff1a\u4e00\u822c\u7528\u4e8e\u5b9a\u5236\u547d\u4ee4\u884c\u3001\u4ecb\u5165\u7f16\u8bd1\u9636\u6bb5\u6216\u96c6\u6210\u9636\u6bb5"),(0,a.kt)("li",{parentName:"ul"},"\u8fd0\u884c\u65f6\u63d2\u4ef6\uff1a\u4e00\u822c\u7528\u4e8e\u4ecb\u5165\u5c0f\u7a0b\u5e8f\u8fd0\u884c\u65f6\u7684\u5404\u9636\u6bb5"),(0,a.kt)("li",{parentName:"ul"},"\u8fd0\u884c\u65f6\u89e3\u51b3\u65b9\u6848\uff1a\u7b80\u5355\u6765\u8bf4\u5c31\u662f\u8fd0\u884c\u65f6\u63d2\u4ef6\u96c6")),(0,a.kt)("p",null,"\u4e1a\u52a1\u53ef\u57fa\u4e8e\u81ea\u8eab\u4e1a\u52a1\u8bc9\u6c42\u6765\u5b9a\u5236\u6216\u4f7f\u7528 \u5de5\u7a0b\u63d2\u4ef6 \u6216 \u8fd0\u884c\u65f6\u63d2\u4ef6/\u89e3\u51b3\u65b9\u6848\u3002"),(0,a.kt)("h2",{id:"\u5982\u4f55\u4f7f\u7528\u63d2\u4ef6"},"\u5982\u4f55\u4f7f\u7528\u63d2\u4ef6\uff1f"),(0,a.kt)("h3",{id:"\u4f7f\u7528\u5de5\u7a0b\u63d2\u4ef6"},"\u4f7f\u7528\u5de5\u7a0b\u63d2\u4ef6"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"\u5de5\u7a0b\u63d2\u4ef6\u9700\u8981\u5148\u5b89\u88c5\u4f9d\u8d56 ",(0,a.kt)("inlineCode",{parentName:"li"},"npm install @morjs/your-plugin-name -D")),(0,a.kt)("li",{parentName:"ul"},"\u5728 ",(0,a.kt)("inlineCode",{parentName:"li"},"mor.config.ts")," \u914d\u7f6e\u6587\u4ef6\u4e2d\u8fdb\u884c\u5f15\u5165\uff0c\u5e76\u52a0\u5165\u5230\u914d\u7f6e\u9879 ",(0,a.kt)("inlineCode",{parentName:"li"},"plugins")," \u4e2d\u5373\u53ef")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"import { defineConfig } from '@morjs/cli'\nimport PluginXXX from '@morjs/your-plugin-name'\n\nexport default defineConfig([\n  {\n    // name: 'ali',\n    // sourceType: 'alipay' ,\n    // target: 'alipay',\n    // compileMode: 'bundle',\n    plugins: [new PluginXXX()]\n  }\n])\n")),(0,a.kt)("h3",{id:"\u4f7f\u7528\u8fd0\u884c\u65f6\u63d2\u4ef6\u89e3\u51b3\u653e\u54ea"},"\u4f7f\u7528\u8fd0\u884c\u65f6\u63d2\u4ef6/\u89e3\u51b3\u653e\u54ea"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"\u8fd0\u884c\u65f6\u63d2\u4ef6/\u89e3\u51b3\u65b9\u6848\u9700\u8981\u5728 ",(0,a.kt)("inlineCode",{parentName:"li"},"app.ts")," \u6587\u4ef6\u4e2d\u8fdb\u884c\u5f15\u5165\uff0c\u52a0\u5165\u5230\u5bf9\u5e94\u914d\u7f6e\u9879\u4e2d\u5373\u53ef")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"import { aApp } from '@morjs/core'\nimport RuntimePluginXXX from 'your-runtime-plugin-name'\nimport RuntimeSolutionXXX from 'your-runtime-solution-name'\n\naApp(\n  {\n    onLaunch() {\n      console.log('app onlaunch')\n    }\n  },\n  [\n    RuntimeSolutionXXX(),\n    () => {\n      return {\n        plugins: [new RuntimePluginXXX()]\n      }\n    }\n  ]\n)\n")),(0,a.kt)("h2",{id:"\u5982\u4f55\u5f00\u53d1\u63d2\u4ef6"},"\u5982\u4f55\u5f00\u53d1\u63d2\u4ef6\uff1f"),(0,a.kt)("h3",{id:"\u5f00\u53d1\u5de5\u7a0b\u63d2\u4ef6"},"\u5f00\u53d1\u5de5\u7a0b\u63d2\u4ef6"),(0,a.kt)("p",null,"\u5f00\u53d1\u5de5\u7a0b\u63d2\u4ef6\u6709\u4e24\u79cd\u65b9\u6cd5\uff0c\u63a8\u8350\u4f7f\u7528\u7b2c\u4e00\u79cd\uff1a"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"\u65b9\u6cd5\u4e00\uff1a\u4f7f\u7528\u5b98\u65b9\u63d0\u4f9b\u7684\u811a\u624b\u67b6\u521d\u59cb\u5316\u5de5\u7a0b\u63d2\u4ef6\u9879\u76ee\uff0c\u5728\u9700\u8981\u4f7f\u7528\u7684\u9879\u76ee\u4e2d\u8fdb\u884c\u5f15\u5165\uff1b"),(0,a.kt)("li",{parentName:"ul"},"\u65b9\u6cd5\u4e8c\uff1a\u76f4\u63a5\u5728 ",(0,a.kt)("inlineCode",{parentName:"li"},"MorJS")," \u4e1a\u52a1\u9879\u76ee\u7684 ",(0,a.kt)("inlineCode",{parentName:"li"},"mor.config.ts")," \u914d\u7f6e\u6587\u4ef6\u4e2d\u8fdb\u884c\u7f16\u5199\uff1b")),(0,a.kt)("h4",{id:"\u901a\u8fc7\u811a\u624b\u67b6\u7f16\u5199-morjs-\u5de5\u7a0b\u63d2\u4ef6"},"\u901a\u8fc7\u811a\u624b\u67b6\u7f16\u5199 MorJS \u5de5\u7a0b\u63d2\u4ef6"),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},"\u5168\u5c40\u5b89\u88c5 mor cli \u5de5\u5177")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},"npm i @morjs/cli -g\n")),(0,a.kt)("ol",{start:2},(0,a.kt)("li",{parentName:"ol"},"\u901a\u8fc7 mor cli \u5de5\u5177\u521b\u5efa\u9879\u76ee")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},"mor init\n")),(0,a.kt)("ol",{start:3},(0,a.kt)("li",{parentName:"ol"},"\u9009\u62e9 ",(0,a.kt)("inlineCode",{parentName:"li"},"MorJS \u5de5\u7a0b\u63d2\u4ef6")," \u56de\u8f66")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},"? \u8bf7\u9009\u62e9\u5de5\u7a0b\u7c7b\u578b \u203a - Use arrow-keys. Return to submit.\n    \u5c0f\u7a0b\u5e8f\n    \u5c0f\u7a0b\u5e8f\u63d2\u4ef6\n    \u5c0f\u7a0b\u5e8f\u5206\u5305\n\u276f   MorJS \u5de5\u7a0b\u63d2\u4ef6\n    MorJS \u8fd0\u884c\u65f6\u63d2\u4ef6\n    MorJS \u8fd0\u884c\u65f6\u89e3\u51b3\u65b9\u6848\n    MorJS \u591a\u7aef\u7ec4\u4ef6\u5e93\n    MorJS \u81ea\u5b9a\u4e49\u811a\u624b\u67b6\n")),(0,a.kt)("ol",{start:4},(0,a.kt)("li",{parentName:"ol"},"\u6839\u636e\u63d0\u793a\u5b8c\u6210\u64cd\u4f5c\u540e\uff0c\u5373\u53ef\u5b8c\u6210\u63d2\u4ef6\u9879\u76ee\u521b\u5efa\uff0c\u968f\u540e\u6309\u7167 ",(0,a.kt)("a",{parentName:"li",href:"#%E4%BD%BF%E7%94%A8%E5%B7%A5%E7%A8%8B%E6%8F%92%E4%BB%B6"},"\u5982\u4f55\u4f7f\u7528\u5de5\u7a0b\u63d2\u4ef6")," \u914d\u7f6e\u5230 ",(0,a.kt)("inlineCode",{parentName:"li"},"mor.config.ts")," \u914d\u7f6e\u6587\u4ef6\u4e2d\u8fdb\u884c\u4f7f\u7528\u5373\u53ef")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},"\u2714 \u8bf7\u9009\u62e9\u5de5\u7a0b\u7c7b\u578b \u203a MorJS \u5de5\u7a0b\u63d2\u4ef6\n\u2714 \u8bf7\u8f93\u5165\u9879\u76ee\u540d\u79f0 \u2026 myplugin\n\u2714 \u8bf7\u8f93\u5165\u9879\u76ee\u63cf\u8ff0 \u2026 my first plugin\n\u2714 \u7528\u6237\u540d \u2026 yourUserName\n\u2714 \u90ae\u7bb1 \u2026 your@gmail.com\n\u2714 \u8bf7\u8f93\u5165 Git \u4ed3\u5e93\u5730\u5740 \u2026 https://github.com/yourUserName/myplugin\n\u2714 \u8bf7\u9009\u62e9 npm \u5ba2\u6237\u7aef \u203a npm / pnpm / yarn\n")),(0,a.kt)("h4",{id:"morconfig-\u7684\u5de5\u7a0b\u63d2\u4ef6\u5f00\u53d1\u4e0d\u63a8\u8350"},"mor.config.","*"," \u7684\u5de5\u7a0b\u63d2\u4ef6\u5f00\u53d1(\u4e0d\u63a8\u8350)"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"\u76f4\u63a5\u5728 ",(0,a.kt)("inlineCode",{parentName:"li"},"MorJS")," \u9879\u76ee\u7684 ",(0,a.kt)("inlineCode",{parentName:"li"},"mor.config.ts")," \u914d\u7f6e\u6587\u4ef6\u4e2d\u8fdb\u884c\u7f16\u5199")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"import { defineConfig } from '@morjs/cli'\n\nexport default defineConfig([\n  {\n    // name: 'ali',\n    // sourceType: 'alipay' ,\n    // target: 'alipay',\n    // compileMode: 'bundle',\n    plugins: [\n      {\n        name: 'MorJSPluginXXX',\n        apply(runner) {\n          // modifyUserConfig: \u53ef\u57fa\u4e8e\u547d\u4ee4\u884c\u9009\u9879\u4fee\u6539\u7528\u6237\u914d\u7f6e\n          runner.hooks.modifyUserConfig.tap(\n            this.name,\n            (userConfig, command) => {\n              const { outputPath } = command.options\n              // \u83b7\u53d6\u547d\u4ee4\u884c outputPath \u9009\u9879\uff0c\u82e5\u6709\u5219\u4fee\u6539 userConfig \u7684 outputPath \u914d\u7f6e\u4e3a\u8be5\u503c\n              if (outputPath) userConfig.outputPath = outputPath\n              return userConfig\n            }\n          )\n        }\n      }\n    ]\n  }\n])\n")),(0,a.kt)("h3",{id:"\u5f00\u53d1\u8fd0\u884c\u65f6\u63d2\u4ef6"},"\u5f00\u53d1\u8fd0\u884c\u65f6\u63d2\u4ef6"),(0,a.kt)("p",null,"\u5f00\u53d1\u8fd0\u884c\u65f6\u63d2\u4ef6\u6709\u4e24\u79cd\u65b9\u6cd5\uff0c\u63a8\u8350\u4f7f\u7528\u7b2c\u4e00\u79cd\u65b9\u6848\uff1a"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"\u65b9\u6cd5\u4e00\uff1a\u4f7f\u7528\u5b98\u65b9\u63d0\u4f9b\u7684\u811a\u624b\u67b6\u521d\u59cb\u5316\u8fd0\u884c\u65f6\u63d2\u4ef6\u9879\u76ee\uff0c\u5728\u9700\u8981\u4f7f\u7528\u7684\u9879\u76ee\u4e2d\u8fdb\u884c\u5f15\u5165\uff1b"),(0,a.kt)("li",{parentName:"ul"},"\u65b9\u6cd5\u4e8c\uff1a\u76f4\u63a5\u5728 ",(0,a.kt)("inlineCode",{parentName:"li"},"MorJS")," \u4e1a\u52a1\u9879\u76ee\u7684 ",(0,a.kt)("inlineCode",{parentName:"li"},"app.ts")," \u914d\u7f6e\u6587\u4ef6\u4e2d\u8fdb\u884c\u7f16\u5199\uff1b")),(0,a.kt)("h4",{id:"\u901a\u8fc7\u811a\u624b\u67b6\u7f16\u5199-morjs-\u8fd0\u884c\u65f6\u63d2\u4ef6"},"\u901a\u8fc7\u811a\u624b\u67b6\u7f16\u5199 MorJS \u8fd0\u884c\u65f6\u63d2\u4ef6"),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},"\u5168\u5c40\u5b89\u88c5 mor cli \u5de5\u5177")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},"npm i @morjs/cli -g\n")),(0,a.kt)("ol",{start:2},(0,a.kt)("li",{parentName:"ol"},"\u901a\u8fc7 mor cli \u5de5\u5177\u521b\u5efa\u9879\u76ee")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},"mor init\n")),(0,a.kt)("ol",{start:3},(0,a.kt)("li",{parentName:"ol"},"\u9009\u62e9 ",(0,a.kt)("inlineCode",{parentName:"li"},"MorJS \u8fd0\u884c\u65f6\u63d2\u4ef6")," \u56de\u8f66")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},"? \u8bf7\u9009\u62e9\u5de5\u7a0b\u7c7b\u578b \u203a - Use arrow-keys. Return to submit.\n    \u5c0f\u7a0b\u5e8f\n    \u5c0f\u7a0b\u5e8f\u63d2\u4ef6\n    \u5c0f\u7a0b\u5e8f\u5206\u5305\n    MorJS \u5de5\u7a0b\u63d2\u4ef6\n\u276f   MorJS \u8fd0\u884c\u65f6\u63d2\u4ef6\n    MorJS \u8fd0\u884c\u65f6\u89e3\u51b3\u65b9\u6848\n    MorJS \u591a\u7aef\u7ec4\u4ef6\u5e93\n    MorJS \u81ea\u5b9a\u4e49\u811a\u624b\u67b6\n")),(0,a.kt)("ol",{start:4},(0,a.kt)("li",{parentName:"ol"},"\u6839\u636e\u63d0\u793a\u5b8c\u6210\u64cd\u4f5c\u540e\uff0c\u5373\u53ef\u5b8c\u6210\u63d2\u4ef6\u9879\u76ee\u521b\u5efa\uff0c\u968f\u540e\u6309\u7167 ",(0,a.kt)("a",{parentName:"li",href:"#%E4%BD%BF%E7%94%A8%E8%BF%90%E8%A1%8C%E6%97%B6%E6%8F%92%E4%BB%B6"},"\u5982\u4f55\u4f7f\u7528\u8fd0\u884c\u65f6\u63d2\u4ef6")," \u914d\u7f6e\u5230",(0,a.kt)("inlineCode",{parentName:"li"},"app.ts"),"\u6587\u4ef6\u8fdb\u884c\u4f7f\u7528\u5373\u53ef")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},"\u2714 \u8bf7\u9009\u62e9\u5de5\u7a0b\u7c7b\u578b \u203a MorJS \u8fd0\u884c\u65f6\u63d2\u4ef6\n\u2714 \u8bf7\u8f93\u5165\u9879\u76ee\u540d\u79f0 \u2026 myruntimeplugin\n\u2714 \u8bf7\u8f93\u5165\u9879\u76ee\u63cf\u8ff0 \u2026 my first runtime plugin\n\u2714 \u7528\u6237\u540d \u2026 yourUserName\n\u2714 \u90ae\u7bb1 \u2026 your@gmail.com\n\u2714 \u8bf7\u8f93\u5165 Git \u4ed3\u5e93\u5730\u5740 \u2026 https://github.com/yourUserName/myruntimeplugin\n\u2714 \u8bf7\u9009\u62e9 npm \u5ba2\u6237\u7aef \u203a npm / pnpm / yarn\n")),(0,a.kt)("h4",{id:"appts-\u7684\u8fd0\u884c\u65f6\u63d2\u4ef6\u5f00\u53d1\u4e0d\u63a8\u8350"},"app.ts \u7684\u8fd0\u884c\u65f6\u63d2\u4ef6\u5f00\u53d1(\u4e0d\u63a8\u8350)"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"\u76f4\u63a5\u5728 ",(0,a.kt)("inlineCode",{parentName:"li"},"MorJS")," \u9879\u76ee\u7684 ",(0,a.kt)("inlineCode",{parentName:"li"},"app.ts")," \u6587\u4ef6\u4e2d\u8fdb\u884c\u7f16\u5199")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"import { aApp } from '@morjs/core'\n\naApp(\n  {\n    onLaunch() {\n      console.log('app onlaunch')\n    }\n  },\n  [\n    () => {\n      return {\n        plugins: [\n          {\n            pluginName: 'RuntimePluginXXX',\n            apply(morHooks) {\n              // appOnShow: \u5728 App \u7684 onShow \u751f\u547d\u5468\u671f\u89e6\u53d1\n              morHooks.appOnShow.tap(this.pluginName, function (this, options) {\n                console.log('\u89e6\u53d1\u5c0f\u7a0b\u5e8f appOnShow \u751f\u547d\u5468\u671f')\n              })\n            }\n          }\n        ]\n      }\n    }\n  ]\n)\n")),(0,a.kt)("h3",{id:"\u5f00\u53d1\u8fd0\u884c\u65f6-solution"},"\u5f00\u53d1\u8fd0\u884c\u65f6 Solution"),(0,a.kt)("p",null,"\u5f00\u53d1\u8fd0\u884c\u65f6 Solution \u53ef\u4f7f\u7528\u5b98\u65b9\u63d0\u4f9b\u7684\u811a\u624b\u67b6\u521d\u59cb\u5316\u8fd0\u884c\u65f6 Solution \uff0c\u5728\u9700\u8981\u4f7f\u7528\u7684\u9879\u76ee\u4e2d\u8fdb\u884c\u5f15\u5165"),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},"\u5168\u5c40\u5b89\u88c5 mor cli \u5de5\u5177")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},"npm i @morjs/cli -g\n")),(0,a.kt)("ol",{start:2},(0,a.kt)("li",{parentName:"ol"},"\u901a\u8fc7 mor cli \u5de5\u5177\u521b\u5efa\u9879\u76ee")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},"mor init\n")),(0,a.kt)("ol",{start:3},(0,a.kt)("li",{parentName:"ol"},"\u9009\u62e9 ",(0,a.kt)("inlineCode",{parentName:"li"},"MorJS \u8fd0\u884c\u65f6\u89e3\u51b3\u65b9\u6848")," \u56de\u8f66")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},"? \u8bf7\u9009\u62e9\u5de5\u7a0b\u7c7b\u578b \u203a - Use arrow-keys. Return to submit.\n    \u5c0f\u7a0b\u5e8f\n    \u5c0f\u7a0b\u5e8f\u63d2\u4ef6\n    \u5c0f\u7a0b\u5e8f\u5206\u5305\n    MorJS \u5de5\u7a0b\u63d2\u4ef6\n    MorJS \u8fd0\u884c\u65f6\u63d2\u4ef6\n\u276f   MorJS \u8fd0\u884c\u65f6\u89e3\u51b3\u65b9\u6848\n    MorJS \u591a\u7aef\u7ec4\u4ef6\u5e93\n    MorJS \u81ea\u5b9a\u4e49\u811a\u624b\u67b6\n")),(0,a.kt)("ol",{start:4},(0,a.kt)("li",{parentName:"ol"},"\u6839\u636e\u63d0\u793a\u5b8c\u6210\u64cd\u4f5c\u540e\uff0c\u5373\u53ef\u5b8c\u6210\u63d2\u4ef6\u9879\u76ee\u521b\u5efa\uff0c\u968f\u540e\u6309\u7167 ",(0,a.kt)("a",{parentName:"li",href:"#%E4%BD%BF%E7%94%A8%E8%BF%90%E8%A1%8C%E6%97%B6%E6%8F%92%E4%BB%B6solution"},"\u5982\u4f55\u4f7f\u7528\u8fd0\u884c\u65f6\u63d2\u4ef6/Solution")," \u914d\u7f6e\u5230",(0,a.kt)("inlineCode",{parentName:"li"},"app.ts"),"\u6587\u4ef6\u8fdb\u884c\u4f7f\u7528\u5373\u53ef")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},"\u2714 \u8bf7\u9009\u62e9\u5de5\u7a0b\u7c7b\u578b \u203a MorJS \u8fd0\u884c\u65f6\u89e3\u51b3\u65b9\u6848\n\u2714 \u8bf7\u8f93\u5165\u9879\u76ee\u540d\u79f0 \u2026 mysolution\n\u2714 \u8bf7\u8f93\u5165\u9879\u76ee\u63cf\u8ff0 \u2026 my first solution\n\u2714 \u7528\u6237\u540d \u2026 yourUserName\n\u2714 \u90ae\u7bb1 \u2026 your@gmail.com\n\u2714 \u8bf7\u8f93\u5165 Git \u4ed3\u5e93\u5730\u5740 \u2026 https://github.com/yourUserName/mysolution\n\u2714 \u8bf7\u9009\u62e9 npm \u5ba2\u6237\u7aef \u203a npm / pnpm / yarn\n")))}c.isMDXComponent=!0}}]);