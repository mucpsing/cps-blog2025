/*
 * @Author: Capsion 373704015@qq.com
 * @Date: 2025-03-11 20:21:13
 * @LastEditors: Capsion 373704015@qq.com
 * @LastEditTime: 2025-03-20 22:07:21
 * @FilePath: \cps-blog-docusaurus-v3\src\pages\Home\ProjectSwper.tsx
 * @Description: 这是参考https://superpower.com/中相同功能的组件实现的
 * @demo https://codepen.io/ramzibach-the-styleful/pen/LYoYejb 无限滚动参考
 */

import { gsap } from "gsap";
import React, { useEffect, useRef } from "react";
import { COLOR_LIST } from "@site/src/store";
import { svgList, d as description } from "./data";
import SwiperRow from "./gridRow";

const TextRow: React.FC = () => {
  return (
    <div className="">
      <div className="text-4xl font-bold">
        <span className="text-[#34E4D7]">技术方案</span>
        {/* 这里使用svg */}
        <span className="text-2xl">&nbsp;/&nbsp; </span>
        <span className="text-[#95F204]">项目展览</span>
      </div>

      <div className="my-6"></div>
      <p>{description}</p>
    </div>
  );
};

const LogoIconRow: React.FC<{ direction?: "left" | "right"; loop?: boolean; speed?: number }> = ({
  direction = "left",
  loop = false,
  speed = 80,
}) => {
  const maxWidth = 120;
  const height = 60;
  const containerRef = useRef<HTMLDivElement>(null);

  // 初始化滚动
  useEffect(() => {
    if (!containerRef.current) return;
    if (!loop) return;

    const content = containerRef.current.children[0] as HTMLElement;
    const clone = content.cloneNode(true);
    containerRef.current.appendChild(clone);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1 }).to([content, clone], {
        xPercent: direction === "left" ? -100 : 100,
        ease: "none",
        duration: speed,
        modifiers: { xPercent: gsap.utils.wrap(-100, 0) }, // 无缝循环核心逻辑
      });
    }, containerRef);

    return () => ctx.revert();
  }, [direction, loop, speed]);

  return (
    <div ref={containerRef} className="flex items-center w-full h-[120px] overflow-x-hidden">
      <div
        className={["inline-flex items-center justify-center gap-8 p-4 flex-nowrap", direction == "left" ? "flex-row" : "flex-row-reverse"].join(" ")}
      >
        {svgList.map((svg, i) => (
          <img src={svg} style={{ height, maxWidth }} alt={svg} key={i}></img>
        ))}
      </div>
    </div>
  );
};

export default function ProjectSwper(): JSX.Element {
  const halfCount = COLOR_LIST.length / 2;

  return (
    <div className="w-screen max-w-[1550px] mx-auto flex-col flex gap-4 py-4 px-6">
      <TextRow></TextRow>
      <LogoIconRow direction={"left"} loop={true}></LogoIconRow>

      <div className={["w-full box-border", "xl:h-[400px] lg:h-[300px] md:h-[260px] sm:h-[200px]", "flex flex-col gap-[14px]"].join(" ")}>
        {/* 第一行 */}
        <SwiperRow colors={COLOR_LIST.slice(0, halfCount)} offset={0} />
        {/* 第二行 */}
        <SwiperRow colors={COLOR_LIST.slice(halfCount)} offset={halfCount} />
      </div>

      <LogoIconRow direction={"right"} loop={true}></LogoIconRow>
    </div>
  );
}
