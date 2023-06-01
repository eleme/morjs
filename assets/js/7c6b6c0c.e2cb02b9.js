"use strict";(self.webpackChunkmorjs_site=self.webpackChunkmorjs_site||[]).push([[3194],{9613:(t,e,a)=>{a.d(e,{Zo:()=>i,kt:()=>N});var n=a(9496);function l(t,e,a){return e in t?Object.defineProperty(t,e,{value:a,enumerable:!0,configurable:!0,writable:!0}):t[e]=a,t}function r(t,e){var a=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),a.push.apply(a,n)}return a}function o(t){for(var e=1;e<arguments.length;e++){var a=null!=arguments[e]?arguments[e]:{};e%2?r(Object(a),!0).forEach((function(e){l(t,e,a[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(a)):r(Object(a)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(a,e))}))}return t}function p(t,e){if(null==t)return{};var a,n,l=function(t,e){if(null==t)return{};var a,n,l={},r=Object.keys(t);for(n=0;n<r.length;n++)a=r[n],e.indexOf(a)>=0||(l[a]=t[a]);return l}(t,e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);for(n=0;n<r.length;n++)a=r[n],e.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(t,a)&&(l[a]=t[a])}return l}var u=n.createContext({}),k=function(t){var e=n.useContext(u),a=e;return t&&(a="function"==typeof t?t(e):o(o({},e),t)),a},i=function(t){var e=k(t.components);return n.createElement(u.Provider,{value:e},t.children)},m="mdxType",c={inlineCode:"code",wrapper:function(t){var e=t.children;return n.createElement(n.Fragment,{},e)}},d=n.forwardRef((function(t,e){var a=t.components,l=t.mdxType,r=t.originalType,u=t.parentName,i=p(t,["components","mdxType","originalType","parentName"]),m=k(a),d=l,N=m["".concat(u,".").concat(d)]||m[d]||c[d]||r;return a?n.createElement(N,o(o({ref:e},i),{},{components:a})):n.createElement(N,o({ref:e},i))}));function N(t,e){var a=arguments,l=e&&e.mdxType;if("string"==typeof t||l){var r=a.length,o=new Array(r);o[0]=d;var p={};for(var u in e)hasOwnProperty.call(e,u)&&(p[u]=e[u]);p.originalType=t,p[m]="string"==typeof t?t:l,o[1]=p;for(var k=2;k<r;k++)o[k]=a[k];return n.createElement.apply(null,o)}return n.createElement.apply(null,a)}d.displayName="MDXCreateElement"},2979:(t,e,a)=>{a.r(e),a.d(e,{assets:()=>u,contentTitle:()=>o,default:()=>c,frontMatter:()=>r,metadata:()=>p,toc:()=>k});var n=a(795),l=(a(9496),a(9613));const r={},o="\u6587\u6863\u7f16\u5199\u53ca\u6392\u7248\u89c4\u8303",p={unversionedId:"specifications/document",id:"specifications/document",title:"\u6587\u6863\u7f16\u5199\u53ca\u6392\u7248\u89c4\u8303",description:"\u5982\u4f55\u5199\u597d\u6587\u6863\uff1f",source:"@site/docs/specifications/document.md",sourceDirName:"specifications",slug:"/specifications/document",permalink:"/specifications/document",draft:!1,tags:[],version:"current",frontMatter:{},sidebar:"documentSidebar",previous:{title:"\u591a\u7aef\u8fd0\u884c\u65f6\u57fa\u7840\u5e93\u89c4\u8303",permalink:"/specifications/runtime"}},u={},k=[{value:"\u5982\u4f55\u5199\u597d\u6587\u6863\uff1f",id:"\u5982\u4f55\u5199\u597d\u6587\u6863",level:2},{value:"\u6587\u6848\u6392\u7248\u89c4\u8303",id:"\u6587\u6848\u6392\u7248\u89c4\u8303",level:2},{value:"\u7a7a\u683c",id:"\u7a7a\u683c",level:3},{value:"\u4e2d\u82f1\u6587\u4e4b\u95f4\u9700\u8981\u589e\u52a0\u7a7a\u683c",id:"\u4e2d\u82f1\u6587\u4e4b\u95f4\u9700\u8981\u589e\u52a0\u7a7a\u683c",level:4},{value:"\u4e2d\u6587\u4e0e\u6570\u5b57\u4e4b\u95f4\u9700\u8981\u589e\u52a0\u7a7a\u683c",id:"\u4e2d\u6587\u4e0e\u6570\u5b57\u4e4b\u95f4\u9700\u8981\u589e\u52a0\u7a7a\u683c",level:4},{value:"\u6570\u5b57\u4e0e\u5355\u4f4d\u4e4b\u95f4\u9700\u8981\u589e\u52a0\u7a7a\u683c",id:"\u6570\u5b57\u4e0e\u5355\u4f4d\u4e4b\u95f4\u9700\u8981\u589e\u52a0\u7a7a\u683c",level:4},{value:"\u5168\u89d2\u6807\u70b9\u4e0e\u5176\u4ed6\u5b57\u7b26\u4e4b\u95f4\u4e0d\u52a0\u7a7a\u683c",id:"\u5168\u89d2\u6807\u70b9\u4e0e\u5176\u4ed6\u5b57\u7b26\u4e4b\u95f4\u4e0d\u52a0\u7a7a\u683c",level:4},{value:"\u7528 <code>text-spacing</code> \u6765\u633d\u6551\uff1f",id:"\u7528-text-spacing-\u6765\u633d\u6551",level:4},{value:"\u6807\u70b9\u7b26\u53f7",id:"\u6807\u70b9\u7b26\u53f7",level:3},{value:"\u4e0d\u91cd\u590d\u4f7f\u7528\u6807\u70b9\u7b26\u53f7",id:"\u4e0d\u91cd\u590d\u4f7f\u7528\u6807\u70b9\u7b26\u53f7",level:4},{value:"\u5168\u89d2\u548c\u534a\u89d2",id:"\u5168\u89d2\u548c\u534a\u89d2",level:3},{value:"\u4f7f\u7528\u5168\u89d2\u4e2d\u6587\u6807\u70b9",id:"\u4f7f\u7528\u5168\u89d2\u4e2d\u6587\u6807\u70b9",level:4},{value:"\u6570\u5b57\u4f7f\u7528\u534a\u89d2\u5b57\u7b26",id:"\u6570\u5b57\u4f7f\u7528\u534a\u89d2\u5b57\u7b26",level:4},{value:"\u9047\u5230\u5b8c\u6574\u7684\u82f1\u6587\u6574\u53e5\u3001\u7279\u6b8a\u540d\u8bcd\uff0c\u5176\u5185\u5bb9\u4f7f\u7528\u534a\u89d2\u6807\u70b9",id:"\u9047\u5230\u5b8c\u6574\u7684\u82f1\u6587\u6574\u53e5\u7279\u6b8a\u540d\u8bcd\u5176\u5185\u5bb9\u4f7f\u7528\u534a\u89d2\u6807\u70b9",level:4},{value:"\u540d\u8bcd",id:"\u540d\u8bcd",level:3},{value:"\u4e13\u6709\u540d\u8bcd\u4f7f\u7528\u6b63\u786e\u7684\u5927\u5c0f\u5199",id:"\u4e13\u6709\u540d\u8bcd\u4f7f\u7528\u6b63\u786e\u7684\u5927\u5c0f\u5199",level:4},{value:"\u4e0d\u8981\u4f7f\u7528\u4e0d\u5730\u9053\u7684\u7f29\u5199",id:"\u4e0d\u8981\u4f7f\u7528\u4e0d\u5730\u9053\u7684\u7f29\u5199",level:4},{value:"\u4e89\u8bae",id:"\u4e89\u8bae",level:3},{value:"\u94fe\u63a5\u4e4b\u95f4\u589e\u52a0\u7a7a\u683c",id:"\u94fe\u63a5\u4e4b\u95f4\u589e\u52a0\u7a7a\u683c",level:4},{value:"\u7b80\u4f53\u4e2d\u6587\u4f7f\u7528\u76f4\u89d2\u5f15\u53f7",id:"\u7b80\u4f53\u4e2d\u6587\u4f7f\u7528\u76f4\u89d2\u5f15\u53f7",level:4},{value:"\u5de5\u5177",id:"\u5de5\u5177",level:3},{value:"\u8c01\u5728\u8fd9\u6837\u505a\uff1f",id:"\u8c01\u5728\u8fd9\u6837\u505a",level:3},{value:"\u53c2\u8003\u6587\u732e",id:"\u53c2\u8003\u6587\u732e",level:3},{value:"Forks",id:"forks",level:3}],i={toc:k},m="wrapper";function c(t){let{components:e,...a}=t;return(0,l.kt)(m,(0,n.Z)({},i,a,{components:e,mdxType:"MDXLayout"}),(0,l.kt)("h1",{id:"\u6587\u6863\u7f16\u5199\u53ca\u6392\u7248\u89c4\u8303"},"\u6587\u6863\u7f16\u5199\u53ca\u6392\u7248\u89c4\u8303"),(0,l.kt)("h2",{id:"\u5982\u4f55\u5199\u597d\u6587\u6863"},"\u5982\u4f55\u5199\u597d\u6587\u6863\uff1f"),(0,l.kt)("p",null,"\u53c2\u89c1 \ud83d\udc49\ud83c\udffb ",(0,l.kt)("a",{parentName:"p",href:"https://documentation.divio.com/"},"\u6587\u6863\u56db\u8c61\u9650")),(0,l.kt)("h2",{id:"\u6587\u6848\u6392\u7248\u89c4\u8303"},"\u6587\u6848\u6392\u7248\u89c4\u8303"),(0,l.kt)("p",null,"\u89c4\u8303\u6765\u6e90: ",(0,l.kt)("a",{parentName:"p",href:"https://github.com/sparanoid/chinese-copywriting-guidelines/blob/master/README.zh-Hans.md"},"\u4e2d\u6587\u6587\u6848\u6392\u7248\u6307\u5317")),(0,l.kt)("p",null,"\u7edf\u4e00\u4e2d\u6587\u6587\u6848\u3001\u6392\u7248\u7684\u76f8\u5173\u7528\u6cd5\uff0c\u964d\u4f4e\u56e2\u961f\u6210\u5458\u4e4b\u95f4\u7684\u6c9f\u901a\u6210\u672c\uff0c\u589e\u5f3a\u7f51\u7ad9\u6c14\u8d28\u3002"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"\u7a7a\u683c"},"\u7a7a\u683c"),(0,l.kt)("blockquote",null,(0,l.kt)("p",{parentName:"blockquote"},"\u300c\u6709\u7814\u7a76\u663e\u793a\uff0c\u6253\u5b57\u7684\u65f6\u5019\u4e0d\u559c\u6b22\u5728\u4e2d\u6587\u548c\u82f1\u6587\u4e4b\u95f4\u52a0\u7a7a\u683c\u7684\u4eba\uff0c\u611f\u60c5\u8def\u90fd\u8d70\u5f97\u5f88\u8f9b\u82e6\uff0c\u6709\u4e03\u6210\u7684\u6bd4\u4f8b\u4f1a\u5728 34 \u5c81\u7684\u65f6\u5019\u8ddf\u81ea\u5df1\u4e0d\u7231\u7684\u4eba\u7ed3\u5a5a\uff0c\u800c\u5176\u4f59\u4e09\u6210\u7684\u4eba\u6700\u540e\u53ea\u80fd\u628a\u9057\u4ea7\u7559\u7ed9\u81ea\u5df1\u7684\u732b\u3002\u6bd5\u7adf\u7231\u60c5\u8ddf\u4e66\u5199\u90fd\u9700\u8981\u9002\u65f6\u5730\u7559\u767d\u3002"),(0,l.kt)("p",{parentName:"blockquote"},"\u4e0e\u5927\u5bb6\u5171\u52c9\u4e4b\u3002\u300d\u2014\u2014",(0,l.kt)("a",{parentName:"p",href:"https://github.com/vinta/pangu.js"},"vinta/paranoid-auto-spacing"))),(0,l.kt)("h4",{id:"\u4e2d\u82f1\u6587\u4e4b\u95f4\u9700\u8981\u589e\u52a0\u7a7a\u683c"},"\u4e2d\u82f1\u6587\u4e4b\u95f4\u9700\u8981\u589e\u52a0\u7a7a\u683c"),(0,l.kt)("p",null,"\u6b63\u786e\uff1a"),(0,l.kt)("blockquote",null,(0,l.kt)("p",{parentName:"blockquote"},"\u5728 LeanCloud \u4e0a\uff0c\u6570\u636e\u5b58\u50a8\u662f\u56f4\u7ed5 ",(0,l.kt)("inlineCode",{parentName:"p"},"AVObject")," \u8fdb\u884c\u7684\u3002")),(0,l.kt)("p",null,"\u9519\u8bef\uff1a"),(0,l.kt)("blockquote",null,(0,l.kt)("p",{parentName:"blockquote"},"\u5728 LeanCloud \u4e0a\uff0c\u6570\u636e\u5b58\u50a8\u662f\u56f4\u7ed5",(0,l.kt)("inlineCode",{parentName:"p"},"AVObject"),"\u8fdb\u884c\u7684\u3002"),(0,l.kt)("p",{parentName:"blockquote"},"\u5728 LeanCloud \u4e0a\uff0c\u6570\u636e\u5b58\u50a8\u662f\u56f4\u7ed5",(0,l.kt)("inlineCode",{parentName:"p"},"AVObject")," \u8fdb\u884c\u7684\u3002")),(0,l.kt)("p",null,"\u5b8c\u6574\u7684\u6b63\u786e\u7528\u6cd5\uff1a"),(0,l.kt)("blockquote",null,(0,l.kt)("p",{parentName:"blockquote"},"\u5728 LeanCloud \u4e0a\uff0c\u6570\u636e\u5b58\u50a8\u662f\u56f4\u7ed5 ",(0,l.kt)("inlineCode",{parentName:"p"},"AVObject")," \u8fdb\u884c\u7684\u3002\u6bcf\u4e2a ",(0,l.kt)("inlineCode",{parentName:"p"},"AVObject")," \u90fd\u5305\u542b\u4e86\u4e0e JSON \u517c\u5bb9\u7684 key-value \u5bf9\u5e94\u7684\u6570\u636e\u3002\u6570\u636e\u662f schema-free \u7684\uff0c\u4f60\u4e0d\u9700\u8981\u5728\u6bcf\u4e2a ",(0,l.kt)("inlineCode",{parentName:"p"},"AVObject")," \u4e0a\u63d0\u524d\u6307\u5b9a\u5b58\u5728\u54ea\u4e9b\u952e\uff0c\u53ea\u8981\u76f4\u63a5\u8bbe\u5b9a\u5bf9\u5e94\u7684 key-value \u5373\u53ef\u3002")),(0,l.kt)("p",null,"\u4f8b\u5916\uff1a\u300c\u8c46\u74e3 FM\u300d\u7b49\u4ea7\u54c1\u540d\u8bcd\uff0c\u6309\u7167\u5b98\u65b9\u6240\u5b9a\u4e49\u7684\u683c\u5f0f\u4e66\u5199\u3002"),(0,l.kt)("h4",{id:"\u4e2d\u6587\u4e0e\u6570\u5b57\u4e4b\u95f4\u9700\u8981\u589e\u52a0\u7a7a\u683c"},"\u4e2d\u6587\u4e0e\u6570\u5b57\u4e4b\u95f4\u9700\u8981\u589e\u52a0\u7a7a\u683c"),(0,l.kt)("p",null,"\u6b63\u786e\uff1a"),(0,l.kt)("blockquote",null,(0,l.kt)("p",{parentName:"blockquote"},"\u4eca\u5929\u51fa\u53bb\u4e70\u83dc\u82b1\u4e86 5000 \u5143\u3002")),(0,l.kt)("p",null,"\u9519\u8bef\uff1a"),(0,l.kt)("blockquote",null,(0,l.kt)("p",{parentName:"blockquote"},"\u4eca\u5929\u51fa\u53bb\u4e70\u83dc\u82b1\u4e86 5000 \u5143\u3002"),(0,l.kt)("p",{parentName:"blockquote"},"\u4eca\u5929\u51fa\u53bb\u4e70\u83dc\u82b1\u4e86 5000 \u5143\u3002")),(0,l.kt)("h4",{id:"\u6570\u5b57\u4e0e\u5355\u4f4d\u4e4b\u95f4\u9700\u8981\u589e\u52a0\u7a7a\u683c"},"\u6570\u5b57\u4e0e\u5355\u4f4d\u4e4b\u95f4\u9700\u8981\u589e\u52a0\u7a7a\u683c"),(0,l.kt)("p",null,"\u6b63\u786e\uff1a"),(0,l.kt)("blockquote",null,(0,l.kt)("p",{parentName:"blockquote"},"\u6211\u5bb6\u7684\u5149\u7ea4\u5165\u5c4b\u5bbd\u5e26\u6709 10 Gbps\uff0cSSD \u4e00\u5171\u6709 20 TB")),(0,l.kt)("p",null,"\u9519\u8bef\uff1a"),(0,l.kt)("blockquote",null,(0,l.kt)("p",{parentName:"blockquote"},"\u6211\u5bb6\u7684\u5149\u7ea4\u5165\u5c4b\u5bbd\u5e26\u6709 10Gbps\uff0cSSD \u4e00\u5171\u6709 20TB")),(0,l.kt)("p",null,"\u4f8b\u5916\uff1a\u5ea6\u6570\uff0f\u767e\u5206\u6bd4\u4e0e\u6570\u5b57\u4e4b\u95f4\u4e0d\u9700\u8981\u589e\u52a0\u7a7a\u683c\uff1a"),(0,l.kt)("p",null,"\u6b63\u786e\uff1a"),(0,l.kt)("blockquote",null,(0,l.kt)("p",{parentName:"blockquote"},"\u89d2\u5ea6\u4e3a 90\xb0 \u7684\u89d2\uff0c\u5c31\u662f\u76f4\u89d2\u3002"),(0,l.kt)("p",{parentName:"blockquote"},"\u65b0 MacBook Pro \u6709 15% \u7684 CPU \u6027\u80fd\u63d0\u5347\u3002")),(0,l.kt)("p",null,"\u9519\u8bef\uff1a"),(0,l.kt)("blockquote",null,(0,l.kt)("p",{parentName:"blockquote"},"\u89d2\u5ea6\u4e3a 90 \xb0 \u7684\u89d2\uff0c\u5c31\u662f\u76f4\u89d2\u3002"),(0,l.kt)("p",{parentName:"blockquote"},"\u65b0 MacBook Pro \u6709 15 % \u7684 CPU \u6027\u80fd\u63d0\u5347\u3002")),(0,l.kt)("h4",{id:"\u5168\u89d2\u6807\u70b9\u4e0e\u5176\u4ed6\u5b57\u7b26\u4e4b\u95f4\u4e0d\u52a0\u7a7a\u683c"},"\u5168\u89d2\u6807\u70b9\u4e0e\u5176\u4ed6\u5b57\u7b26\u4e4b\u95f4\u4e0d\u52a0\u7a7a\u683c"),(0,l.kt)("p",null,"\u6b63\u786e\uff1a"),(0,l.kt)("blockquote",null,(0,l.kt)("p",{parentName:"blockquote"},"\u521a\u521a\u4e70\u4e86\u4e00\u90e8 iPhone\uff0c\u597d\u5f00\u5fc3\uff01")),(0,l.kt)("p",null,"\u9519\u8bef\uff1a"),(0,l.kt)("blockquote",null,(0,l.kt)("p",{parentName:"blockquote"},"\u521a\u521a\u4e70\u4e86\u4e00\u90e8 iPhone \uff0c\u597d\u5f00\u5fc3\uff01"),(0,l.kt)("p",{parentName:"blockquote"},"\u521a\u521a\u4e70\u4e86\u4e00\u90e8 iPhone\uff0c \u597d\u5f00\u5fc3\uff01")),(0,l.kt)("h4",{id:"\u7528-text-spacing-\u6765\u633d\u6551"},"\u7528 ",(0,l.kt)("inlineCode",{parentName:"h4"},"text-spacing")," \u6765\u633d\u6551\uff1f"),(0,l.kt)("p",null,"CSS Text Module Level 4 \u7684 ",(0,l.kt)("a",{parentName:"p",href:"https://www.w3.org/TR/css-text-4/#text-spacing-property"},(0,l.kt)("inlineCode",{parentName:"a"},"text-spacing"))," \u548c Microsoft \u7684 ",(0,l.kt)("a",{parentName:"p",href:"https://msdn.microsoft.com/library/ms531164(v=vs.85).aspx"},(0,l.kt)("inlineCode",{parentName:"a"},"-ms-text-autospace"))," \u53ef\u4ee5\u5b9e\u73b0\u81ea\u52a8\u4e3a\u4e2d\u82f1\u6587\u4e4b\u95f4\u589e\u52a0\u7a7a\u767d\u3002\u4e0d\u8fc7\u76ee\u524d\u5e76\u672a\u666e\u53ca\uff0c\u53e6\u5916\u5728\u5176\u4ed6\u5e94\u7528\u573a\u666f\uff0c\u4f8b\u5982 macOS\u3001iOS\u3001Windows \u7b49\u7528\u6237\u754c\u9762\u76ee\u524d\u5e76\u4e0d\u5b58\u5728\u8fd9\u4e2a\u7279\u6027\uff0c\u6240\u4ee5\u8bf7\u7ee7\u7eed\u4fdd\u6301\u968f\u624b\u52a0\u7a7a\u683c\u7684\u4e60\u60ef\u3002"),(0,l.kt)("h3",{id:"\u6807\u70b9\u7b26\u53f7"},"\u6807\u70b9\u7b26\u53f7"),(0,l.kt)("h4",{id:"\u4e0d\u91cd\u590d\u4f7f\u7528\u6807\u70b9\u7b26\u53f7"},"\u4e0d\u91cd\u590d\u4f7f\u7528\u6807\u70b9\u7b26\u53f7"),(0,l.kt)("p",null,"\u5373\u4f7f\u4e2d\u56fd\u5927\u9646\u7684\u6807\u70b9\u7b26\u53f7\u7528\u6cd5\u5141\u8bb8\u91cd\u590d\u4f7f\u7528\u6807\u70b9\u7b26\u53f7\uff0c\u4f46\u662f\u8fd9\u4e48\u505a\u4f1a\u7834\u574f\u53e5\u5b50\u7684\u7f8e\u89c2\u6027\u3002"),(0,l.kt)("p",null,"\u6b63\u786e\uff1a"),(0,l.kt)("blockquote",null,(0,l.kt)("p",{parentName:"blockquote"},"\u5fb7\u56fd\u961f\u7adf\u7136\u6218\u80dc\u4e86\u5df4\u897f\u961f\uff01"),(0,l.kt)("p",{parentName:"blockquote"},"\u5979\u7adf\u7136\u5bf9\u4f60\u8bf4\u300c\u55b5\u300d\uff1f\uff01")),(0,l.kt)("p",null,"\u9519\u8bef\uff1a"),(0,l.kt)("blockquote",null,(0,l.kt)("p",{parentName:"blockquote"},"\u5fb7\u56fd\u961f\u7adf\u7136\u6218\u80dc\u4e86\u5df4\u897f\u961f\uff01\uff01"),(0,l.kt)("p",{parentName:"blockquote"},"\u5fb7\u56fd\u961f\u7adf\u7136\u6218\u80dc\u4e86\u5df4\u897f\u961f\uff01\uff01\uff01\uff01\uff01\uff01\uff01\uff01"),(0,l.kt)("p",{parentName:"blockquote"},"\u5979\u7adf\u7136\u5bf9\u4f60\u8bf4\u300c\u55b5\u300d\uff1f\uff1f\uff01\uff01"),(0,l.kt)("p",{parentName:"blockquote"},"\u5979\u7adf\u7136\u5bf9\u4f60\u8bf4\u300c\u55b5\u300d\uff1f\uff01\uff1f\uff01\uff1f\uff1f\uff01\uff01")),(0,l.kt)("h3",{id:"\u5168\u89d2\u548c\u534a\u89d2"},"\u5168\u89d2\u548c\u534a\u89d2"),(0,l.kt)("p",null,"\u4e0d\u660e\u767d\u4ec0\u4e48\u662f\u5168\u89d2\uff08\u5168\u5f62\uff09\u4e0e\u534a\u89d2\uff08\u534a\u5f62\uff09\u7b26\u53f7\uff1f\u8bf7\u67e5\u770b\u7ef4\u57fa\u767e\u79d1\u6761\u76ee\u300e",(0,l.kt)("a",{parentName:"p",href:"https://zh.wikipedia.org/wiki/%E5%85%A8%E5%BD%A2%E5%92%8C%E5%8D%8A%E5%BD%A2"},"\u5168\u89d2\u548c\u534a\u89d2"),"\u300f\u3002"),(0,l.kt)("h4",{id:"\u4f7f\u7528\u5168\u89d2\u4e2d\u6587\u6807\u70b9"},"\u4f7f\u7528\u5168\u89d2\u4e2d\u6587\u6807\u70b9"),(0,l.kt)("p",null,"\u6b63\u786e\uff1a"),(0,l.kt)("blockquote",null,(0,l.kt)("p",{parentName:"blockquote"},"\u55e8\uff01\u4f60\u77e5\u9053\u561b\uff1f\u4eca\u5929\u524d\u53f0\u7684\u5c0f\u59b9\u8ddf\u6211\u8bf4\u300c\u55b5\u300d\u4e86\u54ce\uff01"),(0,l.kt)("p",{parentName:"blockquote"},"\u6838\u78c1\u5171\u632f\u6210\u50cf\uff08NMRI\uff09\u662f\u4ec0\u4e48\u539f\u7406\u90fd\u4e0d\u77e5\u9053\uff1fJFGI\uff01")),(0,l.kt)("p",null,"\u9519\u8bef\uff1a"),(0,l.kt)("blockquote",null,(0,l.kt)("p",{parentName:"blockquote"},'\u55e8! \u4f60\u77e5\u9053\u561b? \u4eca\u5929\u524d\u53f0\u7684\u5c0f\u59b9\u8ddf\u6211\u8bf4 "\u55b5" \u4e86\u54ce\uff01'),(0,l.kt)("p",{parentName:"blockquote"},'\u55e8!\u4f60\u77e5\u9053\u561b?\u4eca\u5929\u524d\u53f0\u7684\u5c0f\u59b9\u8ddf\u6211\u8bf4"\u55b5"\u4e86\u54ce\uff01'),(0,l.kt)("p",{parentName:"blockquote"},"\u6838\u78c1\u5171\u632f\u6210\u50cf (NMRI) \u662f\u4ec0\u4e48\u539f\u7406\u90fd\u4e0d\u77e5\u9053? JFGI!"),(0,l.kt)("p",{parentName:"blockquote"},"\u6838\u78c1\u5171\u632f\u6210\u50cf(NMRI)\u662f\u4ec0\u4e48\u539f\u7406\u90fd\u4e0d\u77e5\u9053?JFGI!")),(0,l.kt)("h4",{id:"\u6570\u5b57\u4f7f\u7528\u534a\u89d2\u5b57\u7b26"},"\u6570\u5b57\u4f7f\u7528\u534a\u89d2\u5b57\u7b26"),(0,l.kt)("p",null,"\u6b63\u786e\uff1a"),(0,l.kt)("blockquote",null,(0,l.kt)("p",{parentName:"blockquote"},"\u8fd9\u4e2a\u86cb\u7cd5\u53ea\u5356 1000 \u5143\u3002")),(0,l.kt)("p",null,"\u9519\u8bef\uff1a"),(0,l.kt)("blockquote",null,(0,l.kt)("p",{parentName:"blockquote"},"\u8fd9\u4e2a\u86cb\u7cd5\u53ea\u5356 \uff11\uff10\uff10\uff10 \u5143\u3002")),(0,l.kt)("p",null,"\u4f8b\u5916\uff1a\u5728\u8bbe\u8ba1\u7a3f\u3001\u5ba3\u4f20\u6d77\u62a5\u4e2d\u5982\u51fa\u73b0\u6781\u5c11\u91cf\u6570\u5b57\u7684\u60c5\u5f62\u65f6\uff0c\u4e3a\u65b9\u4fbf\u6587\u5b57\u5bf9\u9f50\uff0c\u662f\u53ef\u4ee5\u4f7f\u7528\u5168\u89d2\u6570\u5b57\u7684\u3002"),(0,l.kt)("h4",{id:"\u9047\u5230\u5b8c\u6574\u7684\u82f1\u6587\u6574\u53e5\u7279\u6b8a\u540d\u8bcd\u5176\u5185\u5bb9\u4f7f\u7528\u534a\u89d2\u6807\u70b9"},"\u9047\u5230\u5b8c\u6574\u7684\u82f1\u6587\u6574\u53e5\u3001\u7279\u6b8a\u540d\u8bcd\uff0c\u5176\u5185\u5bb9\u4f7f\u7528\u534a\u89d2\u6807\u70b9"),(0,l.kt)("p",null,"\u6b63\u786e\uff1a"),(0,l.kt)("blockquote",null,(0,l.kt)("p",{parentName:"blockquote"},"\u4e54\u5e03\u65af\u90a3\u53e5\u8bdd\u662f\u600e\u4e48\u8bf4\u7684\uff1f\u300cStay hungry, stay foolish.\u300d"),(0,l.kt)("p",{parentName:"blockquote"},"\u63a8\u8350\u4f60\u9605\u8bfb\u300aHackers & Painters: Big Ideas from the Computer Age\u300b\uff0c\u975e\u5e38\u7684\u6709\u8da3\u3002")),(0,l.kt)("p",null,"\u9519\u8bef\uff1a"),(0,l.kt)("blockquote",null,(0,l.kt)("p",{parentName:"blockquote"},"\u4e54\u5e03\u65af\u90a3\u53e5\u8bdd\u662f\u600e\u4e48\u8bf4\u7684\uff1f\u300cStay hungry\uff0cstay foolish\u3002\u300d"),(0,l.kt)("p",{parentName:"blockquote"},"\u63a8\u8350\u4f60\u9605\u8bfb\u300aHackers\uff06Painters\uff1aBig Ideas from the Computer Age\u300b\uff0c\u975e\u5e38\u7684\u6709\u8da3\u3002")),(0,l.kt)("h3",{id:"\u540d\u8bcd"},"\u540d\u8bcd"),(0,l.kt)("h4",{id:"\u4e13\u6709\u540d\u8bcd\u4f7f\u7528\u6b63\u786e\u7684\u5927\u5c0f\u5199"},"\u4e13\u6709\u540d\u8bcd\u4f7f\u7528\u6b63\u786e\u7684\u5927\u5c0f\u5199"),(0,l.kt)("p",null,"\u5927\u5c0f\u5199\u76f8\u5173\u7528\u6cd5\u539f\u5c5e\u4e8e\u82f1\u6587\u4e66\u5199\u8303\u7574\uff0c\u4e0d\u5c5e\u4e8e\u672c wiki \u8ba8\u8bba\u5185\u5bb9\uff0c\u5728\u8fd9\u91cc\u53ea\u5bf9\u90e8\u5206\u6613\u9519\u7528\u6cd5\u8fdb\u884c\u7b80\u8ff0\u3002"),(0,l.kt)("p",null,"\u6b63\u786e\uff1a"),(0,l.kt)("blockquote",null,(0,l.kt)("p",{parentName:"blockquote"},"\u4f7f\u7528 GitHub \u767b\u5f55"),(0,l.kt)("p",{parentName:"blockquote"},"\u6211\u4eec\u7684\u5ba2\u6237\u6709 GitHub\u3001Foursquare\u3001Microsoft Corporation\u3001Google\u3001Facebook, Inc.\u3002")),(0,l.kt)("p",null,"\u9519\u8bef\uff1a"),(0,l.kt)("blockquote",null,(0,l.kt)("p",{parentName:"blockquote"},"\u4f7f\u7528 github \u767b\u5f55"),(0,l.kt)("p",{parentName:"blockquote"},"\u4f7f\u7528 GITHUB \u767b\u5f55"),(0,l.kt)("p",{parentName:"blockquote"},"\u4f7f\u7528 Github \u767b\u5f55"),(0,l.kt)("p",{parentName:"blockquote"},"\u4f7f\u7528 gitHub \u767b\u5f55"),(0,l.kt)("p",{parentName:"blockquote"},"\u4f7f\u7528 g \uff72\u3093 \u0124\u04268 \u767b\u5f55"),(0,l.kt)("p",{parentName:"blockquote"},"\u6211\u4eec\u7684\u5ba2\u6237\u6709 github\u3001foursquare\u3001microsoft corporation\u3001google\u3001facebook, inc.\u3002"),(0,l.kt)("p",{parentName:"blockquote"},"\u6211\u4eec\u7684\u5ba2\u6237\u6709 GITHUB\u3001FOURSQUARE\u3001MICROSOFT CORPORATION\u3001GOOGLE\u3001FACEBOOK, INC.\u3002"),(0,l.kt)("p",{parentName:"blockquote"},"\u6211\u4eec\u7684\u5ba2\u6237\u6709 Github\u3001FourSquare\u3001MicroSoft Corporation\u3001Google\u3001FaceBook, Inc.\u3002"),(0,l.kt)("p",{parentName:"blockquote"},"\u6211\u4eec\u7684\u5ba2\u6237\u6709 gitHub\u3001fourSquare\u3001microSoft Corporation\u3001google\u3001faceBook, Inc.\u3002"),(0,l.kt)("p",{parentName:"blockquote"},"\u6211\u4eec\u7684\u5ba2\u6237\u6709 g \uff72\u3093 \u0124\u04268\u3001\uff77 ou\u042f\u01a7qu \uff91 \u0433\u0454\u3001\u0e53\u0e40\u03c2\u0433\u0e4f\u0e23\u0e4f\u0166t \u03c2\u0e4f\u0433\u05e7\u0e4f\u0433\u0e04t\u0e40\u0e4f\u0e20n\u3001900913\u3001\u01924\u1103\xeb\u0432\u0e4f\u0e4f\u043a, I\u041f\u1103.\u3002")),(0,l.kt)("p",null,"\u6ce8\u610f\uff1a\u5f53\u7f51\u9875\u4e2d\u9700\u8981\u914d\u5408\u6574\u4f53\u89c6\u89c9\u98ce\u683c\u800c\u51fa\u73b0\u5168\u90e8\u5927\u5199\uff0f\u5c0f\u5199\u7684\u60c5\u5f62\uff0cHTML \u4e2d\u8bf7\u4f7f\u7528\u6807\u6dee\u7684\u5927\u5c0f\u5199\u89c4\u8303\u8fdb\u884c\u4e66\u5199\uff1b\u5e76\u901a\u8fc7 ",(0,l.kt)("inlineCode",{parentName:"p"},"text-transform: uppercase;"),"\uff0f",(0,l.kt)("inlineCode",{parentName:"p"},"text-transform: lowercase;")," \u5bf9\u8868\u73b0\u5f62\u5f0f\u8fdb\u884c\u5b9a\u4e49\u3002"),(0,l.kt)("h4",{id:"\u4e0d\u8981\u4f7f\u7528\u4e0d\u5730\u9053\u7684\u7f29\u5199"},"\u4e0d\u8981\u4f7f\u7528\u4e0d\u5730\u9053\u7684\u7f29\u5199"),(0,l.kt)("p",null,"\u6b63\u786e\uff1a"),(0,l.kt)("blockquote",null,(0,l.kt)("p",{parentName:"blockquote"},"\u6211\u4eec\u9700\u8981\u4e00\u4f4d\u719f\u6089 TypeScript\u3001HTML5\uff0c\u81f3\u5c11\u7406\u89e3\u4e00\u79cd\u6846\u67b6\uff08\u5982 React\u3001Next.js\uff09\u7684\u524d\u7aef\u5f00\u53d1\u8005\u3002")),(0,l.kt)("p",null,"\u9519\u8bef\uff1a"),(0,l.kt)("blockquote",null,(0,l.kt)("p",{parentName:"blockquote"},"\u6211\u4eec\u9700\u8981\u4e00\u4f4d\u719f\u6089 Ts\u3001h5\uff0c\u81f3\u5c11\u7406\u89e3\u4e00\u79cd\u6846\u67b6\uff08\u5982 RJS\u3001nextjs\uff09\u7684 FED\u3002")),(0,l.kt)("h3",{id:"\u4e89\u8bae"},"\u4e89\u8bae"),(0,l.kt)("p",null,"\u4ee5\u4e0b\u7528\u6cd5\u7565\u5e26\u6709\u4e2a\u4eba\u8272\u5f69\uff0c\u5373\uff1a\u65e0\u8bba\u662f\u5426\u9075\u5faa\u4e0b\u8ff0\u89c4\u5219\uff0c\u4ece\u8bed\u6cd5\u7684\u89d2\u5ea6\u6765\u8bb2\u90fd\u662f",(0,l.kt)("strong",{parentName:"p"},"\u6b63\u786e"),"\u7684\u3002"),(0,l.kt)("h4",{id:"\u94fe\u63a5\u4e4b\u95f4\u589e\u52a0\u7a7a\u683c"},"\u94fe\u63a5\u4e4b\u95f4\u589e\u52a0\u7a7a\u683c"),(0,l.kt)("p",null,"\u7528\u6cd5\uff1a"),(0,l.kt)("blockquote",null,(0,l.kt)("p",{parentName:"blockquote"},"\u8bf7 ",(0,l.kt)("a",{parentName:"p",href:"#"},"\u63d0\u4ea4\u4e00\u4e2a issue")," \u5e76\u5206\u914d\u7ed9\u76f8\u5173\u540c\u4e8b\u3002"),(0,l.kt)("p",{parentName:"blockquote"},"\u8bbf\u95ee\u6211\u4eec\u7f51\u7ad9\u7684\u6700\u65b0\u52a8\u6001\uff0c\u8bf7 ",(0,l.kt)("a",{parentName:"p",href:"#"},"\u70b9\u51fb\u8fd9\u91cc")," \u8fdb\u884c\u8ba2\u9605\uff01")),(0,l.kt)("p",null,"\u5bf9\u6bd4\u7528\u6cd5\uff1a"),(0,l.kt)("blockquote",null,(0,l.kt)("p",{parentName:"blockquote"},"\u8bf7",(0,l.kt)("a",{parentName:"p",href:"#"},"\u63d0\u4ea4\u4e00\u4e2a issue"),"\u5e76\u5206\u914d\u7ed9\u76f8\u5173\u540c\u4e8b\u3002"),(0,l.kt)("p",{parentName:"blockquote"},"\u8bbf\u95ee\u6211\u4eec\u7f51\u7ad9\u7684\u6700\u65b0\u52a8\u6001\uff0c\u8bf7",(0,l.kt)("a",{parentName:"p",href:"#"},"\u70b9\u51fb\u8fd9\u91cc"),"\u8fdb\u884c\u8ba2\u9605\uff01")),(0,l.kt)("h4",{id:"\u7b80\u4f53\u4e2d\u6587\u4f7f\u7528\u76f4\u89d2\u5f15\u53f7"},"\u7b80\u4f53\u4e2d\u6587\u4f7f\u7528\u76f4\u89d2\u5f15\u53f7"),(0,l.kt)("p",null,"\u7528\u6cd5\uff1a"),(0,l.kt)("blockquote",null,(0,l.kt)("p",{parentName:"blockquote"},"\u300c\u8001\u5e08\uff0c\u300e\u6709\u6761\u4e0d\u7d0a\u300f\u7684\u300e\u7d0a\u300f\u662f\u4ec0\u4e48\u610f\u601d\uff1f\u300d")),(0,l.kt)("p",null,"\u5bf9\u6bd4\u7528\u6cd5\uff1a"),(0,l.kt)("blockquote",null,(0,l.kt)("p",{parentName:"blockquote"},"\u201c\u8001\u5e08\uff0c\u2018\u6709\u6761\u4e0d\u7d0a\u2019\u7684\u2018\u7d0a\u2019\u662f\u4ec0\u4e48\u610f\u601d\uff1f\u201d")),(0,l.kt)("h3",{id:"\u5de5\u5177"},"\u5de5\u5177"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:null},"\u4ed3\u5e93"),(0,l.kt)("th",{parentName:"tr",align:null},"\u8bed\u8a00"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("a",{parentName:"td",href:"https://github.com/vinta/paranoid-auto-spacing"},"vinta/paranoid-auto-spacing")),(0,l.kt)("td",{parentName:"tr",align:null},"JavaScript")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("a",{parentName:"td",href:"https://github.com/serkodev/vue-pangu"},"serkodev/vue-pangu")),(0,l.kt)("td",{parentName:"tr",align:null},"Vue.js (Web Converter)")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("a",{parentName:"td",href:"https://github.com/huei90/pangu.node"},"huei90/pangu.node")),(0,l.kt)("td",{parentName:"tr",align:null},"Node.js")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("a",{parentName:"td",href:"https://github.com/huacnlee/auto-correct"},"huacnlee/auto-correct")),(0,l.kt)("td",{parentName:"tr",align:null},"Ruby")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("a",{parentName:"td",href:"https://github.com/huacnlee/autocorrect"},"huacnlee/autocorrect")),(0,l.kt)("td",{parentName:"tr",align:null},"Rust, WASM, CLI")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("a",{parentName:"td",href:"https://github.com/huacnlee/go-auto-correct"},"huacnlee/go-auto-correct")),(0,l.kt)("td",{parentName:"tr",align:null},"Go")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("a",{parentName:"td",href:"https://github.com/sparanoid/space-lover"},"sparanoid/space-lover")),(0,l.kt)("td",{parentName:"tr",align:null},"PHP (WordPress)")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("a",{parentName:"td",href:"https://github.com/NauxLiu/auto-correct"},"nauxliu/auto-correct")),(0,l.kt)("td",{parentName:"tr",align:null},"PHP")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("a",{parentName:"td",href:"https://github.com/jxlwqq/chinese-typesetting"},"jxlwqq/chinese-typesetting")),(0,l.kt)("td",{parentName:"tr",align:null},"PHP")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("a",{parentName:"td",href:"https://github.com/hotoo/pangu.vim"},"hotoo/pangu.vim")),(0,l.kt)("td",{parentName:"tr",align:null},"Vim")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("a",{parentName:"td",href:"https://github.com/sparanoid/grunt-auto-spacing"},"sparanoid/grunt-auto-spacing")),(0,l.kt)("td",{parentName:"tr",align:null},"Node.js (Grunt)")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("a",{parentName:"td",href:"https://github.com/hjiang/scripts/blob/master/add-space-between-latin-and-cjk"},"hjiang/scripts/add-space-between-latin-and-cjk")),(0,l.kt)("td",{parentName:"tr",align:null},"Python")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("a",{parentName:"td",href:"https://github.com/hustcc/hint"},"hustcc/hint")),(0,l.kt)("td",{parentName:"tr",align:null},"Python")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("a",{parentName:"td",href:"https://github.com/studygolang/autocorrect"},"studygolang/autocorrect")),(0,l.kt)("td",{parentName:"tr",align:null},"Go")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("a",{parentName:"td",href:"https://github.com/n0vad3v/Tekorrect"},"n0vad3v/Tekorret")),(0,l.kt)("td",{parentName:"tr",align:null},"Python")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("a",{parentName:"td",href:"https://marketplace.visualstudio.com/items?itemName=huacnlee.auto-correct"},"VS Code - huacnlee.auto-correct")),(0,l.kt)("td",{parentName:"tr",align:null},"VS Code Extension")))),(0,l.kt)("h3",{id:"\u8c01\u5728\u8fd9\u6837\u505a"},"\u8c01\u5728\u8fd9\u6837\u505a\uff1f"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:null},"\u7f51\u7ad9"),(0,l.kt)("th",{parentName:"tr",align:null},"\u6587\u6848"),(0,l.kt)("th",{parentName:"tr",align:null},"UGC"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("a",{parentName:"td",href:"https://www.apple.com/cn/"},"Apple \u4e2d\u56fd")),(0,l.kt)("td",{parentName:"tr",align:null},"\u662f"),(0,l.kt)("td",{parentName:"tr",align:null},"N/A")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("a",{parentName:"td",href:"https://www.apple.com/hk/"},"Apple \u9999\u6e2f")),(0,l.kt)("td",{parentName:"tr",align:null},"\u662f"),(0,l.kt)("td",{parentName:"tr",align:null},"N/A")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("a",{parentName:"td",href:"https://www.apple.com/tw/"},"Apple \u53f0\u6e7e")),(0,l.kt)("td",{parentName:"tr",align:null},"\u662f"),(0,l.kt)("td",{parentName:"tr",align:null},"N/A")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("a",{parentName:"td",href:"https://www.microsoft.com/zh-cn/"},"Microsoft \u4e2d\u56fd")),(0,l.kt)("td",{parentName:"tr",align:null},"\u662f"),(0,l.kt)("td",{parentName:"tr",align:null},"N/A")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("a",{parentName:"td",href:"https://www.microsoft.com/zh-hk/"},"Microsoft \u9999\u6e2f")),(0,l.kt)("td",{parentName:"tr",align:null},"\u662f"),(0,l.kt)("td",{parentName:"tr",align:null},"N/A")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("a",{parentName:"td",href:"https://www.microsoft.com/zh-tw/"},"Microsoft \u53f0\u6e7e")),(0,l.kt)("td",{parentName:"tr",align:null},"\u662f"),(0,l.kt)("td",{parentName:"tr",align:null},"N/A")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("a",{parentName:"td",href:"https://leancloud.cn/"},"LeanCloud")),(0,l.kt)("td",{parentName:"tr",align:null},"\u662f"),(0,l.kt)("td",{parentName:"tr",align:null},"N/A")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("a",{parentName:"td",href:"https://www.v2ex.com/"},"V2EX")),(0,l.kt)("td",{parentName:"tr",align:null},"\u662f"),(0,l.kt)("td",{parentName:"tr",align:null},"\u662f")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("a",{parentName:"td",href:"https://apple4us.com/"},"Apple4us")),(0,l.kt)("td",{parentName:"tr",align:null},"\u662f"),(0,l.kt)("td",{parentName:"tr",align:null},"N/A")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("a",{parentName:"td",href:"https://ruby-china.org/"},"Ruby China")),(0,l.kt)("td",{parentName:"tr",align:null},"\u662f"),(0,l.kt)("td",{parentName:"tr",align:null},"\u662f")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("a",{parentName:"td",href:"https://sspai.com/"},"\u5c11\u6570\u6d3e")),(0,l.kt)("td",{parentName:"tr",align:null},"\u662f"),(0,l.kt)("td",{parentName:"tr",align:null},"N/A")))),(0,l.kt)("h3",{id:"\u53c2\u8003\u6587\u732e"},"\u53c2\u8003\u6587\u732e"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"https://www.thoughtco.com/guidelines-for-using-capital-letters-1691724"},"Guidelines for Using Capital Letters - ThoughtCo.")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"https://en.wikipedia.org/wiki/Letter_case"},"Letter case - Wikipedia")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"https://en.oxforddictionaries.com/grammar/punctuation"},"Punctuation - Oxford Dictionaries")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"https://owl.english.purdue.edu/owl/section/1/6/"},"Punctuation - The Purdue OWL")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"https://www.wikihow.com/Use-English-Punctuation-Correctly"},"How to Use English Punctuation Correctly - wikiHow")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"https://zh.opensuse.org/index.php?title=Help:%E6%A0%BC%E5%BC%8F"},"\u683c\u5f0f - openSUSE")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"https://zh.wikipedia.org/wiki/%E5%85%A8%E5%BD%A2%E5%92%8C%E5%8D%8A%E5%BD%A2"},"\u5168\u5f62\u548c\u534a\u5f62 - \u7ef4\u57fa\u767e\u79d1")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"https://zh.wikipedia.org/wiki/%E5%BC%95%E8%99%9F"},"\u5f15\u53f7 - \u7ef4\u57fa\u767e\u79d1")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"https://zh.wikipedia.org/wiki/%E7%96%91%E5%95%8F%E9%A9%9A%E5%98%86%E8%99%9F"},"\u7591\u95ee\u60ca\u53f9\u53f7 - \u7ef4\u57fa\u767e\u79d1"))),(0,l.kt)("h3",{id:"forks"},"Forks"),(0,l.kt)("p",null,"\u884d\u751f\u9879\u76ee\u7684\u7528\u6cd5\u53ef\u80fd\u4e0e\u672c\u9879\u76ee\u5b58\u5728\u5dee\u5f02\u3002"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"https://github.com/mzlogin/chinese-copywriting-guidelines"},"mzlogin/chinese-copywriting-guidelines"))))}c.isMDXComponent=!0}}]);