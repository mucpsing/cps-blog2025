/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2025-05-07 09:36:40
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2025-05-09 10:35:42
 * @FilePath: \gsap-lenis-learn\src\store\globalContext.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createContext, useContext } from "react";
import { DEFAULT_MAIN_COLOR, DEFAULT_SUB_COLOR } from "./config";

export type pageStepType = "loadding" | "start";

export type GlobalContextType = {
  colorIndex: number;
  mainColor: string;
  subColor: string;

  pageStep: pageStepType;

  animationStep: number;

  /**
   * @description: 注册组件
   */
  register: (msgID: string) => any;

  /**
   * @description: 报告组件已经完成当前阶段动画
   */
  reportCompletion: (msgID: string) => any;
};

// 全局状态，用来记录各个子组件的动画状态
export const GlobalContext = createContext<GlobalContextType>({
  colorIndex: 0,
  mainColor: DEFAULT_MAIN_COLOR[0],
  subColor: DEFAULT_SUB_COLOR[0],

  pageStep: "loadding",

  // -1 准备阶段，这个时段是将所有组件需要触发的位置使用set进行初始化
  // 0 所有组件通过reportCompletion()通知
  animationStep: -1,
  register: () => () => {},
  reportCompletion: () => {},
});

// 创建自定义Hook（可选但推荐）
export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("必须在AnimationProvider内使用");
  }
  return context;
};
