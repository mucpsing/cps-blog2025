/*
 * @Author: Capsion 373704015@qq.com
 * @Date: 2025-02-17 22:18:58
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2025-02-27 09:45:37
 * @FilePath: \cps-blog-docusaurus-v3\src\components\BubbleText\utils.ts
 * @Description: Bubble组件要用到的一些工具函数
 */

/**
 * 将矩形区域分成四个区域：左上、右上、左下、右下
 *
 * @param {DOMRect} rect - 由getBoundingClientRect()返回的矩形对象
 * @returns {Object} 返回一个对象，包含四个区域的坐标
 */
export const getRectangleIntoFour = (rect) => {
  const { left, top, right, bottom, width, height } = rect;

  // 计算每个区域的宽度和高度（分成四个区域）
  const midX = left + width / 2; // 矩形的水平中心线
  const midY = top + height / 2; // 矩形的垂直中心线

  return {
    LeftTop: [
      [left, top],
      [midX, midY],
    ],
    RightTop: [
      [midX, top],
      [right, midY],
    ],
    LeftBottom: [
      [left, midY],
      [midX, bottom],
    ],
    RightBottom: [
      [midX, midY],
      [right, bottom],
    ],
  };
};

/**
 * @description: 快速获取一个随机颜色
 */
export const getRandomColor = () => {
  const R = Math.round(Math.random() * 95 + 160);
  const G = Math.round(Math.random() * 95 + 160);
  const B = Math.round(Math.random() * 95 + 160);

  return `rgb(${R},${G},${B})`;
};

export type Point = [number, number];
export type PositionT = "LeftBottom" | "RightBottom" | "LeftTop" | "RightTop";

/**
 * @description: 判断一个点与一个矩形的位置关系，如果都不存在，则返回"RightBottom"
 * @param {Point} point
 * @param {DOMRect} rect
 * @param {PositionT} defaultReturn
 */
export function getRegionPosition(point: Point, rect: DOMRect, defaultReturn: PositionT = "RightBottom"): PositionT {
  const [x, y] = point;
  const { left, top, right, bottom, width, height } = rect;

  // 判断点是否在矩形内部
  if (x >= left && x <= right && y >= top && y <= bottom) {
    // 计算矩形的中心点
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    // 判断点相对于矩形中心的位置并返回相应区域
    if (x < centerX && y < centerY) {
      return "LeftTop"; // 左上
    } else if (x > centerX && y < centerY) {
      return "RightTop"; // 右上
    } else if (x < centerX && y > centerY) {
      return "LeftBottom"; // 左下
    } else if (x > centerX && y > centerY) {
      return "RightBottom"; // 右下
    }
  }

  // 如果点不在矩形内部
  return defaultReturn;
}

export type Region = [Point, Point];
/**
 * @description: 从一个矩形区域内随机取点
 * @param {Region} region
 */
export function getRandomPoint(region: Region): Point {
  const [[startX, startY], [endX, endY]] = region;

  // 确保 startX, startY 是矩形左下角，endX, endY 是右上角
  const [minX, maxX] = startX < endX ? [startX, endX] : [endX, startX];
  const [minY, maxY] = startY < endY ? [startY, endY] : [endY, startY];

  // 生成随机的 x 和 y 坐标
  const x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
  const y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

  return [x, y];
}

/**
 * @description: 从一个矩形区域内随机取点
 * @param {DOMRect} rect - 矩形区域
 * @returns {Point} - 随机点坐标
 */
export function getRandomPointByDOMRect(rect: DOMRect): Point {
  const { left, top, right, bottom } = rect;

  // 生成随机的 x 和 y 坐标
  const x = Math.floor(Math.random() * (right - left + 1)) + left;
  const y = Math.floor(Math.random() * (bottom - top + 1)) + top;

  return [x, y];
}

/**
 * @description: 随机数获取
 * @param {*} min
 * @param {*} max
 */
export function getR(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * @description: 在指定的id元素上，创建一个覆盖元素，尺寸和位置保持一致，默认在body中生成
 * @param {*} targetId
 * @param {*} style
 */
export function createCoverElement(targetId, style) {
  // 获取目标元素
  const targetElement = document.getElementById(targetId);
  if (!targetElement) {
    console.error(`Element with id "${targetId}" not found`);
    return null;
  }

  // 计算目标元素的准确位置和尺寸
  const rect = targetElement.getBoundingClientRect();
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  // 创建覆盖层元素
  const cover = document.createElement("div");

  // 设置覆盖层样式
  Object.assign(
    cover.style,
    {
      left: `${rect.left + scrollX}px`,
      top: `${rect.top + scrollY}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    },
    style
  );

  // 处理可能影响定位的父级元素
  const isFixedPosition = getComputedStyle(targetElement).position === "fixed";
  if (isFixedPosition) {
    cover.style.position = "fixed";
    cover.style.left = `${rect.left}px`;
    cover.style.top = `${rect.top}px`;
  }

  // 处理边界溢出情况
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;

  // 检查元素是否部分在可视区域外
  const isPartiallyVisible = rect.top < viewportHeight && rect.bottom > 0 && rect.left < viewportWidth && rect.right > 0;

  if (!isPartiallyVisible) {
    console.warn("Target element is completely outside the viewport");
  }

  // 添加到文档
  document.body.appendChild(cover);

  // 返回引用以便后续操作
  return {
    element: cover,
    update: function () {
      // 更新位置的方法
      const newRect = targetElement.getBoundingClientRect();
      cover.style.left = `${newRect.left + (isFixedPosition ? 0 : scrollX)}px`;
      cover.style.top = `${newRect.top + (isFixedPosition ? 0 : scrollY)}px`;
      cover.style.width = `${newRect.width}px`;
      cover.style.height = `${newRect.height}px`;
    },
    remove: function () {
      cover.remove();
    },
  };
}
