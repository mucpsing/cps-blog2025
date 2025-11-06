/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2024-02-21 09:15:00
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2025-04-25 16:50:29
 * @FilePath: \cps-blog-docusaurus-v3\tailwind.config.js
 * @Description: tailwind配置
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: {
        "1k": "1920px", // 2K 分辨率（2560x1440）
        "2k": "2560px", // 2K 分辨率（2560x1440）
        "4k": "3840px", // 4K 分辨率（3840x2160）
      },
    },
  },
  plugins: [],
};
