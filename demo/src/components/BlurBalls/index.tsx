/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2025-04-02 10:12:57
 * @LastEditors: capsion_surfacePro7 capsion@surfacePro2.com
 * @LastEditTime: 2025-04-05 10:23:23
 * @FilePath: \gsap-lenis-learn\src\components\BlurBalls.tsx
 * @Description: 这是一个液态球体的组件，内部会有液态跟随鼠标流出的效果
 */
import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

export interface Point {
  x: number;
  y: number;
}

export default function BlurBalls() {
  const testRef = useRef<HTMLDivElement>(null);
  const bigBallRef = useRef<HTMLDivElement>(null);
  const ballWarpRef = useRef<HTMLDivElement>(null);
  const smallBallRef = useRef<Array<HTMLDivElement | null>>([]);

  const bigBallCenter = useRef<Point>({ x: 0, y: 0 });

  //这里后期需要增加一个比例单位，用于响应式不同的屏幕尺寸
  const BASE_CONFIG = {
    smallBallSize: 60, // 小球尺寸 单位px
    smallBallCount: 3, // 小球数量
    bigBallSize: 300, //大球尺寸 单位px
    maxDistance: 10, // 小球最大允许距离
  } as const;

  // 计算出大球的中心点
  useEffect(() => {
    if (!bigBallRef.current) return;
    const rect = bigBallRef.current.getBoundingClientRect() as DOMRect;

    bigBallCenter.current.x = rect.left + rect.width / 2;
    bigBallCenter.current.y = rect.top + rect.width / 2;
  }, [bigBallRef.current]);

  // 小球的运动
  // 需要优化，这里使用了圆心计算，其实不用，将触发区域使用元素
  const moveSmallBalls = (x: number, y: number) => {
    if (!smallBallRef.current) return;
    if (!bigBallRef.current) return;

    const rect = bigBallRef.current.getBoundingClientRect() as DOMRect;
    let distance_x = x - rect.left - rect.width / 2 + window.scrollX;
    let distance_y = y - rect.top - rect.height / 2 + window.scrollY;

    // 计算最大半径（大球半径 + 允许的最大外部距离）
    const maxRadius = BASE_CONFIG.maxDistance + rect.width / 2;
    const currentDistance = Math.sqrt(distance_x ** 2 + distance_y ** 2);

    // 如果超出圆形边界，按比例缩放至边界
    if (currentDistance > maxRadius) {
      const scale = maxRadius / currentDistance;
      distance_x *= scale;
      distance_y *= scale;
    }

    // 添加动画清理逻辑
    gsap.killTweensOf(smallBallRef.current);

    // 移动标题
    gsap.to(smallBallRef.current, { x: `${distance_x}px`, y: `${distance_y}px`, duration: 2, ease: "power3.out", stagger: 0.1, overwrite: true });
  };

  return (
    <div ref={testRef} className="border-2 border-black border-solid">
      {/* 注意当前苹果的safari对blur支持不友好，可以使用转换成png的方案 */}
      <div
        ref={ballWarpRef}
        onMouseMove={(e) => moveSmallBalls(e.clientX, e.clientY)}
        onMouseOut={() => moveSmallBalls(bigBallCenter.current.x, bigBallCenter.current.y)}
        className={["__BlurBall_balls mix-blend-darken contrast-[1000%] relative overflow-hidden", "bg-white", "w-[500px] h-[500px]", "flex justify-center items-center"].join(" ")}
      >
        {Array(BASE_CONFIG.smallBallCount)
          .fill(1)
          .map((_, index) => {
            // 小球使用笔筒的比例一大一小在过度时融合效果会更好
            const scale = index % 2 === 0 ? 1.4 : 1.2;
            return (
              <div
                key={index}
                ref={(el) => {
                  smallBallRef.current[index] = el;
                }}
                className={["__BlurBall_balls_small", "absolute rounded-full", "bg-black blur-[10px]"].join(" ")}
                style={{ width: `${BASE_CONFIG.smallBallSize * scale}px`, height: `${BASE_CONFIG.smallBallSize * scale}px` }}
              ></div>
            );
          })}

        <div ref={bigBallRef} style={{ width: `${BASE_CONFIG.bigBallSize}px`, height: `${BASE_CONFIG.bigBallSize}px` }} className={["__BlurBall_balls_big ___BlurBall_ball]", "bg-black blur-[10px]", "absolute rounded-full"].join(" ")}></div>
      </div>
    </div>
  );
}
