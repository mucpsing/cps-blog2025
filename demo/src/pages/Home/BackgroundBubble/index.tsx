/*
 * @Author: Capsion 373704015@qq.com
 * @Date: 2025-03-27 21:14:24
 * @LastEditors: Capsion 373704015@qq.com
 * @LastEditTime: 2025-04-19 22:21:40
 * @FilePath: \gsap-lenis-learn\src\components\BackgroundBubble\index.tsx
 * @Description: 背景泡泡，这里暂时没有对MacOS进行适配
 */
import { useState, useEffect, useRef } from "react";
import { hexToRgba } from "@src/utils";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

interface GlowBackgroundProps {
  bubble?: BubbleOptions[];
}

interface BubbleOptions {
  blur?: number; // 模糊度
  color?: string; // 光晕颜色
  size?: number; // 光晕尺寸（相对于视口）
  x?: string;
  y?: string;
  depth?: string; // 浓度
  opacity?: number; // 透明度
}

const DEFAULT_BUBBLE = { x: "50%", y: "50%", blur: 25, color: "#FC1E4F", size: 400, depth: "20%", opacity: 0.2 };

/**
 * @description: 返回一个随机数，
 * @param {number} min
 * @param {number} max
 * @param {number} step
 */
const getRandomFloat = (min: number, max: number, step: number): number => {
  // Calculate the number of possible steps between min and max
  const steps = (max - min) / step;

  const randomSteps = Math.floor(Math.random() * (steps + 1));

  return min + randomSteps * step;
};
export default function GlowBackground(props: GlowBackgroundProps = {}) {
  const bubble: Required<BubbleOptions[]> = props.bubble?.map((item) => ({ ...DEFAULT_BUBBLE, ...item })) || [DEFAULT_BUBBLE];
  const backgroundRef = useRef<HTMLDivElement | null>(null);
  const ballRef = useRef<Array<HTMLDivElement | null>>([]);

  useGSAP(
    (_context, contextSafe) => {
      // console.log("GlowBackground init");
      if (!contextSafe) return;

      const onMouseMove = contextSafe((e: MouseEvent) => {
        const x = e.clientX;
        const y = e.clientY;

        // 移动小球
        gsap.to(ballRef.current, {
          x: `${-x / 8}px`,
          y: `${-y / 8}px`,
          duration: 1.2,
          stagger: 0.4,
          ease: "power3.out",
        });
      });

      const onMouseLeave = contextSafe((e: MouseEvent) => {
        console.log("onMouseMove: ...");

        // 小球回到原来的位置
        gsap.to(ballRef.current, {
          x: 0,
          y: 0,
          duration: 2,
          ease: "power3.in",
        });
      });

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseleave", onMouseLeave);

      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseleave", onMouseLeave);
      };
    },
    { scope: backgroundRef, dependencies: [props] }
  );

  return (
    <div ref={backgroundRef} className="overflow-hidden absolute top-0 left-0 w-full h-screen">
      {bubble.map((item, key) => {
        return (
          <div
            key={key}
            className="-translate-x-1/2 -translate-y-1/2 absolute"
            ref={(el) => {
              ballRef.current[key] = el;
            }}
            style={{
              top: item.y,
              left: item.x,
              background: `radial-gradient(circle, ${hexToRgba(item.color as string, item.opacity)} ${item.depth}, transparent 60%)`,
              filter: `blur(${item.blur}px)`,
              borderRadius: "100%",
              width: `${item.size}px`,
              height: `${item.size}px`,
            }}
          ></div>
        );
      })}
    </div>
  );
}
