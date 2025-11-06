// 文件：src/plugins/disable-svgo-cleanup-ids.js
export default function disableSvgoCleanupIds() {
  console.log("disableSvgoCleanupIds:1: ");
  return {
    name: "custom-webpack-plugin",
    configureWebpack(config, isServer, utils) {
      const { getJSLoader } = utils;
      console.log("disableSvgoCleanupIds:2: ", utils);
      console.log("disableSvgoCleanupIds:3: ", getJSLoader);

      // 查找 SVG 处理规则
      //   const svgRule = config.module.rules.find((rule) => rule.test && rule.test.test(".svg"));

      //   if (svgRule && svgRule.oneOf) {
      //     // 找到 @svgr/webpack 加载器
      //     const svgrRule = svgRule.oneOf.find((rule) => rule.use && rule.use.some((u) => u.loader?.includes("@svgr/webpack")));

      //     if (svgrRule) {
      //       const svgrLoader = svgrRule.use.find((u) => u.loader?.includes("@svgr/webpack"));

      //       if (svgrLoader?.options) {
      //         // 确保存在 svgoConfig
      //         svgrLoader.options.svgoConfig = svgrLoader.options.svgoConfig || {};
      //         svgrLoader.options.svgoConfig.plugins = svgrLoader.options.svgoConfig.plugins || [];

      //         // 检查是否已存在 cleanupIds 插件
      //         const existingPluginIndex = svgrLoader.options.svgoConfig.plugins.findIndex(
      //           (plugin) => (typeof plugin === "string" && plugin === "cleanupIds") || plugin?.name === "cleanupIds"
      //         );

      //         // 更新或添加插件配置
      //         if (existingPluginIndex > -1) {
      //           // 更新现有配置
      //           svgrLoader.options.svgoConfig.plugins[existingPluginIndex] = {
      //             name: "cleanupIds",
      //             params: { minify: false },
      //           };
      //         } else {
      //           // 添加新配置
      //           svgrLoader.options.svgoConfig.plugins.push({
      //             name: "cleanupIds",
      //             params: { minify: false },
      //           });
      //         }
      //       }
      //     }
      //   }

      return config;
    },
  };
}

export function prefixSvgIdsPlugin() {
  return {
    name: "prefix-svg-ids",
    configureWebpack(config) {
      const svgRule = config.module.rules.find((rule) => rule.test?.source === "\\.svg$");
      if (svgRule) {
        const {
          oneOf: [
            {
              use: [
                {
                  options: { svgoConfig },
                },
              ],
            },
          ],
        } = svgRule;
        svgoConfig.plugins.push("prefixIds");
      }
    },
  };
}

export function svgFix() {
  console.log("::svgFix 1::");
  return {
    name: "svg-fix",
    configureWebpack(config) {
      console.log("::svgFix 2::", config);
      const svgRuleIndex = config.module.rules.findIndex((r) => r.test.test("*.svg"));
      const svgrConfigIndex = config.module.rules[svgRuleIndex].oneOf.findIndex((r) => {
        if (!Array.isArray(r.use) || r.use.length === 0) return false;
        return r.use[0].loader.indexOf("@svgr/webpack") !== -1;
      });
      if (svgRuleIndex === -1 || svgrConfigIndex === -1) return;

      config.module.rules[svgRuleIndex].oneOf[svgrConfigIndex].use[0].options.svgoConfig.plugins[0].params.overrides.cleanupIDs = false;
    },
  };
}
