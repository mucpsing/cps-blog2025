/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2025-05-08 10:30:31
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2025-05-08 15:49:21
 * @FilePath: \gsap-lenis-learn\scripts\svgChange.ts
 * @Description: 我想批量修改当前的svg标签
 */
import fs from "fs/promises";
import path from "path";
import { load } from "cheerio";

// ================ 精简类型定义 ================
type AttributeHandler<T = string> = T | ((prev: string) => T | null);

interface ElementModification {
  selector: string;
  attributes?: Record<string, AttributeHandler>;
  removeElements?: string[]; // 更直观的删除操作定义
}

// ================ 核心处理器 ================
async function processSVGFiles(dir: string, modifications: ElementModification[], outDir?: string) {
  // 读取并处理文件
  const processFile = async (file: string) => {
    const content = await fs.readFile(path.join(dir, file), "utf8");
    const $ = load(content, { xmlMode: true });

    modifications.forEach(({ selector, attributes, removeElements }) => {
      // 属性处理
      $(selector).each((_, el) => {
        const $el = $(el);
        Object.entries(attributes || {}).forEach(([attr, handler]) => {
          const prev = $el.attr(attr);
          const next = typeof handler === "function" ? handler(prev || "") : handler;

          next === null ? $el.removeAttr(attr) : $el.attr(attr, next);
        });
      });

      // 元素删除
      removeElements?.forEach((selector) => $(selector).remove());
    });

    const outputPath = outDir ? path.join(outDir, file) : path.join(dir, file);
    await fs.writeFile(outputPath, $.xml());
  };

  // 批量处理
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".svg"));
  if (outDir) await fs.mkdir(outDir, { recursive: true });
  return Promise.all(files.map(processFile));
}

// ================ 使用示例 ================
processSVGFiles(
  "./public/icons/skill-icons",
  [
    {
      selector: "rect",
      attributes: {
        fill: (prev) => (prev === "#15191C" ? "#fff" : prev),
      },
    },
    {
      selector: "svg",
      attributes: {
        fill: "#fff",
        "data-test": null,
      },
      removeElements: ["style"],
    },
  ],
  "./dist/svg"
);
