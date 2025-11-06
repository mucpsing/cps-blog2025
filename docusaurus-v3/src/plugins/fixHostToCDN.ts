/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2024-02-22 10:12:08
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2024-02-22 15:03:13
 * @FilePath: \cps-blog-docusaurus-v3\src\plugins\fixHostToCDN.ts
 * @Description: 尝试使用插件形式修复图片错误，暂时失败
 */
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";

export default function (context, options?: any) {
  return {
    name: "my-custom-plugin",
    contentPath: "myContent",
    async loadContent() {
      //   console.log({ context, options });
      //   console.log("my-custom-plugin");
      if (ExecutionEnvironment.canUseDOM) {
        // As soon as the site loads in the browser, register a global event listener
        window.addEventListener("keydown", (e) => {
          if (e.code === "Period") {
            location.assign(location.href.replace(".com", ".dev"));
          }
        });
      }
    },
  };

  //   /**
  //    * @description: 替换url中的host为指定的host
  //    * @param {URL} inputHost img标签的src内容，必须是url格式
  //    * @param {string} searchHost 需要替换的url host
  //    * @return {URL}
  //    */
  //   function fixLocalHostToCDN(inputHost: string, searchHost = SEARCH_HOST, newHost = CND_HOST) {
  //     try {
  //       // 当前host相同，可能是网络原因加载失败，此处进行忽略或者替换成通用cdn再尝试
  //       if (location.host == searchHost) return "";

  //       if (inputHost.indexOf(searchHost) > -1) {
  //         // 如果没有指定替换新的host，则替换为当前源
  //         if (newHost) {
  //           return inputHost.replace(searchHost, newHost);
  //         } else {
  //           return inputHost.replace(searchHost, location.host);
  //         }
  //       }
  //     } catch (error) {
  //       console.log("图片替换失败123：", inputHost);
  //       console.log({ error });
  //       return "";
  //     }
  //   }

  //   /**
  //    * @description: 检查当前的请求的url与源地址是否匹配
  //    * @param {Element} imgElement
  //    * @return {Boolean}
  //    */
  //   function isSameDomain(inputUrlStr: string) {
  //     try {
  //       return new URL(inputUrlStr).host === location.host;
  //     } catch (error) {
  //       console.log("isSameDomain: error", error);
  //       return false;
  //     }
  //   }

  //   return {
  //     name: "fixHostToCDN-plugin",
  //     contentPath: "myContent",
  //     async loadContent() {
  //       const SEARCH_HOST = "localhost:45462";
  //       const CND_HOST = "qiniu.capsion.top/blog";

  //       window.addEventListener("DOMContentLoaded", () => {
  //         console.log("cps-scripts has loaded");
  //         document.addEventListener(
  //           "error",

  //           /* 捕获加载失败的图片标签，判断如果host不是指定的，则进行修正 */
  //           (e) => {
  //             const elem = e.target as EventTarget & { src: string; tagName: string };

  //             console.log("cps-beforeWindowLoad error");

  //             if (elem.tagName.toLowerCase() === "img") {
  //               if (isSameDomain(elem.src)) return;

  //               const newSrc = fixLocalHostToCDN(elem.src, SEARCH_HOST, CND_HOST);

  //               // 这里有可能触发无限重新赋值同一个无法加载url的死循环
  //               if (newSrc && elem.src != newSrc) {
  //                 console.log("尝试替换cdn图片: ", newSrc);
  //                 elem.src = newSrc;
  //               }
  //             }
  //           },
  //           true
  //         );
  //       });
  //     },
  //   };
}
