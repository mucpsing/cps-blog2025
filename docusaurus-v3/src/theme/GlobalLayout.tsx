/*
 * @Author: Capsion 373704015@qq.com
 * @Date: 2025-02-05 23:21:47
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2025-02-20 15:08:02
 * @FilePath: \cps-blog-docusaurus-v3\src\theme\GlobalLayout.tsx
 * @Description: 替换原始的Layout，这里注入全局状态，让所有页面都可以共享
 */
// src/theme/GlobalLayout.tsx
import React, { ReactNode, useEffect } from "react";

import Layout from "@theme/Layout";
import { useGlobalStore } from "@site/src/store";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";

const GlobalLayout: React.FC<{ children: ReactNode }> = (props) => {
  // 从 Zustand store 中获取当前窗口的宽度和高度
  const { setSize, setIsMobile, setScreenSize } = useGlobalStore();

  // 使用 useEffect 来监听 window 的 resize 事件
  useEffect(() => {
    setIsMobile();

    const handleWindowResize = () => {
      // 更新屏幕宽和高到store
      setSize();

      // 更新屏幕尺寸为： "sm" | "md" | "lg" | "xl"
      setScreenSize();
    };

    // 添加 resize 事件监听器
    if (ExecutionEnvironment.canUseDOM) {
      window.addEventListener("resize", handleWindowResize);
    }

    // 清理副作用：组件卸载时移除事件监听
    return () => {
      if (ExecutionEnvironment.canUseDOM) window.removeEventListener("resize", handleWindowResize);
    };
  }, [setSize, setScreenSize]); // 只在 setSize 改变时重新绑定事件
  return <Layout {...props} />;
};

export default GlobalLayout;
