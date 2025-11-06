/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2025-05-06 08:50:02
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2025-11-06 16:56:59
 * @FilePath: \cps-blog\demo\src\store\icons.ts
 * @Description: 鼠标滑动生成icon组件的数据管理组件
 */
const svgFiles = import.meta.glob("@site/public/icons/skill-icons/*.svg", { eager: true, as: "url" });

/**
 * @description: 原地打乱数组的顺序，实现每次随机
 */
function shuffleArray<T>(array: T[]): T[] {
  // 注意这里用 let m = array.length 而不是 const
  for (let m = array.length; m > 0; m--) {
    // 生成 [0, m) 范围内的随机索引
    const randomIndex = Math.floor(Math.random() * m);
    // ES6 解构赋值交换元素
    [array[m - 1], array[randomIndex]] = [array[randomIndex], array[m - 1]];
  }
  return array;
}

export const skillIcons = shuffleArray(
  Object.keys(svgFiles).map((path) => {
    return path.split("/").pop() as string;
  })
);
