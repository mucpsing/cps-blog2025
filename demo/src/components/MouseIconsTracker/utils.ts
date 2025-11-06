/*
 * @Author: Capsion 373704015@qq.com
 * @Date: 2025-03-24 21:01:28
 * @LastEditors: Capsion 373704015@qq.com
 * @LastEditTime: 2025-03-24 21:20:12
 * @FilePath: \gsap-lenis-learn\src\components\MouseTracker\utils.ts
 * @Description: 这是这个组件专用的工具类函数，一些独立的工具函数
 */
const DIRECTIONS = ["right", "rightTop", "top", "leftTop", "left", "leftBottom", "bottom", "rightBottom"] as const;

export type directionT = (typeof DIRECTIONS)[number];

/**
 * @description: 在元素生成时添加一个滞后偏移量，使元素在生成时不会立即出现在屏幕上
 * @param {string} direction
 */
export const calculateOffset = (direction: directionT) => {
  const baseOffset = 80;
  const baseRotate = 140;
  const baseRotate2 = -500;

  // 查找表：定义各方向对应的 x, y 偏移倍数和旋转符号
  // 部分方向偏移后效果不好，这里注销掉
  const mapping: { [key: string]: { x: number; y: number; r: number } } = {
    left: { x: -1, y: 0, r: -1 },
    // leftBottom: { x: -1, y: 1, r: -1 },
    leftTop: { x: -1, y: -1, r: -1 },
    right: { x: 1, y: 0, r: 1 },
    rightTop: { x: 1, y: 1, r: 1 },
    // rightBottom: { x: 1, y: 1, r: 1 },
  };

  // 获取指定方向的倍数，若无则使用默认值（即偏移量 0，旋转保持原值）
  const { x, y, r } = mapping[direction] || { x: 0, y: 0, r: 1 };

  return {
    offsetX: x * baseOffset,
    offsetY: y * baseOffset,
    rotate1: r * baseRotate,
    rotate2: r * baseRotate2,
  };
};

export interface Point {
  x: number;
  y: number;
  dir?: string;
}

/**
 * @description: 返回两个二维点的直线距离和点位角度关系
 */
export const calculateDistance = (p1: Point, p2: Point): { distance: number; direction: directionT } => {
  // 如果两个点相同，返回 null， top和bottom不执行任何偏移
  if (p1.x === p2.x && p1.y === p2.y) return { distance: 0, direction: "top" };

  // 计算差值（方向应为 p1 指向 p2）
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  // 计算欧几里得距离
  const distance = Math.sqrt(dx * dx + dy * dy);

  // 计算角度（弧度转为角度，并转换为 0° - 360° 范围内）
  const thetaRad = Math.atan2(dy, dx);
  const thetaDeg = ((thetaRad * 180) / Math.PI + 360) % 360;

  // 定义八个方向的查找表
  const directions = DIRECTIONS || ["right", "rightTop", "top", "leftTop", "left", "leftBottom", "bottom", "rightBottom"];

  // 将角度加 22.5° 后，分成 45° 的区间，得到方向索引
  const index = Math.floor((thetaDeg + 22.5) / 45) % 8;
  const direction = directions[index];

  return { distance, direction };
};
