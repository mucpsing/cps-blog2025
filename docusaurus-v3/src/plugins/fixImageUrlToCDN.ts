// plugins/cdn-replacer/src/index.ts
import path from "path";
import fs from "fs-extra";
import type { LoadContext, Plugin } from "@docusaurus/types";

interface ReplacementRule {
  search: string;
  replace: string;
}

interface PluginOptions {
  replacements: ReplacementRule[];
}

export default function pluginCdnReplacer(context: LoadContext, options: PluginOptions): Plugin<void> {
  // 参数验证
  if (!options?.replacements?.length) {
    throw new Error("必须提供至少一个替换规则");
  }

  return {
    name: "cdn-replacer-plugin",

    async postBuild(props) {
      console.log({ props });

      if (process.env.NODE_ENV !== "production") return;

      // 递归处理所有 HTML 文件
      //   const processFile = async (filePath: string) => {
      //     try {
      //       let content = await fs.readFile(filePath, "utf8");
      //       let modified = false;

      //       // 执行所有替换规则
      //       for (const rule of options.replacements) {
      //         if (content.includes(rule.search)) {
      //           content = content.split(rule.search).join(rule.replace);
      //           modified = true;
      //         }
      //       }

      //       if (modified) {
      //         await fs.writeFile(filePath, content);
      //         console.log(`Updated: ${path.relative(context.siteDir, filePath)}`);
      //       }
      //     } catch (error) {
      //       console.error(`Error processing ${filePath}:`, error);
      //     }
      //   };

      //   // 递归遍历目录
      //   const walk = async (dirPath: string) => {
      //     const entries = await fs.readdir(dirPath, { withFileTypes: true });

      //     await Promise.all(
      //       entries.map(async (entry) => {
      //         const fullPath = path.join(dirPath, entry.name);

      //         if (entry.isDirectory()) {
      //           await walk(fullPath);
      //         } else if (entry.isFile() && path.extname(entry.name) === ".html") {
      //           await processFile(fullPath);
      //         }
      //       })
      //     );
      //   };

      //   await walk(props.outDir);
    },
  };
}
