/*
 * @Author: Capsion 373704015@qq.com
 * @Date: 2025-11-06 20:46:02
 * @LastEditors: Capsion 373704015@qq.com
 * @LastEditTime: 2025-11-06 21:23:30
 * @FilePath: \cps-blog2025\demo\vite.config.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@src": path.resolve(__dirname, "./src"),
            "@site": path.resolve(__dirname, "."),
        },
    },
    server: {
        hmr: {
            timeout: 30000, // 设置连接超时时间（单位：毫秒）
            overlay: false, // 禁用错误覆盖层
        },
    },
});
