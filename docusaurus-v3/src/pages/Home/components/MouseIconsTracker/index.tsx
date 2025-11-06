/*
 * @Author: Capsion 373704015@qq.com
 * @Date: 2025-03-24 20:41:58
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2025-03-25 10:41:42
 * @FilePath: \gsap-lenis-learn\src\components\MouseFlowerElCreator\test.tsx
 * @Description: 这是一个仿照gsap官方文档网站中跟随鼠标生成元素的组件
 * @example:
 * 
 * import MouseTracker from "./components/MouseTracker";
 * 
 * <div ref={testRef} className="bg-amber-200 w-3/5 mx-auto h-[500px] ">
      <MouseTracker />
   </div>
 */

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/customEase";

import { calculateOffset, calculateDistance } from "./utils";
import type { Point, directionT } from "./utils";
gsap.registerPlugin(CustomEase);

interface MouseTrackerProps {
  threshold?: number; // 间隔，每到累计到一个间隔阈值，则记录坐标
  count?: number;
}

// Add the global type declaration
declare global {
  interface Window {
    recordedPoints: Point[];
  }
}

const pointContainerId = "__MouseTracker_Container";

const MouseTracker: React.FC<MouseTrackerProps> = ({ threshold = 120, count = 30 }) => {
  const lastPoint = useRef<Point | null>(null);
  const distanceTraveled = useRef<number>(0);
  const recordedPoints = useRef<Point[]>([]);

  const [pointCount, setPointCount] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointPool = useRef<HTMLDivElement[]>([]);

  const size = 30;

  // 创建粒子动画
  CustomEase.create("c1", "0.475, -0.210, 0.000, 1.240");
  CustomEase.create("c2", "0.000, 0.020, 0.000, 1.650");

  /**
   * @param {number} x
   * @param {number} y
   * @param {string} offseDir 来源的方向
   */
  const createParticleAnimation = (x: number, y: number, offseDir: directionT = "top") => {
    // 冲元素池中提取一个透明度为0的元素来进行动画
    const availableParticle = pointPool.current.find((el) => el.style.opacity === "0");

    if (!availableParticle) return;

    const { offsetX, offsetY, rotate1, rotate2 } = calculateOffset(offseDir);

    // 设置元素初始位置
    // 这里嵌套编写目的时为了过度效果更加跟手和丝滑
    gsap.set(availableParticle, {
      x: x + offsetX,
      y: y + offsetY,
      opacity: 0,
      scale: 0.2,
      rotate: rotate1,
      onComplete: () => {
        /* 元素放大，带弹性效果 */
        gsap.to(availableParticle, {
          opacity: 0.8,
          scale: 2,
          duration: 0.9,
          rotate: 0,
          ease: "c1",
          x,
          y,
          onComplete: () => {
            // 元素放大后设置落下效果
            gsap.to(availableParticle, {
              y: window.innerHeight + 100,
              rotate: rotate2,
              duration: 3,
              delay: 0.03,
              ease: "c2",
              opacity: 0,
            });
          },
        });
      },
    });
  };

  // Handle mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = document.body.getBoundingClientRect();
    const currentPoint: Point = { x: e.clientX - rect.x, y: e.clientY - rect.y };

    if (!lastPoint.current) return (lastPoint.current = currentPoint);

    const distance = calculateDistance(currentPoint, lastPoint.current);
    distanceTraveled.current += distance.distance;

    if (distanceTraveled.current >= threshold) {
      recordedPoints.current.push({ ...currentPoint });

      distanceTraveled.current = 0;

      setPointCount(recordedPoints.current.length);

      createParticleAnimation(currentPoint.x, currentPoint.y, distance.direction);
    }

    lastPoint.current = currentPoint;
  };

  useEffect(() => {
    const pointContainerRef = (document.getElementById(pointContainerId) as HTMLDivElement) || document.createElement("div");
    pointContainerRef.id = pointContainerId;
    Object.assign(pointContainerRef.style, { position: "absolute", top: 0, left: 0 });

    const pointInitStyle = {
      position: "absolute",
      pointerEvents: "none",
      width: `${size}px`,
      height: `${size}px`,
      opacity: "0",
      backgroundColor: "#ff6b6b",
      zIndex: 30,
    };

    pointPool.current.length = 0;
    for (let i = 1; i <= count; i++) {
      const eachPointRef = document.createElement("div");
      Object.assign(eachPointRef.style, pointInitStyle);
      pointPool.current.push(eachPointRef);
      pointContainerRef.appendChild(eachPointRef);
    }

    document.body.appendChild(pointContainerRef);

    return () => {
      document.getElementById(pointContainerId)?.remove();
    };
  }, []);

  return (
    // 触发区域
    <div ref={containerRef} onMouseMove={handleMouseMove} className="w-full h-full relative">
      {process.env.NODE_ENV === "development" && <div style={{ padding: "20px", position: "absolute", top: 0, left: 0, background: "rgba(255,255,255,0.7)" }}>Recorded points: {pointCount}</div>}
    </div>
  );
};

export default MouseTracker;
