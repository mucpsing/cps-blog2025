/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2025-11-03 08:30:11
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2025-11-03 09:05:26
 * @FilePath: \cps-blog\fumadocs-v1\next.config.mjs
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  output: "export", // 导出静态文件
  reactStrictMode: true,
};

export default withMDX(config);
