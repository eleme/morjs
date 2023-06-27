"use strict";(self.webpackChunkmorjs_site=self.webpackChunkmorjs_site||[]).push([[9338],{9613:(e,n,t)=>{t.d(n,{Zo:()=>k,kt:()=>d});var a=t(9496);function l(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function i(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,a)}return t}function p(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?i(Object(t),!0).forEach((function(n){l(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function r(e,n){if(null==e)return{};var t,a,l=function(e,n){if(null==e)return{};var t,a,l={},i=Object.keys(e);for(a=0;a<i.length;a++)t=i[a],n.indexOf(t)>=0||(l[t]=e[t]);return l}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)t=i[a],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(l[t]=e[t])}return l}var o=a.createContext({}),m=function(e){var n=a.useContext(o),t=n;return e&&(t="function"==typeof e?e(n):p(p({},n),e)),t},k=function(e){var n=m(e.components);return a.createElement(o.Provider,{value:n},e.children)},c="mdxType",u={inlineCode:"code",wrapper:function(e){var n=e.children;return a.createElement(a.Fragment,{},n)}},s=a.forwardRef((function(e,n){var t=e.components,l=e.mdxType,i=e.originalType,o=e.parentName,k=r(e,["components","mdxType","originalType","parentName"]),c=m(t),s=l,d=c["".concat(o,".").concat(s)]||c[s]||u[s]||i;return t?a.createElement(d,p(p({ref:n},k),{},{components:t})):a.createElement(d,p({ref:n},k))}));function d(e,n){var t=arguments,l=n&&n.mdxType;if("string"==typeof e||l){var i=t.length,p=new Array(i);p[0]=s;var r={};for(var o in n)hasOwnProperty.call(n,o)&&(r[o]=n[o]);r.originalType=e,r[c]="string"==typeof e?e:l,p[1]=r;for(var m=2;m<i;m++)p[m]=t[m];return a.createElement.apply(null,p)}return a.createElement.apply(null,t)}s.displayName="MDXCreateElement"},698:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>o,contentTitle:()=>p,default:()=>u,frontMatter:()=>i,metadata:()=>r,toc:()=>m});var a=t(1966),l=(t(9496),t(9613));const i={},p="\u591a\u7aef\u7ec4\u4ef6\u5e93\u89c4\u8303",r={unversionedId:"specifications/component",id:"specifications/component",title:"\u591a\u7aef\u7ec4\u4ef6\u5e93\u89c4\u8303",description:"\u6982\u8981",source:"@site/docs/specifications/component.md",sourceDirName:"specifications",slug:"/specifications/component",permalink:"/specifications/component",draft:!1,tags:[],version:"current",frontMatter:{},sidebar:"documentSidebar",previous:{title:"JS \u4f9d\u8d56\u5e93\u89c4\u8303",permalink:"/specifications/js"},next:{title:"\u591a\u7aef\u8fd0\u884c\u65f6\u57fa\u7840\u5e93\u89c4\u8303",permalink:"/specifications/runtime"}},o={},m=[{value:"\u6982\u8981",id:"\u6982\u8981",level:2},{value:"\u7279\u522b\u8bf4\u660e",id:"\u7279\u522b\u8bf4\u660e",level:2},{value:"\u591a\u7aef\u9002\u914d\u7b80\u8981\u8bf4\u660e",id:"\u591a\u7aef\u9002\u914d\u7b80\u8981\u8bf4\u660e",level:2},{value:"\u76ee\u5f55\u5b57\u6bb5\u914d\u7f6e",id:"\u76ee\u5f55\u5b57\u6bb5\u914d\u7f6e",level:3},{value:"\u591a\u7aef\u9002\u914d\u8f93\u51fa\u76ee\u5f55\u7ed3\u6784\u8bf4\u660e",id:"\u591a\u7aef\u9002\u914d\u8f93\u51fa\u76ee\u5f55\u7ed3\u6784\u8bf4\u660e",level:3},{value:"<code>exmaple-component</code> \u7684 <code>package.json</code> \u914d\u7f6e\u793a\u4f8b",id:"exmaple-component-\u7684-packagejson-\u914d\u7f6e\u793a\u4f8b",level:4},{value:"<code>exmaple-component</code> \u7684\u6574\u4f53\u8f93\u51fa\u76ee\u5f55\u7ed3\u6784\u793a\u4f8b",id:"exmaple-component-\u7684\u6574\u4f53\u8f93\u51fa\u76ee\u5f55\u7ed3\u6784\u793a\u4f8b",level:4},{value:"\u4f7f\u7528\u65b9\u5f15\u7528 <code>NPM \u7ec4\u4ef6</code> \u793a\u4f8b",id:"\u4f7f\u7528\u65b9\u5f15\u7528-npm-\u7ec4\u4ef6-\u793a\u4f8b",level:4},{value:"MorJS \u7f16\u8bd1\u8bf4\u660e",id:"morjs-\u7f16\u8bd1\u8bf4\u660e",level:4},{value:"\u7ec4\u4ef6\u5b8c\u6574\u793a\u4f8b",id:"\u7ec4\u4ef6\u5b8c\u6574\u793a\u4f8b",level:2},{value:"\u7ec4\u4ef6\u6e90\u4ee3\u7801",id:"\u7ec4\u4ef6\u6e90\u4ee3\u7801",level:3},{value:"\u5c0f\u7a0b\u5e8f\u76ee\u5f55\u89c4\u8303\u5b8c\u5584\u9879\u76ee",id:"\u5c0f\u7a0b\u5e8f\u76ee\u5f55\u89c4\u8303\u5b8c\u5584\u9879\u76ee",level:3},{value:"\u6784\u5efa\u5904\u7406",id:"\u6784\u5efa\u5904\u7406",level:3}],k={toc:m},c="wrapper";function u(e){let{components:n,...t}=e;return(0,l.kt)(c,(0,a.Z)({},k,t,{components:n,mdxType:"MDXLayout"}),(0,l.kt)("h1",{id:"\u591a\u7aef\u7ec4\u4ef6\u5e93\u89c4\u8303"},"\u591a\u7aef\u7ec4\u4ef6\u5e93\u89c4\u8303"),(0,l.kt)("h2",{id:"\u6982\u8981"},"\u6982\u8981"),(0,l.kt)("p",null,"MorJS \u5728\u7f16\u8bd1\u7684\u8fc7\u7a0b\u4e2d\uff0c\u4e0d\u4f1a\u5904\u7406 ",(0,l.kt)("inlineCode",{parentName:"p"},"node_modules")," \u4e2d\u7684\u5c0f\u7a0b\u5e8f\u591a\u7aef\u7ec4\u4ef6\uff0c\u6240\u4ee5\u9700\u8981\u6bcf\u4e2a\u7ec4\u4ef6\u6216\u8005\u7ec4\u4ef6\u5e93\u5728\u8f93\u51fa\u7ed9\u5230\u4e1a\u52a1\u4f7f\u7528\u7684\u65f6\u5019\u90fd\u662f\u9002\u914d\u4e86\u591a\u7aef\uff0c\u5982: ",(0,l.kt)("strong",{parentName:"p"},"\u5fae\u4fe1\u5c0f\u7a0b\u5e8f\u3001\u652f\u4ed8\u5b9d\u5c0f\u7a0b\u5e8f\u3001\u5b57\u8282\u5c0f\u7a0b\u5e8f\u3001QQ \u5c0f\u7a0b\u5e8f\u3001\u767e\u5ea6\u5c0f\u7a0b\u5e8f\u7b49"),"\uff0c\u56e0\u6b64\u9700\u8981\u5404\u4e2a\u7ec4\u4ef6\u3001\u7ec4\u4ef6\u5e93\u8981\u505a\u597d\u4e25\u683c\u7684\u81ea\u6d4b\u4ee5\u786e\u4fdd\u591a\u7aef\u4e0b\u7684\u517c\u5bb9\u6027\u3002"),(0,l.kt)("h2",{id:"\u7279\u522b\u8bf4\u660e"},"\u7279\u522b\u8bf4\u660e"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},"\u8bf7\u5728\u8f93\u51fa\u7ec4\u4ef6 ",(0,l.kt)("strong",{parentName:"li"},"JS")," \u4ee3\u7801\u7684\u65f6\u5019\u8f93\u51fa ",(0,l.kt)("inlineCode",{parentName:"li"},"ES5")," \u7248\u672c\u7684",(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},"\u5c0f\u7a0b\u5e8f\u5e76\u4e0d\u4f1a\u53bb\u505a ",(0,l.kt)("inlineCode",{parentName:"li"},"node_modules")," \u91cc\u9762\u7684 ",(0,l.kt)("inlineCode",{parentName:"li"},"ESNext")," \u8bed\u6cd5\u8f6c\u6362"),(0,l.kt)("li",{parentName:"ul"},"\u5efa\u8bae\u4f7f\u7528 ",(0,l.kt)("inlineCode",{parentName:"li"},"tsc")," \u8f93\u51fa ",(0,l.kt)("inlineCode",{parentName:"li"},"ES5")," \u4ee3\u7801\uff0c\u539f\u56e0\u53c2\u8003: ",(0,l.kt)("a",{parentName:"li",href:"/specifications/js"},"\u5c0f\u7a0b\u5e8f JS \u4f9d\u8d56\u5e93\u89c4\u8303")))),(0,l.kt)("li",{parentName:"ul"},"\u7ec4\u4ef6\u8f93\u51fa\u591a\u7aef\u7248\u672c\u7684\u65f6\u5019\uff0c\u5efa\u8bae\u4f7f\u7528 MorJS \u7684 ",(0,l.kt)("inlineCode",{parentName:"li"},"compile")," \u80fd\u529b\u6765\u8f93\u51fa\u4ea7\u7269"),(0,l.kt)("li",{parentName:"ul"},"\u7ec4\u4ef6\u7684\u8fd0\u884c\u65f6\u5fc5\u987b\u662f\u91c7\u7528 ",(0,l.kt)("inlineCode",{parentName:"li"},"aComponent")," \u6216 ",(0,l.kt)("inlineCode",{parentName:"li"},"wComponent")," \u6765\u66ff\u4ee3 ",(0,l.kt)("inlineCode",{parentName:"li"},"Component"),"\uff0c\u7528\u6cd5\u8bf7\u53c2\u8003: ",(0,l.kt)("a",{parentName:"li",href:"/guides/basic/runtime"},"\u8fd0\u884c\u65f6\u6587\u6863")),(0,l.kt)("li",{parentName:"ul"},"\u7ec4\u4ef6\u5e93\u4e0e\u7ec4\u4ef6\u7684\u89c4\u8303\u662f\u4e00\u81f4\u7684\uff0c\u533a\u522b\u53ea\u662f\u8f93\u51fa\u591a\u4e2a\u7ec4\u4ef6\u8fd8\u662f\u5355\u4e2a\u7ec4\u4ef6"),(0,l.kt)("li",{parentName:"ul"},"\u5404\u4e2a\u5c0f\u7a0b\u5e8f\u5e73\u53f0\u7684\u517c\u5bb9\u6027\u95ee\u9898\uff0c\u8d85\u51fa\u591a\u7aef\u7f16\u8bd1\u8986\u76d6\u8303\u56f4\u7684\uff0c\u9700\u8981\u81ea\u884c\u5904\u7406\uff0c\u5982\u652f\u4ed8\u5b9d\u5c0f\u7a0b\u5e8f\u662f\u5426\u5f00\u542f ",(0,l.kt)("inlineCode",{parentName:"li"},"component2")," \u652f\u6301\u7684\u60c5\u51b5")),(0,l.kt)("h2",{id:"\u591a\u7aef\u9002\u914d\u7b80\u8981\u8bf4\u660e"},"\u591a\u7aef\u9002\u914d\u7b80\u8981\u8bf4\u660e"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},"MorJS \u662f\u901a\u8fc7\u76ee\u5f55\u7ed3\u6784\u7ed3\u5408 ",(0,l.kt)("inlineCode",{parentName:"li"},"package.json")," \u7684\u76ee\u5f55\u6307\u5411\u5b57\u6bb5\u914d\u7f6e\u6765\u5b9e\u73b0\u7684\uff0c\u5728 NPM \u7ec4\u4ef6 ",(0,l.kt)("inlineCode",{parentName:"li"},"npm publish")," \u73af\u8282\u4e2d\u9700\u8981\u5c06\u5df2\u7ecf\u9002\u914d\u597d\u591a\u7aef\u7684\u6587\u4ef6\u7f16\u8bd1\u5904\u7406\u8f93\u51fa\u53d1\u5e03\uff1b"),(0,l.kt)("li",{parentName:"ul"},"MorJS \u7684\u7f16\u8bd1\u73af\u8282\u4f1a\u6839\u636e\u4e1a\u52a1\u5f15\u7528\u8def\u5f84\u7ed3\u5408 ",(0,l.kt)("inlineCode",{parentName:"li"},"NPM \u7ec4\u4ef6")," \u76ee\u5f55\u914d\u7f6e\u6765\u6309\u9700\u62f7\u8d1d\u5bf9\u5e94\u7684\u7ec4\u4ef6\u6587\u4ef6\uff0c\u5e76\u6539\u5199\u5bf9\u5e94\u7684\u5f15\u7528\u8def\u5f84\u6765\u5b9e\u73b0\u4e00\u4e2a\u8def\u5f84\u591a\u4e2a\u7aef\u53ef\u517c\u5bb9\u8fd0\u884c\uff1b"),(0,l.kt)("li",{parentName:"ul"},"\u8bf7\u6ce8\u610f: MorJS \u662f\u4e0d\u4f1a\u5728\u7f16\u8bd1\u73af\u8282\u52a8\u6001\u7f16\u8bd1\u5904\u7406 ",(0,l.kt)("inlineCode",{parentName:"li"},"node_modules")," \u7684 ",(0,l.kt)("inlineCode",{parentName:"li"},"NPM \u7ec4\u4ef6"),"\uff0c\u539f\u56e0\u5927\u81f4\u6709\u4ee5\u4e0b\u51e0\u70b9:",(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},"\u52a8\u6001\u7f16\u8bd1\u6027\u80fd\u975e\u5e38\u5dee: ",(0,l.kt)("inlineCode",{parentName:"li"},"node_modules")," \u91cc\u9762\u6587\u4ef6\u7e41\u591a\uff0c\u9700\u8981\u6240\u6709\u6587\u4ef6\u90fd\u53bb\u5224\u65ad\u662f\u5426\u9700\u8981\u8fdb\u884c\u7f16\u8bd1\u5904\u7406\uff0c\u6548\u7387\u975e\u5e38\u4f4e\uff1b"),(0,l.kt)("li",{parentName:"ul"},"\u6392\u67e5\u95ee\u9898\u56f0\u96be: \u52a8\u6001\u8f6c\u6362\u4f1a\u53d8\u6210\u9ed1\u7bb1\uff0c\u4f7f\u7528\u65b9\u65e0\u6cd5\u76f4\u63a5\u611f\u77e5\u5230\u8f6c\u6362\u8fc7\u7a0b\u4e2d\u6240\u505a\u7684\u5904\u7406\uff1b"),(0,l.kt)("li",{parentName:"ul"},"\u65e0\u6cd5\u76f4\u63a5\u7ed9\u539f\u751f\u5c0f\u7a0b\u5e8f\u590d\u7528: \u7ec4\u4ef6\u5728\u6ee1\u8db3\u4e00\u5b9a\u6761\u4ef6\u4e0b\uff0c\u662f\u53ef\u4ee5\u540c\u65f6\u7ed9\u975e MorJS \u7684\u5c0f\u7a0b\u5e8f\u5de5\u7a0b\u4f7f\u7528\u7684\uff0c\u5982\u679c\u91c7\u7528\u52a8\u6001\u7f16\u8bd1\u5c31\u6709\u4e14\u53ea\u80fd\u7ed9 MorJS \u5de5\u7a0b\u4f7f\u7528"),(0,l.kt)("li",{parentName:"ul"},"\u964d\u4f4e\u4e86\u7ec4\u4ef6\u63d0\u4f9b\u65b9\u7684\u81ea\u6d4b\u8d23\u4efb: \u5728 ",(0,l.kt)("inlineCode",{parentName:"li"},"NPM \u7ec4\u4ef6")," \u8f93\u51fa\u65f6\u76f4\u63a5\u63d0\u4f9b\u4e86\u7f16\u8bd1\u540e\u4ea7\u7269\uff0c\u80fd\u591f\u8981\u6c42 ",(0,l.kt)("inlineCode",{parentName:"li"},"NPM \u7ec4\u4ef6")," \u505a\u597d\u5bf9\u5e94\u6d4b\u8bd5\uff0c\u800c\u4e0d\u662f\u4f9d\u8d56\u4e8e MorJS \u52a8\u6001\u7f16\u8bd1\u6765\u786e\u4fdd\u53ef\u7528\u6027"),(0,l.kt)("li",{parentName:"ul"},"...")))),(0,l.kt)("h3",{id:"\u76ee\u5f55\u5b57\u6bb5\u914d\u7f6e"},"\u76ee\u5f55\u5b57\u6bb5\u914d\u7f6e"),(0,l.kt)("p",null,"MorJS \u662f\u901a\u8fc7 ",(0,l.kt)("inlineCode",{parentName:"p"},"package.json")," \u4e2d\u6307\u5b9a\u7684\u5165\u53e3\u5b57\u6bb5\u6765\u505a\u591a\u7aef\u903b\u8f91\u533a\u5206\u7684\uff0c\u8be6\u7ec6\u5982\u4e0b:"),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"\u91cd\u8981: ",(0,l.kt)("inlineCode",{parentName:"strong"},"main")," \u5b57\u6bb5\u9075\u4ece ",(0,l.kt)("inlineCode",{parentName:"strong"},"NPM")," \u7684 ",(0,l.kt)("inlineCode",{parentName:"strong"},"package.json")," \u672c\u8eab\u5bf9\u4e8e\u8be5\u5b57\u6bb5\u7684\u5b9a\u4e49\uff0c\u53c2\u89c1 ",(0,l.kt)("a",{parentName:"strong",href:"https://docs.npmjs.com/cli/v7/configuring-npm/package-json#main"},"\u6587\u6863"),"\u3002\u5176\u4ed6\u591a\u7aef\u5165\u53e3\u5b57\u6bb5\u4e3a\u76ee\u5f55\u914d\u7f6e\u5b57\u6bb5\u3002")),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"main"),": \u9ed8\u8ba4\u52a0\u8f7d\u5165\u53e3, \u7528\u4e8e\u5b58\u653e ",(0,l.kt)("inlineCode",{parentName:"li"},"CommonJS")," \u4ea7\u7269",(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},"\u672a\u6307\u5b9a\u591a\u7aef\u5165\u53e3\u7684\u60c5\u51b5\u4e0b\uff0c\u6240\u6709\u7aef\u90fd\u4f1a\u8bfb\u53d6\u8be5\u5165\u53e3"),(0,l.kt)("li",{parentName:"ul"},"\u90e8\u5206\u591a\u7aef\u7684\u60c5\u51b5\u4e0b\uff0c\u672a\u660e\u786e\u4ee5\u4e0b\u65b9\u5b57\u6bb5\u6307\u5b9a\u5165\u53e3\u7684\u7aef\uff0c\u5747\u4f1a\u8bfb\u53d6\u8be5\u7f3a\u7701\u5165\u53e3"))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"module"),": \u9ed8\u8ba4\u52a0\u8f7d\u5165\u53e3\uff0c\u7528\u4e8e\u5b58\u653e ",(0,l.kt)("inlineCode",{parentName:"li"},"ESModule")," \u4ea7\u7269, \u4f5c\u7528\u548c ",(0,l.kt)("inlineCode",{parentName:"li"},"main")," \u7c7b\u4f3c",(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},"\u4ec5\u5f53\u914d\u7f6e\u4e3a ",(0,l.kt)("inlineCode",{parentName:"li"},"ESNext")," \u7684\u7aef\u9ed8\u8ba4\u60c5\u51b5\u4e0b\u4f1a\u4f18\u5148\u4f7f\u7528 ",(0,l.kt)("inlineCode",{parentName:"li"},"module")))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"alipay"),": \u652f\u4ed8\u5b9d\u5c0f\u7a0b\u5e8f\u52a0\u8f7d\u5165\u53e3"),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"miniprogram"),": \u5fae\u4fe1\u5c0f\u7a0b\u5e8f\u52a0\u8f7d\u5165\u53e3\uff0c",(0,l.kt)("strong",{parentName:"li"},"\u8be5\u5b57\u6bb5\u548c\u5fae\u4fe1/QQ/\u4f01\u4e1a\u5fae\u4fe1\u5c0f\u7a0b\u5e8f\u5b98\u65b9\u4e00\u81f4")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"wechat"),": \u5fae\u4fe1\u5c0f\u7a0b\u5e8f\u52a0\u8f7d\u5165\u53e3",(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},"\u4f18\u5148\u7ea7\u6bd4 ",(0,l.kt)("inlineCode",{parentName:"li"},"miniprogram")," \u9ad8"))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"qq"),": QQ \u5c0f\u7a0b\u5e8f\u52a0\u8f7d\u5165\u53e3",(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},"\u4f18\u5148\u7ea7\u6bd4 ",(0,l.kt)("inlineCode",{parentName:"li"},"miniprogram")," \u9ad8"))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"bytedance"),": \u5b57\u8282\u8df3\u52a8\u5c0f\u7a0b\u5e8f\u52a0\u8f7d\u5165\u53e3"),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"baidu"),": \u767e\u5ea6\u5c0f\u7a0b\u5e8f\u52a0\u8f7d\u5165\u53e3"),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"eleme"),": \u997f\u4e86\u4e48\u5c0f\u7a0b\u5e8f\u52a0\u8f7d\u5165\u53e3"),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"dingding"),": \u9489\u9489\u5c0f\u7a0b\u5e8f\u52a0\u8f7d\u5165\u53e3"),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"taobao"),": \u6dd8\u5b9d\u5c0f\u7a0b\u5e8f\u52a0\u8f7d\u5165\u53e3"),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"kuaishou"),": \u5feb\u624b\u5c0f\u7a0b\u5e8f\u52a0\u8f7d\u5165\u53e3"),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"miniforweb"),": Web \u5e94\u7528\u4e13\u7528\u5c0f\u7a0b\u5e8f\u4ea7\u7269\u52a0\u8f7d\u5165\u53e3")),(0,l.kt)("p",null,"\u8bf7\u6ce8\u610f\uff0c\u4ee5\u4e0a\u7684\u5165\u53e3\u5b57\u6bb5\u89c4\u8303\u662f\u8981\u6c42 ",(0,l.kt)("inlineCode",{parentName:"p"},"NPM \u7ec4\u4ef6")," \u652f\u6301\u54ea\u4e2a\u7aef\u5c31 ",(0,l.kt)("strong",{parentName:"p"},"\u5fc5\u987b\u8bbe\u7f6e\u597d\u5bf9\u5e94\u7684\u5b57\u6bb5"),"\u3002"),(0,l.kt)("h3",{id:"\u591a\u7aef\u9002\u914d\u8f93\u51fa\u76ee\u5f55\u7ed3\u6784\u8bf4\u660e"},"\u591a\u7aef\u9002\u914d\u8f93\u51fa\u76ee\u5f55\u7ed3\u6784\u8bf4\u660e"),(0,l.kt)("p",null,"\u8fd9\u91cc\u4e3b\u8981\u662f\u9610\u8ff0\u8f93\u51fa\u76ee\u5f55\uff0c\u6574\u4f53\u7684 ",(0,l.kt)("inlineCode",{parentName:"p"},"NPM \u7ec4\u4ef6")," \u8bf4\u660e\uff0c\u8bf7\u53c2\u8003\u4e0b\u9762\u7684\u7ec4\u4ef6\u793a\u4f8b\u8bf4\u660e\u73af\u8282"),(0,l.kt)("h4",{id:"exmaple-component-\u7684-packagejson-\u914d\u7f6e\u793a\u4f8b"},(0,l.kt)("inlineCode",{parentName:"h4"},"exmaple-component")," \u7684 ",(0,l.kt)("inlineCode",{parentName:"h4"},"package.json")," \u914d\u7f6e\u793a\u4f8b"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-javascript"},'{\n  "name": "exmaple-component",\n\n  // \u7f3a\u7701\u76ee\u5f55\u8bbe\u7f6e\uff0cJS \u5165\u53e3\u6587\u4ef6\u4e3a lib/index.js\uff0c\n  // \u672a\u6307\u5b9a\u7aef\u7684\u5c0f\u7a0b\u5e8f\u7ec4\u4ef6\u6587\u4ef6\u4f1a\u4ece\u8be5\u76ee\u5f55\u4e0b\u83b7\u53d6\uff0c\n  // \u5982\u5c06\u8be5\u5b57\u6bb5\u914d\u7f6e\u4e3a "lib/index.js", \u5219\u6709\u53ef\u80fd\u4f1a\n  // \u65e0\u6cd5\u627e\u5230\u6b63\u786e\u7684\u7ec4\u4ef6\u6587\u4ef6\n  "main": "lib",\n\n  // \u5fae\u4fe1\u5c0f\u7a0b\u5e8f\u7684\u5165\u53e3\u914d\u7f6e\uff0c\u8bf7\u6ce8\u610f\uff0c\u53ea\u9700\u8981\u914d\u7f6e\u76ee\u5f55\u540d\u5373\u53ef\n  "miniprogram": "miniprogram_dist",\n\n  // \u652f\u4ed8\u5b9d\u5c0f\u7a0b\u5e8f\u7684\u5165\u53e3\u914d\u7f6e\uff0c\u8bf7\u6ce8\u610f\uff0c\u53ea\u9700\u8981\u914d\u7f6e\u76ee\u5f55\u540d\u5373\u53ef\n  "alipay": "alipay",\n\n  // \u5efa\u8bae\u914d\u7f6e\u53ea\u8f93\u51fa\u7ec4\u4ef6\u5185\u5bb9\u76ee\u5f55\n  "files": [\n    "lib",\n    "miniprogram_dist",\n    "alipay"\n  ]\n}\n')),(0,l.kt)("h4",{id:"exmaple-component-\u7684\u6574\u4f53\u8f93\u51fa\u76ee\u5f55\u7ed3\u6784\u793a\u4f8b"},(0,l.kt)("inlineCode",{parentName:"h4"},"exmaple-component")," \u7684\u6574\u4f53\u8f93\u51fa\u76ee\u5f55\u7ed3\u6784\u793a\u4f8b"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-bash"},"- lib\n  - index.js\n  - index.axml\n  - index.acss\n  - index.json\n- miniprogram_dist\n  - lib\n    - index.js\n    - index.wxml\n    - index.wxss\n    - index.json\n- alipay\n  - lib\n    - index.js\n    - index.wxml\n    - index.wxss\n    - index.json\n- package.json\n")),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"\u8bf7\u6ce8\u610f: miniprogram_dist \u548c alipay \u76ee\u5f55\u4e0b\u662f\u6709 lib \u76ee\u5f55\u7684\uff01")),(0,l.kt)("h4",{id:"\u4f7f\u7528\u65b9\u5f15\u7528-npm-\u7ec4\u4ef6-\u793a\u4f8b"},"\u4f7f\u7528\u65b9\u5f15\u7528 ",(0,l.kt)("inlineCode",{parentName:"h4"},"NPM \u7ec4\u4ef6")," \u793a\u4f8b"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-javascript"},'{\n  "usingComponents": {\n    "demo-component": "exmaple-component/lib/index"\n  }\n}\n')),(0,l.kt)("h4",{id:"morjs-\u7f16\u8bd1\u8bf4\u660e"},"MorJS \u7f16\u8bd1\u8bf4\u660e"),(0,l.kt)("p",null,"\u9ed8\u8ba4\u60c5\u51b5\u4e0b\uff0c\u4f7f\u7528\u65b9\u5f15\u7528\u7ec4\u4ef6 ",(0,l.kt)("inlineCode",{parentName:"p"},"exmaple-component")," \u53bb\u6389\u591a\u7aef\u4e13\u5c5e\u7684\u90a3\u4e2a\u76ee\u5f55\u5c31\u53ef\u4ee5\u4e86\u3002\u5728\u4e0d\u540c\u7aef\u4e0b MorJS \u4f1a\u6839\u636e\u7ec4\u4ef6\u7684 ",(0,l.kt)("inlineCode",{parentName:"p"},"package.json")," \u4e2d\u7684\u76f8\u5173\u5165\u53e3\u5b57\u6bb5\uff0c\u5982 ",(0,l.kt)("inlineCode",{parentName:"p"},"miniprogram")," \u5b57\u6bb5\u6765\u81ea\u52a8\u5339\u914d\u52a0\u4e0a\u5bf9\u5e94\u7684\u8def\u5f84\uff0c\u6765\u786e\u4fdd\u4f7f\u7528\u65b9\u53ea\u9700\u4e00\u4e2a\u5f15\u7528\u8def\u5f84\uff0c\u5373\u53ef\u5728\u591a\u4e2a\u7aef\u4e0a\u751f\u6548\u3002"),(0,l.kt)("h2",{id:"\u7ec4\u4ef6\u5b8c\u6574\u793a\u4f8b"},"\u7ec4\u4ef6\u5b8c\u6574\u793a\u4f8b"),(0,l.kt)("p",null,"\u4e3a\u4e86\u89e3\u51b3\u7ec4\u4ef6\u672c\u5730\u9884\u89c8\u7684\u95ee\u9898\uff0c\u5efa\u8bae\u7ec4\u4ef6\u672c\u8eab\u4e5f\u662f\u4e00\u4e2a\u5c0f\u7a0b\u5e8f\u9879\u76ee\u3002\u53ea\u662f\u5728\u8f93\u51fa\u7684\u65f6\u5019\u91c7\u7528\u6307\u5b9a\u76ee\u5f55\u8f93\u51fa\u7684\u5f62\u5f0f\u3002"),(0,l.kt)("p",null,"\u8bf7\u6ce8\u610f: \u7ec4\u4ef6\u7684\u8fd0\u884c\u65f6\u5fc5\u987b\u662f\u7528 ",(0,l.kt)("inlineCode",{parentName:"p"},"aApp")," \u6216 ",(0,l.kt)("inlineCode",{parentName:"p"},"wPage")," \u66ff\u4ee3 ",(0,l.kt)("inlineCode",{parentName:"p"},"App"),"\uff0c",(0,l.kt)("inlineCode",{parentName:"p"},"aPage")," \u6216 ",(0,l.kt)("inlineCode",{parentName:"p"},"wPage")," \u66ff\u4ee3 ",(0,l.kt)("inlineCode",{parentName:"p"},"Page"),"\uff0c",(0,l.kt)("inlineCode",{parentName:"p"},"aComponent")," \u6216 ",(0,l.kt)("inlineCode",{parentName:"p"},"wComponent")," \u66ff\u4ee3 ",(0,l.kt)("inlineCode",{parentName:"p"},"Component"),"\u3002"),(0,l.kt)("h3",{id:"\u7ec4\u4ef6\u6e90\u4ee3\u7801"},"\u7ec4\u4ef6\u6e90\u4ee3\u7801"),(0,l.kt)("p",null,"\u8fd9\u91cc\u4ee5\u9879\u76ee\u6839\u76ee\u5f55\u7684 ",(0,l.kt)("inlineCode",{parentName:"p"},"component")," \u4e3a\u6e90\u4ee3\u7801\u76ee\u5f55:"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-bash"},"- component\n  - index.js\n  - index.less\n  - index.axml\n  - index.json\n")),(0,l.kt)("h3",{id:"\u5c0f\u7a0b\u5e8f\u76ee\u5f55\u89c4\u8303\u5b8c\u5584\u9879\u76ee"},"\u5c0f\u7a0b\u5e8f\u76ee\u5f55\u89c4\u8303\u5b8c\u5584\u9879\u76ee"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},"example \u76ee\u5f55: \u5c0f\u7a0b\u5e8f\u9875\u9762\uff0c\u7528\u4e8e\u76f4\u63a5\u5f15\u7528\u7ec4\u4ef6\uff0c\u672c\u5730\u9884\u89c8\u7528"),(0,l.kt)("li",{parentName:"ul"},"app: \u5c0f\u7a0b\u5e8f\u5165\u53e3"),(0,l.kt)("li",{parentName:"ul"},"mor.config.ts: MorJS \u5c0f\u7a0b\u5e8f\u914d\u7f6e\u6587\u4ef6"),(0,l.kt)("li",{parentName:"ul"},"mini.project.json: \u652f\u4ed8\u5b9d\u5c0f\u7a0b\u5e8f\u9879\u76ee\u914d\u7f6e\u6587\u4ef6"),(0,l.kt)("li",{parentName:"ul"},"project.config.json: \u5fae\u4fe1\u5c0f\u7a0b\u5e8f\u9879\u76ee\u914d\u7f6e\u6587\u4ef6"),(0,l.kt)("li",{parentName:"ul"},"project.tt.json: \u5b57\u8282\u5c0f\u7a0b\u5e8f\u9879\u76ee\u914d\u7f6e\u6587\u4ef6",(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},"\u4e5f\u53ef\u4ee5\u76f4\u63a5\u4f7f\u7528 project.config.json \u6587\u4ef6"))),(0,l.kt)("li",{parentName:"ul"},"project.qq.json: QQ \u5c0f\u7a0b\u5e8f\u9879\u76ee\u914d\u7f6e\u6587\u4ef6",(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},"\u4e5f\u53ef\u4ee5\u76f4\u63a5\u4f7f\u7528 project.config.json \u6587\u4ef6"))),(0,l.kt)("li",{parentName:"ul"},"project.swan.json: \u767e\u5ea6\u5c0f\u7a0b\u5e8f\u9879\u76ee\u914d\u7f6e\u6587\u4ef6"),(0,l.kt)("li",{parentName:"ul"},"project.eleme.json: \u997f\u4e86\u4e48\u5c0f\u7a0b\u5e8f\u9879\u76ee\u914d\u7f6e\u6587\u4ef6",(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},"\u4e5f\u53ef\u4ee5\u76f4\u63a5\u4f7f\u7528 mini.project.json \u6587\u4ef6"))),(0,l.kt)("li",{parentName:"ul"},"project.taobao.json: \u6dd8\u5b9d\u5c0f\u7a0b\u5e8f\u9879\u76ee\u914d\u7f6e\u6587\u4ef6"),(0,l.kt)("li",{parentName:"ul"},"project.kuaishou.json: \u6dd8\u5b9d\u5c0f\u7a0b\u5e8f\u9879\u76ee\u914d\u7f6e\u6587\u4ef6",(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},"\u4e5f\u53ef\u4ee5\u76f4\u63a5\u4f7f\u7528 mini.project.json \u6587\u4ef6"))),(0,l.kt)("li",{parentName:"ul"},"project.dd.json: \u9489\u9489\u5c0f\u7a0b\u5e8f\u9879\u76ee\u914d\u7f6e\u6587\u4ef6",(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},"\u4e5f\u53ef\u4ee5\u76f4\u63a5\u4f7f\u7528 mini.project.json \u6587\u4ef6"))),(0,l.kt)("li",{parentName:"ul"},"package.json: NPM \u4f9d\u8d56\u914d\u7f6e\u6587\u4ef6")),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-bash"},"- example\n  - index.js\n  - index.wxss\n  - index.wxml\n  - index.json\n- app.js\n- app.json\n- package.json\n- mini.project.json\n- project.config.json\n- project.tt.json\n- project.qq.json\n- project.swan.json\n- project.dd.json\n- mor.config.ts\n")),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"example/index.json")," \u793a\u4f8b:"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},"\u5f15\u7528\u7ec4\u4ef6")),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-javascript"},'{\n  "defaultTitle": "\u7ec4\u4ef6\u6d4b\u8bd5\u9875",\n  "usingComponents": {\n    "demo-component": "../component/index"\n  }\n}\n\n')),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"example/index.wxml")," \u793a\u4f8b:"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-html"},'<view class="example-page">\n  <demo-component />\n</view>\n')),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"app.json")," \u793a\u4f8b:"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},"\u589e\u52a0\u9875\u9762\u5165\u53e3")),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "pages": ["example/index"]\n}\n')),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"mor.config.ts")," \u5185\u5bb9\u793a\u4f8b:"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},"IDE \u9884\u89c8\u914d\u7f6e")),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-javascript"},"import { defineConfig } from '@morjs/cli'\n\nexport default defineConfig([\n  {\n    name: 'ali',\n    sourceType: 'alipay',\n    target: 'alipay',\n    compileMode: 'bundle'\n  },\n  {\n    name: 'wechat',\n    sourceType: 'alipay',\n    target: 'wechat',\n    compileMode: 'bundle'\n  }\n])\n")),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"package.json")," \u5185\u5bb9\u793a\u4f8b:"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},"\u589e\u52a0 scripts \u914d\u7f6e")),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-javascript"},'{\n  "scripts": {\n    "compile": "mor compile",\n    "dev": "mor compile --watch"\n  }\n}\n')),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"project.config.json")," \u5185\u5bb9\u793a\u4f8b:"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "miniprogramRoot": "dist/wechat"\n}\n')),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"mini.project.json")," \u5185\u5bb9\u793a\u4f8b:"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-json"},'{\n  "miniprogramRoot": "dist/alipay"\n}\n')),(0,l.kt)("p",null,"\u9879\u76ee\u8fd0\u884c:"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"npm run dev")," \u7136\u540e\u5fae\u4fe1\u5c0f\u7a0b\u5e8f IDE\u3001\u652f\u4ed8\u5b9d\u5c0f\u7a0b\u5e8f IDE \u7b49\u6253\u5f00\u9879\u76ee\u6839\u76ee\u5f55\u5373\u53ef\u3002"),(0,l.kt)("h3",{id:"\u6784\u5efa\u5904\u7406"},"\u6784\u5efa\u5904\u7406"),(0,l.kt)("p",null,"MorJS \u652f\u6301\u914d\u7f6e\u6587\u4ef6\u6307\u5b9a\uff0c\u56e0\u6b64\u5728\u7ec4\u4ef6\u8f93\u51fa\u7684\u65f6\u5019\uff0c\u6211\u4eec\u53ef\u4ee5\u5229\u7528 MorJS \u7684 ",(0,l.kt)("inlineCode",{parentName:"p"},"compile")," \u80fd\u529b\u6765\u76f4\u63a5\u8f93\u51fa\u652f\u6301\u591a\u7aef\u7684\u6784\u5efa\u4ea7\u7269\u3002\n\u8fd9\u91cc\u4ee5\u7ec4\u4ef6\u8f93\u51fa",(0,l.kt)("inlineCode",{parentName:"p"},"lib"),"\u76ee\u5f55\u4e3a\u793a\u4f8b\u3002"),(0,l.kt)("p",null,"\u9879\u76ee\u6839\u76ee\u5f55\u4e0b\u65b0\u589e ",(0,l.kt)("inlineCode",{parentName:"p"},"mor.build.config.ts")," \u6587\u4ef6\uff0c\u7528\u4e8e\u7ec4\u4ef6\u7f16\u8bd1\u8f93\u51fa"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-javascript"},"import { defineConfig } from '@morjs/cli'\n\nexport default defineConfig([\n  {\n    name: 'alipay',\n    sourceType: 'alipay',\n    target: 'alipay',\n    compileMode: 'default',\n    srcPath: './component',\n    outputPath: './alipay'\n  },\n  {\n    name: 'wechat',\n    sourceType: 'alipay',\n    target: 'wechat',\n    compileMode: 'default',\n    srcPath: './component',\n    outputPath: './miniprogram_dist'\n  }\n])\n")),(0,l.kt)("p",null,"pacakge.json \u5185\u5bb9\u793a\u4f8b:"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},"\u589e\u52a0\u76f8\u5173 ",(0,l.kt)("inlineCode",{parentName:"li"},"scripts"))),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-javascript"},'{\n  "miniprogram": "miniprogram_dist",\n  "alipay": "alipay",\n  "files": [\n    "miniprogram_dist",\n    "alipay"\n  ],\n  "scripts": {\n    "clean": "rm -rf alipay miniprogram_dist", // \u6e05\u7a7a\u6784\u5efa\u4ea7\u7269\u76ee\u5f55\n    "build": "npm run clean && mor compile --production --config mor.build.config.ts", // \u6784\u5efa\u4ea7\u7269\n    "prepublishOnly": "npm run build", // \u53d1\u5e03\u524d\u8fdb\u884c\u4e00\u6b21\u6784\u5efa\uff0c\u786e\u4fdd\u53d1\u5e03\u7684\u4ee3\u7801\u662f\u6700\u65b0\u7248\u672c\n    "compile": "mor compile", // \u7528\u4e8e\u672c\u5730\u9884\u89c8\n    "dev": "mor compile --watch" // \u7528\u4e8e\u672c\u5730\u9884\u89c8\n  }\n}\n')),(0,l.kt)("p",null,"\u540e\u7eed\u901a\u8fc7 ",(0,l.kt)("inlineCode",{parentName:"p"},"npm publish")," \u53d1\u5e03\u5373\u53ef"))}u.isMDXComponent=!0}}]);