/*
 * @Author: CPS holy.dandelion@139.com
 * @Date: 2023-04-04 17:09:26
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2024-03-05 15:56:48
 * @FilePath: \cps-blog-test\static\cps.js
 * @Description: 用来修复docs中，所有采用了本地服务器图片的链接指定的cdn
 */

const SEARCH_HOST = "localhost:45462";
const CND_HOST = "qiniu.capsion.top/blog";
const CDN_URL_OBJ = new URL(`http://${CND_HOST}`);
const FIXED_LIST = [];

function getLastPathByUrl(urlStr) {
  try {
    const index = urlStr.lastIndexOf("/");
    return urlStr.substring(index + 1, urlStr.length);
  } catch (err) {
    return "";
  }
}

/**
 * @description: 检查当前的请求的url与源地址是否匹配
 * @param {Element} imgElement
 * @return {Boolean}
 */
function isHandled(inputUrlStr) {
  try {
    // const isSame = new URL(inputUrlStr).host === location.host;
    const isFixed = FIXED_LIST.indexOf(inputUrlStr) !== -1;

    // return isSame || isFixed;
    return isFixed;
  } catch (error) {
    console.log("isHandled: error", error);
    return false;
  }
}

/**
 * @description: 替换url中的host为指定的host
 * @param {URL} imgSrc img标签的src内容，必须是url格式
 * @param {string} searchHost 需要替换的url host
 * @return {URL}
 */
function fixLocalHostToCDN(inputUrlStr, searchHost = SEARCH_HOST, newHost = CND_HOST) {
  try {
    // 当前host相同，可能是网络原因加载失败，此处进行忽略或者替换成通用cdn再尝试
    // if (location.host == searchHost) return "";
    // 如果没有指定替换新的host，则替换为当前源
    if (inputUrlStr.indexOf(searchHost) > -1) {
      // 如果没有指定替换新的host，则替换为当前源
      return inputUrlStr.replace(searchHost, newHost);
    } else {
      return inputUrlStr.replace(location.host, newHost);
    }
  } catch (error) {
    console.log("图片替换失败123：", inputHost);
    console.log({ error });
    return "";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  console.log("cps-scripts has loaded v0.04");

  document.addEventListener(
    "error",

    /* 捕获加载失败的图片标签，判断如果host不是指定的，则进行修正 */
    (e) => {
      // 仅修复<img/>标签
      if (e.target.tagName.toLowerCase() === "img") {
        const img = e.target;

        if (isHandled(img.src)) return;

        // 判断是否cdn
        const URL_OBJ = new URL(img.src);
        URL_OBJ.port = "";
        let newUrl = "";

        if (URL_OBJ.host == SEARCH_HOST) {
          URL_OBJ.host = CND_HOST;

          img.src = URL_OBJ.href;

          console.log("尝试修复1", img.src);
        } else if (URL_OBJ.host != CDN_URL_OBJ.host) {
          const lastPath = getLastPathByUrl(URL_OBJ.href);
          URL_OBJ.pathname = `${CDN_URL_OBJ.pathname}/${lastPath}`;
          URL_OBJ.host = CDN_URL_OBJ.host;
          img.src = URL_OBJ.href;

          console.log("尝试修复2", img.src);
        } else if (URL_OBJ.protocol == "https:") {
          URL_OBJ.protocol = `http:`;
          img.src = URL_OBJ.href;

          FIXED_LIST.push(URL_OBJ.href);
          console.log("尝试修复3", img.src);
        }
      }
    },
    true
  );
});
