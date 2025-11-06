/*
 * @Author: CPS holy.dandelion@139.com
 * @Date: 2023-04-04 17:09:26
 * @LastEditors: Capsion 373704015@qq.com
 * @LastEditTime: 2025-02-26 00:05:49
 * @FilePath: \cps-blog-test\static\cps.js
 * @Description: 完整版CDN修复脚本（支持协议自动切换+动态配置）
 */

// 配置中心 ================================================
const CONFIG = {
  // 动态CDN配置
  cdnRules: [
    {
      // 本地开发环境（禁用）
      hostMatcher: (host) => host.includes("localhost"),
      enable: false,
    },
    {
      // 主站生产环境
      hostMatcher: (host) => host.includes("capsion.top"),
      cdnHost: "qiniu.capsion.top",
      cdnPath: "/blog",
      forceProtocol: "http", // 强制指定协议
    },
    {
      // GitHub Pages环境
      hostMatcher: (host) => host.includes("github.io"),
      cdnHost: "capsion-images.github.com",
      cdnPath: "/images",
      forceProtocol: null, // 跟随页面协议
    },
  ],

  // 通用配置
  localDevHost: "localhost:45462",
  fixHttps: true,
};

// 运行时状态 ==============================================
let currentConfig = null;
const FIXED_URLS = new Set();

// 初始化配置 ==============================================
(function initConfig() {
  try {
    // 查找匹配的配置
    currentConfig = CONFIG.cdnRules.find((rule) => rule.hostMatcher(location.host)) || {};

    // 禁用检查
    if (currentConfig.enable === false) return console.log("[CDN] 当前环境禁用优化");

    // 协议处理策略
    currentConfig.finalProtocol = currentConfig.forceProtocol ? `${currentConfig.forceProtocol}:` : location.protocol;

    console.log(`[CDN] 生效配置：`, currentConfig);
  } catch (e) {
    console.error("[CDN] 配置初始化失败", e);
  }
})();

// 核心工具函数 ============================================
const cdnUtils = {
  /**​ 生成CDN地址 */
  generateUrl(originalUrl) {
    try {
      const url = new URL(originalUrl);

      // 本地服务器地址处理
      if (url.host === CONFIG.localDevHost) return this._convertLocalUrl(url);

      // 第三方资源处理
      if (url.host !== currentConfig.cdnHost) return this._convertThirdPartyUrl(url);

      // 协议修复
      if (CONFIG.fixHttps && url.protocol !== currentConfig.finalProtocol) url.protocol = currentConfig.finalProtocol;

      return url.href;
    } catch (error) {
      console.error("[CDN] 地址转换失败", error);
      return originalUrl;
    }
  },

  /**​ 转换本地地址 */
  _convertLocalUrl(url) {
    url.host = currentConfig.cdnHost;
    url.pathname = `${currentConfig.cdnPath}${url.pathname}`;
    url.protocol = currentConfig.finalProtocol;
    return url.href;
  },

  /**​ 转换第三方资源 */
  _convertThirdPartyUrl(url) {
    const filename = url.pathname.split("/").pop();
    return new URL(`${currentConfig.finalProtocol}//${currentConfig.cdnHost}${currentConfig.cdnPath}/${filename}`).href;
  },
};

// 事件处理器 ==============================================
window.addEventListener("DOMContentLoaded", () => {
  if (!currentConfig || currentConfig.enable === false) return;
  console.log("cps-scripts has loaded v0.06");

  document.addEventListener(
    "error",
    function imgErrorHandler(e) {
      const img = e.target;
      if (img.tagName.toLowerCase() !== "img" || FIXED_URLS.has(img.src)) return;

      try {
        const newSrc = cdnUtils.generateUrl(img.src);
        if (newSrc !== img.src) {
          img.src = newSrc;
          FIXED_URLS.add(img.src);
          console.log(`[CDN] 优化完成：${newSrc}`);
        }
      } catch (error) {
        console.error("[CDN] 图片处理异常", error);
        FIXED_URLS.add(img.src);
      }
    },
    true
  );
});
