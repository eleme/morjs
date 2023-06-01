"use strict";(self.webpackChunkmorjs_site=self.webpackChunkmorjs_site||[]).push([[9644],{9613:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>k});var a=n(9496);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function p(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var i=a.createContext({}),u=function(e){var t=a.useContext(i),n=t;return e&&(n="function"==typeof e?e(t):p(p({},t),e)),n},m=function(e){var t=u(e.components);return a.createElement(i.Provider,{value:t},e.children)},s="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},d=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,i=e.parentName,m=l(e,["components","mdxType","originalType","parentName"]),s=u(n),d=r,k=s["".concat(i,".").concat(d)]||s[d]||c[d]||o;return n?a.createElement(k,p(p({ref:t},m),{},{components:n})):a.createElement(k,p({ref:t},m))}));function k(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,p=new Array(o);p[0]=d;var l={};for(var i in t)hasOwnProperty.call(t,i)&&(l[i]=t[i]);l.originalType=e,l[s]="string"==typeof e?e:r,p[1]=l;for(var u=2;u<o;u++)p[u]=n[u];return a.createElement.apply(null,p)}return a.createElement.apply(null,n)}d.displayName="MDXCreateElement"},1461:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>i,contentTitle:()=>p,default:()=>c,frontMatter:()=>o,metadata:()=>l,toc:()=>u});var a=n(795),r=(n(9496),n(9613));const o={},p="MorJS \u4f7f\u7528\u793e\u533a\u7ec4\u4ef6\u5e93\u6307\u5357",l={unversionedId:"guides/advance/use-community-component",id:"guides/advance/use-community-component",title:"MorJS \u4f7f\u7528\u793e\u533a\u7ec4\u4ef6\u5e93\u6307\u5357",description:"\u80cc\u666f",source:"@site/docs/guides/advance/use-community-component.md",sourceDirName:"guides/advance",slug:"/guides/advance/use-community-component",permalink:"/guides/advance/use-community-component",draft:!1,tags:[],version:"current",frontMatter:{},sidebar:"blogSidebar",previous:{title:"Slot \u5b9e\u73b0\u539f\u7406",permalink:"/web/blog/slot"},next:{title:"\u4e94\u5206\u949f\u6559\u4f1a\u4f60\u5982\u4f55\u8ba9\u5c0f\u7a0b\u5e8f\u7ec4\u4ef6\u5e93\u652f\u6301\u591a\u7aef",permalink:"/guides/advance/learn-create-component-library"}},i={},u=[{value:"\u80cc\u666f",id:"\u80cc\u666f",level:2},{value:"\u4e00. \u9879\u76ee\u63a5\u5165 MorJS",id:"\u4e00-\u9879\u76ee\u63a5\u5165-morjs",level:2},{value:"\u4e8c. \u9879\u76ee\u63a5\u5165\u793e\u533a\u7ec4\u4ef6\u5e93",id:"\u4e8c-\u9879\u76ee\u63a5\u5165\u793e\u533a\u7ec4\u4ef6\u5e93",level:2},{value:"\u63a5\u5165 Vant Weapp \u6d41\u7a0b",id:"\u63a5\u5165-vant-weapp-\u6d41\u7a0b",level:3},{value:"\u63a5\u5165 TDesign \u6d41\u7a0b",id:"\u63a5\u5165-tdesign-\u6d41\u7a0b",level:3},{value:"\u63a5\u5165 Wux Weapp \u6d41\u7a0b",id:"\u63a5\u5165-wux-weapp-\u6d41\u7a0b",level:3},{value:"\u4e09. \u6dfb\u52a0\u7ec4\u4ef6\u5e93\u8f6c\u7aef\u914d\u7f6e",id:"\u4e09-\u6dfb\u52a0\u7ec4\u4ef6\u5e93\u8f6c\u7aef\u914d\u7f6e",level:2},{value:"\u56db. \u7f16\u8bd1\u8c03\u8bd5",id:"\u56db-\u7f16\u8bd1\u8c03\u8bd5",level:2},{value:"Q&amp;A",id:"qa",level:2}],m={toc:u},s="wrapper";function c(e){let{components:t,...n}=e;return(0,r.kt)(s,(0,a.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"morjs-\u4f7f\u7528\u793e\u533a\u7ec4\u4ef6\u5e93\u6307\u5357"},"MorJS \u4f7f\u7528\u793e\u533a\u7ec4\u4ef6\u5e93\u6307\u5357"),(0,r.kt)("h2",{id:"\u80cc\u666f"},"\u80cc\u666f"),(0,r.kt)("p",null,"\u8ddd\u79bb MorJS \u5f00\u6e90\u5df2\u7ecf\u6709\u4e00\u6bb5\u65f6\u95f4\u4e86\uff0c\u968f\u7740\u4f7f\u7528\u4eba\u6570\u7684\u4e0a\u5347\uff0c\u8f83\u591a\u5f00\u53d1\u8005\u5c06\u73b0\u6709\u5c0f\u7a0b\u5e8f\u9879\u76ee\u63a5\u5165 MorJS \u6846\u67b6\u90fd\u4f1a\u63d0\u51fa\u4e00\u4e2a\u7591\u95ee\uff0c\u9879\u76ee\u4e2d\u9664\u4e86\u5f00\u53d1\u540c\u5b66\u5199\u7684\u539f\u751f\u4e1a\u52a1\u4ee3\u7801\u5916\uff0c\u5f88\u591a\u9879\u76ee\u8fd8\u7528\u5230\u4e86\u7b2c\u4e09\u65b9\u7684\u7ec4\u4ef6\u5e93\uff0c\u8fd9\u4e9b\u793e\u533a\u7ec4\u4ef6\u5e93\u80fd\u591f\u88ab\u4e00\u540c\u8f6c\u6210\u5176\u4ed6\u5c0f\u7a0b\u5e8f\u7aef\u4e48\uff1f"),(0,r.kt)("p",null,"\u7b54\u6848\u662f\uff1a\u53ef\u4ee5\uff0c\u53ea\u8981\u662f\uff08\u5fae\u4fe1/\u652f\u4ed8\u5b9d\uff09\u5c0f\u7a0b\u5e8f\u539f\u751f\u5f00\u53d1\u7684\u7ec4\u4ef6\uff0c\u7406\u8bba\u4e0a\u662f\u53ef\u4ee5\u4e00\u5e76\u8f6c\u6362\u7684\uff0c\u4f7f\u7528\u65b9\u5f0f\u4e0a\uff0c\u9700\u6309\u7167\u5bf9\u5e94\u5e73\u53f0 npm \u7ec4\u4ef6\u7684\u89c4\u8303 \u6765\u4f7f\u7528\uff0c\u672c\u6b21\u6211\u4eec\u5c06\u5206\u522b\u5bf9\u4f7f\u7528\u5230\u793e\u7fa4\u4e2d\u63d0\u53ca\u9891\u7387\u8f83\u9ad8\u7684 ",(0,r.kt)("a",{parentName:"p",href:"https://github.com/youzan/vant-weapp"},"Vant Weapp"),"\u3001",(0,r.kt)("a",{parentName:"p",href:"https://github.com/Tencent/tdesign-miniprogram"},"TDesign"),"\u3001",(0,r.kt)("a",{parentName:"p",href:"https://github.com/wux-weapp/wux-weapp/"},"Wux Weapp")," \u7684\u9879\u76ee\u8fdb\u884c\u8f6c\u7aef\uff08\u5982\u679c\u4f60\u7684\u9879\u76ee\u9009\u7528\u7684\u662f\u5176\u4ed6\u7ec4\u4ef6\u5e93\uff0c\u4e5f\u53ef\u4ee5\u53c2\u8003\u4ee5\u4e0b\u6d41\u7a0b\uff09"),(0,r.kt)("h2",{id:"\u4e00-\u9879\u76ee\u63a5\u5165-morjs"},"\u4e00. \u9879\u76ee\u63a5\u5165 MorJS"),(0,r.kt)("p",null,"\u4f7f\u7528 MorJS \u63d0\u4f9b\u7684\u4e00\u7801\u591a\u7aef\u80fd\u529b\uff0c\u81ea\u7136\u9700\u8981\u7528\u5230 MorJS \u672c\u8eab\uff0c\u6211\u4eec\u9488\u5bf9\u4e0d\u540c\u4e1a\u52a1\u573a\u666f\uff0c\u63d0\u4f9b\u4e86\u4e24\u79cd\u63a5\u5165\u65b9\u5f0f\uff1a"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"\u65b0\u9879\u76ee\u4f7f\u7528 create-mor \u521b\u5efa\u9879\u76ee\uff0c\u6587\u6863\u53c2\u8003\uff1a",(0,r.kt)("a",{parentName:"li",href:"https://mor.eleme.io/guides/introduction/getting-started"},"\u300aMorJS - \u5feb\u901f\u4e0a\u624b\u300b")),(0,r.kt)("li",{parentName:"ul"},"\u5df2\u6709\u9879\u76ee\u6dfb\u52a0\u5fc5\u8981\u4f9d\u8d56\u8fdb\u884c\u63a5\u5165\uff0c\u6587\u6863\u53c2\u8003\uff1a",(0,r.kt)("a",{parentName:"li",href:"https://mor.eleme.io/guides/migrate-from-original-miniprogram-to-mor"},"\u300aMorJS - \u539f\u751f\u5c0f\u7a0b\u5e8f\u63a5\u5165\u300b"))),(0,r.kt)("p",null,"\u5b8c\u6210\u4ee5\u4e0a\u63a5\u5165\u540e\uff0c\u53ef\u5728\u9879\u76ee\u76ee\u5f55\u7ec8\u7aef\u4e0b\u6267\u884c\u7f16\u8bd1\u547d\u4ee4\u542f\u52a8\u9879\u76ee npm run dev\uff0c\u591a\u7aef\u4ea7\u7269\u5df2\u6784\u5efa\u5728 dist \u76ee\u5f55\u4e0b\uff0c\u5206\u522b\u7528\u5bf9\u5e94\u5e73\u53f0\u7684 IDE \u6253\u5f00\u5373\u53ef\u5f00\u53d1\u9884\u89c8\u3002"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre"},".\n\u251c\u2500\u2500 dist          // \u4ea7\u7269\u76ee\u5f55\uff0c\u53ef\u5728 mor.config.* \u4e2d\u901a\u8fc7 outputPath \u914d\u7f6e\u8fdb\u884c\u4fee\u6539\n\u2502   \u251c\u2500\u2500 alipay    // \u652f\u4ed8\u5b9d\u7aef\u4ea7\u7269\uff0c\u53ef\u5728\u7528\u652f\u4ed8\u5b9d IDE \u8fdb\u884c\u9884\u89c8\u8c03\u8bd5\n\u2502   \u251c\u2500\u2500 wechat    // \u5fae\u4fe1\u7aef\u4ea7\u7269\uff0c\u53ef\u5728\u7528\u5fae\u4fe1 IDE \u8fdb\u884c\u9884\u89c8\u8c03\u8bd5\n\u2502   \u2514\u2500\u2500 web       // \u8f6c web \u4ea7\u7269\uff0c\u53ef\u5728\u6d4f\u89c8\u5668\u4e2d\u8fdb\u884c\u9884\u89c8\u8c03\u8bd5\n\u251c\u2500\u2500 node_modules  // \u5b89\u88c5 node \u540e\u7528\u6765\u5b58\u653e\u7528\u5305\u7ba1\u7406\u5de5\u5177\u4e0b\u8f7d\u5b89\u88c5\u7684\u5305\u7684\u6587\u4ef6\u5939\n\u251c\u2500\u2500 src           // \u6e90\u7801\u76ee\u5f55\uff0c\u53ef\u5728 mor.config.* \u4e2d\u901a\u8fc7 srcPath \u914d\u7f6e\u8fdb\u884c\u4fee\u6539\n\u251c\u2500\u2500 mor.config.ts // MorJS \u914d\u7f6e\u6587\u4ef6\uff0c\u7528\u4e8e\u63d0\u4f9b\u591a\u5957\u7f16\u8bd1\u914d\u7f6e\n\u2514\u2500\u2500 package.json  // \u9879\u76ee\u7684\u57fa\u7840\u914d\u7f6e\u6587\u4ef6\n")),(0,r.kt)("h2",{id:"\u4e8c-\u9879\u76ee\u63a5\u5165\u793e\u533a\u7ec4\u4ef6\u5e93"},"\u4e8c. \u9879\u76ee\u63a5\u5165\u793e\u533a\u7ec4\u4ef6\u5e93"),(0,r.kt)("p",null,"\u6839\u636e\u5bf9\u5e94\u7684\u793e\u533a\u7ec4\u4ef6\u5e93\u6587\u6863\u8fdb\u884c\u63a5\u5165\uff0c\u5982\u679c\u4f60\u7684\u9879\u76ee\u9009\u7528\u7684\u662f\u5176\u4ed6\u7ec4\u4ef6\u5e93\uff0c\u4e5f\u53ef\u4ee5\u53c2\u8003\u4ee5\u4e0b\u6d41\u7a0b\u8fdb\u884c\u63a5\u5165\u3002"),(0,r.kt)("p",null,"\u8bf7\u6ce8\u610f\uff0c\u9879\u76ee\u6240\u4f7f\u7528\u7684\u7ec4\u4ef6\u5e93\u548c\u9879\u76ee\u7684\u5c0f\u7a0b\u5e8f DSL \u9700\u8981\u4e3a\u540c\u4e00\u5957\u6e90\u7801\uff0c\u4f8b\u5982\u9009\u62e9\u4f7f\u7528\u5fae\u4fe1 DSL \u5199\u7684\u9879\u76ee\uff0c\u5f15\u5165\u7684\u7ec4\u4ef6\u5e93\u9700\u8981\u662f for \u5fae\u4fe1\u5c0f\u7a0b\u5e8f\u7684\u7ec4\u4ef6\u5e93\uff0c\u652f\u4ed8\u5b9d DSL \u4ea6\u7136\u3002"),(0,r.kt)("h3",{id:"\u63a5\u5165-vant-weapp-\u6d41\u7a0b"},"\u63a5\u5165 ",(0,r.kt)("a",{parentName:"h3",href:"https://github.com/youzan/vant-weapp"},"Vant Weapp")," \u6d41\u7a0b"),(0,r.kt)("ol",null,(0,r.kt)("li",{parentName:"ol"},"\u5b89\u88c5\uff1a\u901a\u8fc7 npm \u5b89\u88c5\u7ec4\u4ef6\u5e93 ",(0,r.kt)("inlineCode",{parentName:"li"},"npm i @vant/weapp -S --production")),(0,r.kt)("li",{parentName:"ol"},"\u914d\u7f6e\uff1aMorJS \u5de5\u7a0b\u9ed8\u8ba4\u914d\u7f6e\u4e0b\uff0c\u53ef\u76f4\u63a5\u8df3\u8fc7\u8fd9\u6b65")),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"app.json \u914d\u7f6e\uff1a\u5c0f\u7a0b\u5e8f\u65b0\u7248\u7ec4\u4ef6\u5e93\u4e0e ",(0,r.kt)("a",{parentName:"li",href:"https://github.com/youzan/vant-weapp"},"Vant Weapp")," \u53ef\u80fd\u5b58\u5728\u4e00\u5b9a\u6837\u5f0f\u51b2\u7a81\u95ee\u9898\uff0c\u8bf7\u6839\u636e\u4e1a\u52a1\u9700\u6c42\u53ca\u9879\u76ee\u8868\u73b0\uff0c\u81ea\u884c\u51b3\u5b9a\u662f\u5426\u9700\u8981\u53bb\u9664\u65b0\u7248\u57fa\u7840\u7ec4\u4ef6\u6837\u5f0f\uff0c\u5982\u9700\u53bb\u9664\u5220\u9664 app.json \u6587\u4ef6\u7684 ",(0,r.kt)("inlineCode",{parentName:"li"},'"style": "v2"')," \u914d\u7f6e\u9879\u5373\u53ef"),(0,r.kt)("li",{parentName:"ul"},"project.config.json \u914d\u7f6e\uff1aMorJS \u9ed8\u8ba4\u7684 bundle \u6a21\u5f0f\u65e0\u9700\u4fee\u6539\u6b64\u9879\u914d\u7f6e"),(0,r.kt)("li",{parentName:"ul"},"\u6784\u5efa npm \u5305\uff1aMorJS \u9ed8\u8ba4\u7684 bundle \u6a21\u5f0f\u65e0\u9700\u6784\u5efa\u6b64\u9879"),(0,r.kt)("li",{parentName:"ul"},"typescript \u652f\u6301\uff1aMorJS \u672c\u8eab\u652f\u6301 typescript\uff0c\u65e0\u9700\u914d\u7f6e\u6b64\u9879")),(0,r.kt)("ol",{start:3},(0,r.kt)("li",{parentName:"ol"},"\u4f7f\u7528\uff1a\u5728\u5bf9\u5e94\u7684 json \u6587\u4ef6\u4e2d\u914d\u7f6e\u6240\u7528\u7ec4\u4ef6\u5bf9\u5e94\u7684\u8def\u5f84\uff0c\u5728 xml \u4e2d\u76f4\u63a5\u4f7f\u7528\u7ec4\u4ef6\u5373\u53ef")),(0,r.kt)("blockquote",null,(0,r.kt)("p",{parentName:"blockquote"},"\u914d\u7f6e\u7ec4\u4ef6\u8def\u5f84\u6709\u4e24\u79cd\u65b9\u5f0f\uff1a\u53ef\u4ee5\u6309\u7167 \u7ec4\u4ef6\u5e93\u89c4\u8303 \u6765\u5f15\u7528\u7ec4\u4ef6\uff0c\u6216\u6309\u7167\u5b9e\u9645\u8def\u5f84\u5f15\u7528\u7ec4\u4ef6")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "usingComponents": {\n    "van-button": "@vant/weapp/button/index", // \u6309\u7167\u89c4\u8303\u5f15\u7528 button \u7ec4\u4ef6\n    "van-popup": "@vant/weapp/lib/popup/index" // \u6309\u7167\u5b9e\u9645\u8def\u5f84\u5f15\u7528 popup \u7ec4\u4ef6\n  }\n}\n')),(0,r.kt)("h3",{id:"\u63a5\u5165-tdesign-\u6d41\u7a0b"},"\u63a5\u5165 ",(0,r.kt)("a",{parentName:"h3",href:"https://github.com/Tencent/tdesign-miniprogram"},"TDesign")," \u6d41\u7a0b"),(0,r.kt)("ol",null,(0,r.kt)("li",{parentName:"ol"},"\u5b89\u88c5\uff1a\u901a\u8fc7 npm \u5b89\u88c5\u7ec4\u4ef6\u5e93 ",(0,r.kt)("inlineCode",{parentName:"li"},"npm i tdesign-miniprogram -S --production")),(0,r.kt)("li",{parentName:"ol"},"\u914d\u7f6e\uff1aMorJS \u5de5\u7a0b\u9ed8\u8ba4\u914d\u7f6e\u4e0b\uff0c\u53ef\u76f4\u63a5\u8df3\u8fc7\u8fd9\u6b65")),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"app.json \u914d\u7f6e\uff1a\u5c0f\u7a0b\u5e8f\u65b0\u7248\u7ec4\u4ef6\u5e93\u4e0e ",(0,r.kt)("a",{parentName:"li",href:"https://github.com/Tencent/tdesign-miniprogram"},"TDesign")," \u53ef\u80fd\u5b58\u5728\u4e00\u5b9a\u6837\u5f0f\u51b2\u7a81\u95ee\u9898\uff0c\u8bf7\u6839\u636e\u4e1a\u52a1\u9700\u6c42\u53ca\u9879\u76ee\u8868\u73b0\uff0c\u81ea\u884c\u51b3\u5b9a\u662f\u5426\u9700\u8981\u53bb\u9664\u65b0\u7248\u57fa\u7840\u7ec4\u4ef6\u6837\u5f0f\uff0c\u5982\u9700\u53bb\u9664\u5220\u9664 app.json \u6587\u4ef6\u7684 ",(0,r.kt)("inlineCode",{parentName:"li"},'"style": "v2"')," \u914d\u7f6e\u9879\u5373\u53ef"),(0,r.kt)("li",{parentName:"ul"},"\u6784\u5efa npm \u5305\uff1aMorJS \u9ed8\u8ba4\u7684 bundle \u6a21\u5f0f\u65e0\u9700\u6784\u5efa\u6b64\u9879"),(0,r.kt)("li",{parentName:"ul"},"typescript \u652f\u6301\uff1aMorJS \u672c\u8eab\u652f\u6301 typescript\uff0c\u65e0\u9700\u914d\u7f6e\u6b64\u9879")),(0,r.kt)("ol",{start:3},(0,r.kt)("li",{parentName:"ol"},"\u4f7f\u7528\uff1a\u5728\u5bf9\u5e94\u7684 json \u6587\u4ef6\u4e2d\u914d\u7f6e\u6240\u7528\u7ec4\u4ef6\u5bf9\u5e94\u7684\u8def\u5f84\uff0c\u5728 xml \u4e2d\u76f4\u63a5\u4f7f\u7528\u7ec4\u4ef6\u5373\u53ef")),(0,r.kt)("blockquote",null,(0,r.kt)("p",{parentName:"blockquote"},"\u914d\u7f6e\u7ec4\u4ef6\u8def\u5f84\u6709\u4e24\u79cd\u65b9\u5f0f\uff1a\u53ef\u4ee5\u6309\u7167 \u7ec4\u4ef6\u5e93\u89c4\u8303 \u6765\u5f15\u7528\u7ec4\u4ef6\uff0c\u6216\u6309\u7167\u5b9e\u9645\u8def\u5f84\u5f15\u7528\u7ec4\u4ef6")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "usingComponents": {\n    "van-button": "tdesign-miniprogram/button/button", // \u6309\u7167\u89c4\u8303\u5f15\u7528 button \u7ec4\u4ef6\n    "van-popup": "tdesign-miniprogram/miniprogram_dist/popup/popup" // \u6309\u7167\u5b9e\u9645\u8def\u5f84\u5f15\u7528 popup \u7ec4\u4ef6\n  }\n}\n')),(0,r.kt)("h3",{id:"\u63a5\u5165-wux-weapp-\u6d41\u7a0b"},"\u63a5\u5165 ",(0,r.kt)("a",{parentName:"h3",href:"https://github.com/wux-weapp/wux-weapp/"},"Wux Weapp")," \u6d41\u7a0b"),(0,r.kt)("ol",null,(0,r.kt)("li",{parentName:"ol"},"\u5b89\u88c5\uff1a\u901a\u8fc7 npm \u5b89\u88c5\u7ec4\u4ef6\u5e93 ",(0,r.kt)("inlineCode",{parentName:"li"},"npm i wux-weapp -S --production")),(0,r.kt)("li",{parentName:"ol"},"\u914d\u7f6e\uff1aMorJS \u5de5\u7a0b\u9ed8\u8ba4\u914d\u7f6e\u4e0b\uff0c\u65e0\u9700\u8fdb\u884c npm \u6784\u5efa\u6216\u5355\u72ec\u62f7\u8d1d\u7ec4\u4ef6\u4ea7\u7269"),(0,r.kt)("li",{parentName:"ol"},"\u4f7f\u7528\uff1a\u5728\u5bf9\u5e94\u7684 json \u6587\u4ef6\u4e2d\u914d\u7f6e\u6240\u7528\u7ec4\u4ef6\u5bf9\u5e94\u7684\u8def\u5f84\uff0c\u5728 xml \u4e2d\u76f4\u63a5\u4f7f\u7528\u7ec4\u4ef6\u5373\u53ef")),(0,r.kt)("blockquote",null,(0,r.kt)("p",{parentName:"blockquote"},"\u914d\u7f6e\u7ec4\u4ef6\u8def\u5f84\u6709\u4e24\u79cd\u65b9\u5f0f\uff1a\u53ef\u4ee5\u6309\u7167 \u7ec4\u4ef6\u5e93\u89c4\u8303 \u6765\u5f15\u7528\u7ec4\u4ef6\uff0c\u6216\u6309\u7167\u5b9e\u9645\u8def\u5f84\u5f15\u7528\u7ec4\u4ef6")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "usingComponents": {\n    "van-button": "wux-weapp/button/index", // \u6309\u7167\u89c4\u8303\u5f15\u7528 button \u7ec4\u4ef6\n    "van-popup": "wux-weapp/packages/lib/popup/index" // \u6309\u7167\u5b9e\u9645\u8def\u5f84\u5f15\u7528 popup \u7ec4\u4ef6\n  }\n}\n')),(0,r.kt)("h2",{id:"\u4e09-\u6dfb\u52a0\u7ec4\u4ef6\u5e93\u8f6c\u7aef\u914d\u7f6e"},"\u4e09. \u6dfb\u52a0\u7ec4\u4ef6\u5e93\u8f6c\u7aef\u914d\u7f6e"),(0,r.kt)("p",null,"\u63a5\u5165\u793e\u533a\u7ec4\u4ef6\u5e93\u540e\uff0c\u6267\u884c\u7f16\u8bd1\u547d\u4ee4 npm run dev \u542f\u52a8\u9879\u76ee\u4f1a\u53d1\u73b0\uff0c\u4ec5\u672c\u7aef\u7684\u7f16\u8bd1\u662f\u6b63\u5e38\u6267\u884c\u7684\uff0c\u8f6c\u4e3a\u5176\u4ed6\u7aef\u7684\u7f16\u8bd1\u4f1a\u62a5\u7c7b\u4f3c Can't resolve 'xxx' in 'xxx' \u7684\u9519\u8bef\uff0c\u8fd9\u662f\u56e0\u4e3a MorJS \u9ed8\u8ba4\u662f\u4e0d\u4f1a\u5728\u7f16\u8bd1\u73af\u8282\u52a8\u6001\u7f16\u8bd1\u5904\u7406 node_modules \u7684 NPM \u7ec4\u4ef6\u7684\uff0c\u6240\u4ee5\u5bfc\u81f4\u5f15\u5165\u4f7f\u7528\u7684\u7ec4\u4ef6\u65e0\u6cd5\u8f7d\u5165\uff0c\u9700\u8981\u901a\u8fc7\u6dfb\u52a0 mor.config.ts \u4e2d\u7684 processNodeModules \u914d\u7f6e\uff0c\u8ba9\u7f16\u8bd1\u73af\u8282\u5904\u7406 node_modules \u4e2d\u7684\u7ec4\u4ef6"),(0,r.kt)("p",null,"\u76f8\u5173\u6587\u6863\u53ef\u53c2\u8003\uff1a",(0,r.kt)("a",{parentName:"p",href:"https://mor.eleme.io/guides/basic/config/#processnodemodules---%E6%98%AF%E5%90%A6%E5%A4%84%E7%90%86-node_modules"},"\u300aMorJS \u57fa\u7840\u7528\u6cd5 - \u914d\u7f6e processNodeModules\u300b")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-typescript"},"import { defineConfig } from '@morjs/cli'\n\nexport default defineConfig([\n  {\n    name: 'ali',\n    sourceType: 'wechat', // \u6e90\u7801\u7c7b\u578b: \u5fae\u4fe1 DSL\n    target: 'alipay', // \u7f16\u8bd1\u76ee\u6807: \u652f\u4ed8\u5b9d\u5c0f\u7a0b\u5e8f\n    processNodeModules: {\n      include: [\n        /@vant\\/weapp/, // \u6dfb\u52a0\u5904\u7406 @vant/weapp \u7ec4\u4ef6\n        /tdesign\\-miniprogram/, // \u6dfb\u52a0\u5904\u7406 tdesign-miniprogram \u7ec4\u4ef6\n        /wux\\-weapp/ // \u6dfb\u52a0\u5904\u7406\u7b26\u5408 wux-weapp \u7ec4\u4ef6\n      ]\n    }\n  }\n])\n")),(0,r.kt)("blockquote",null,(0,r.kt)("p",{parentName:"blockquote"},"\u4e4b\u6240\u4ee5 MorJS \u7f16\u8bd1\u9ed8\u8ba4\u4e0d\u5904\u7406 node_modules \u7684 NPM \u7ec4\u4ef6\uff0c\u539f\u56e0\u5927\u81f4\u6709\u4ee5\u4e0b\u51e0\u70b9\uff1a")),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"\u52a8\u6001\u7f16\u8bd1\u6027\u80fd\u5dee\uff1anode_modules \u91cc\u9762\u6587\u4ef6\u7e41\u591a\uff0c\u9700\u8981\u6240\u6709\u6587\u4ef6\u90fd\u53bb\u5224\u65ad\u662f\u5426\u9700\u8981\u8fdb\u884c\u7f16\u8bd1\u5904\u7406\uff0c\u6548\u7387\u8f83\u4f4e\uff0c\u4f1a\u4e00\u5b9a\u7a0b\u5ea6\u4e0a\u5f71\u54cd\u7f16\u8bd1\u6548\u7387\uff1b"),(0,r.kt)("li",{parentName:"ul"},"\u6392\u67e5\u95ee\u9898\u56f0\u96be\uff1a\u52a8\u6001\u8f6c\u6362\u4f1a\u53d8\u6210\u9ed1\u7bb1\uff0c\u4f7f\u7528\u65b9\u65e0\u6cd5\u76f4\u63a5\u611f\u77e5\u5230\u8f6c\u6362\u8fc7\u7a0b\u4e2d\u6240\u505a\u7684\u5904\u7406\uff1b"),(0,r.kt)("li",{parentName:"ul"},"\u65e0\u6cd5\u76f4\u63a5\u7ed9\u539f\u751f\u5c0f\u7a0b\u5e8f\u590d\u7528\uff1a\u7ec4\u4ef6\u5728\u6ee1\u8db3\u4e00\u5b9a\u6761\u4ef6\u4e0b\uff0c\u662f\u53ef\u4ee5\u540c\u65f6\u7ed9\u975e MorJS \u7684\u5c0f\u7a0b\u5e8f\u5de5\u7a0b\u4f7f\u7528\u7684\uff0c\u5982\u679c\u91c7\u7528\u52a8\u6001\u7f16\u8bd1\u5c31\u80fd\u4e14\u53ea\u80fd\u7ed9 MorJS \u5de5\u7a0b\u4f7f\u7528\uff1b"),(0,r.kt)("li",{parentName:"ul"},"\u964d\u4f4e\u4e86\u7ec4\u4ef6\u63d0\u4f9b\u65b9\u7684\u81ea\u6d4b\u8d23\u4efb\uff1a\u5728 NPM \u7ec4\u4ef6 \u8f93\u51fa\u65f6\u76f4\u63a5\u63d0\u4f9b\u4e86\u7f16\u8bd1\u540e\u4ea7\u7269\uff0c\u80fd\u591f\u8981\u6c42 NPM \u7ec4\u4ef6 \u505a\u597d\u5bf9\u5e94\u6d4b\u8bd5\uff0c\u800c\u4e0d\u662f\u4f9d\u8d56\u4e8e MorJS \u52a8\u6001\u7f16\u8bd1\u6765\u786e\u4fdd\u53ef\u7528\u6027\uff1b"),(0,r.kt)("li",{parentName:"ul"},"\u2026")),(0,r.kt)("h2",{id:"\u56db-\u7f16\u8bd1\u8c03\u8bd5"},"\u56db. \u7f16\u8bd1\u8c03\u8bd5"),(0,r.kt)("p",null,"\u5728\u9879\u76ee\u76ee\u5f55\u7ec8\u7aef\u4e0b\u6267\u884c\u7f16\u8bd1\u547d\u4ee4\u542f\u52a8\u9879\u76ee\uff0c\u5373\u53ef\u6784\u5efa\u751f\u6210\u5bf9\u5e94\u7684\u591a\u7aef\u4ea7\u7269\uff0c\u9ed8\u8ba4\u662f\u653e\u5728\u9879\u76ee dist \u76ee\u5f55\u4e0b\uff0c\u5206\u522b\u7528\u5bf9\u5e94\u5e73\u53f0\u7684 IDE \u6253\u5f00\u5373\u53ef\u5f00\u53d1\u9884\u89c8\u3002"),(0,r.kt)("p",null,"\u4f60\u4e5f\u53ef\u4ee5\u9488\u5bf9\u4e0d\u540c\u7aef\uff0c\u5728 package.json \u4e2d\u6dfb\u52a0\u5355\u7aef\u7684\u7f16\u8bd1\u547d\u4ee4\u548c\u76f8\u5173\u914d\u7f6e\uff0c\u5728\u7ec8\u7aef\u6267\u884c\u5bf9\u5e94\u7684\u7f16\u8bd1\u547d\u4ee4\u751f\u6210\u5355\u7aef\u7684\u7f16\u8bd1\u4ea7\u7269\u8fdb\u884c\u5f00\u53d1\u8c03\u8bd5\u3002"),(0,r.kt)("p",null,"\u76f8\u5173\u6587\u6863\u53ef\u53c2\u8003\uff1a",(0,r.kt)("a",{parentName:"p",href:"https://mor.eleme.io/guides/basic/cli"},"\u300aMorJS \u57fa\u7840\u7528\u6cd5 - \u547d\u4ee4\u884c\u300b")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "scripts": {\n    "dev": "mor compile -w", // \u7f16\u8bd1\u6784\u5efa\u6240\u6709\u7aef\u5e76\u5f00\u542f\u6587\u4ef6\u53d8\u66f4\u76d1\u542c\n    "dev:ali": "mor compile --name ali", // \u7f16\u8bd1\u6784\u5efa\u914d\u7f6e\u540d\u4e3a ali \u7684\u4ea7\u7269\n    "dev:wx": "mor compile --name wx", // \u7f16\u8bd1\u6784\u5efa\u914d\u7f6e\u540d\u4e3a wx \u7684\u4ea7\u7269\n    "dev:dy": "mor compile --name dy", // \u7f16\u8bd1\u6784\u5efa\u914d\u7f6e\u540d\u4e3a dy \u7684\u4ea7\u7269\n    "build": "mor compile --production" // \u5f00\u542f\u751f\u4ea7\u73af\u5883\u6784\u5efa\u6240\u6709\u7aef\n  }\n}\n')),(0,r.kt)("h2",{id:"qa"},"Q&A"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},"Q: \u4e3a\u4ec0\u4e48 MorJS \u63a5\u5165\u7ec4\u4ef6\u5e93\u4e0d\u9700\u8981\u6267\u884c IDE \u6784\u5efa npm \u5305\uff1f")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},"A: \u9ed8\u8ba4\u7684 bundle \u6253\u5305\u6a21\u5f0f\u4e0b\uff0cMorJS \u4f1a\u751f\u6210\u95ed\u5305\u5e76\u57fa\u4e8e\u89c4\u5219\u5408\u5e76 js \u6587\u4ef6\uff0c\u540c\u65f6\u5c06\u5c0f\u7a0b\u5e8f\u591a\u7aef\u7ec4\u4ef6\u81ea\u52a8\u63d0\u53d6\u5230\u4ea7\u7269\u5bf9\u5e94\u7684 npm_components \u76ee\u5f55\uff0c\u4f46\u5982\u679c compileMode \u914d\u7f6e\u7684\u662f transform \u6a21\u5f0f\uff0c\u4f1a\u56e0\u4e3a\u8be5\u7f16\u8bd1\u6a21\u5f0f\u4e0b\u5e76\u4e0d\u5904\u7406 node_modules \u548c\u591a\u7aef\u7ec4\u4ef6\uff0c\u6240\u4ee5\u5f97\u8d70\u5e38\u89c4\u7684\u5fae\u4fe1\u6784\u5efa npm")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},"Q: \u4e3a\u4ec0\u4e48\u6211\u6309\u7167\u89c4\u8303(xxx/button/index)\u5f15\u7528\u7ec4\u4ef6\u8f6c\u5176\u4ed6\u7aef\u4f1a\u62a5 Can't resolve 'xxx' in 'xxx' \u7684\u9519\u8bef\uff1f")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},"A: MorJS \u662f\u901a\u8fc7\u76ee\u5f55\u7ed3\u6784\u7ed3\u5408 package.json \u7684 ",(0,r.kt)("a",{parentName:"p",href:"https://mor.eleme.io/specifications/component#%E7%9B%AE%E5%BD%95%E5%AD%97%E6%AE%B5%E9%85%8D%E7%BD%AE"},"\u76ee\u5f55\u6307\u5411\u5b57\u6bb5\u914d\u7f6e")," \u6765\u5b9e\u73b0\u7684\uff0c\u82e5\u8f6c\u7aef\u8bfb\u53d6\u7684\u5b57\u6bb5\u5165\u53e3\u5bf9\u5e94\u76ee\u5f55\u4e0b\u6ca1\u6709\u7ec4\u4ef6\u4ea7\u7269\uff0c\u7f16\u8bd1\u5f15\u5165\u7ec4\u4ef6\u65f6\u5c06\u62a5\u4e0a\u8ff0\u9519\u8bef\uff0c\u53ef\u4ee5\u628a\u4f7f\u7528\u8def\u5f84\u6539\u4e3a\u7ec4\u4ef6\u5b9e\u9645\u8def\u5f84\uff0c\u6216\u8054\u7cfb\u7ec4\u4ef6\u5f00\u53d1\u8005\u8865\u5145 main \u5165\u53e3\u5b57\u6bb5")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},"Q: \u793e\u533a\u7ec4\u4ef6\u5e93\u4e2d\u4f7f\u7528\u7684\u5b57\u4f53\u8d44\u6e90\u6587\u4ef6\u4f1a\u88ab\u4e00\u540c\u7f16\u8bd1\u5417\uff1f")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},"A: \u4e0d\u4f1a\uff0c\u9488\u5bf9 node_modules \u4e2d\u7684\u975e\u9884\u671f\u6587\u4ef6\u7c7b\u578b\u4e0d\u4f1a\u8fdb\u884c\u5904\u7406\uff0c\u8bf7\u628a\u8d44\u6e90\u6587\u4ef6\u6539\u4e3a\u5f15\u7528 cdn \u8d44\u6e90"))))}c.isMDXComponent=!0}}]);