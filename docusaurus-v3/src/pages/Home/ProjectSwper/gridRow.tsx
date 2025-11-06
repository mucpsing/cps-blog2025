/*
 * @Author: Capsion 373704015@qq.com
 * @Date: 2025-03-20 21:39:40
 * @LastEditors: Capsion 373704015@qq.com
 * @LastEditTime: 2025-03-20 21:41:58
 * @FilePath: \cps-blog-docusaurus-v3\src\pages\Home\ProjectSwper\gridRow.tsx
 * @Description: 单独一行，图片放大同时展示隐藏的tag，这个组件后续可以grid布局重构
 */
import React from "react";

export interface SwiperRowProps {
  colors: string[];
  offset: number;
}

export default function SwiperRow({ colors, offset }: SwiperRowProps): JSX.Element {
  const comTransCss = ["transition-all duration-500 custom-ease-smooth"].join(" ");

  return (
    <div className={["transition-all duration-500 custom-ease-smooth", "flex flex-grow flex-row gap-[14px] flex-1 hover:flex-[3]"].join(" ")}>
      {colors.map((color, index) => {
        const key = index + offset;
        return (
          <section
            key={key}
            className={[
              comTransCss,
              "rounded-3xl box-border group",
              "hover:flex-[3] hover:py-4",
              "flex flex-1 relative items-center justify-center",
            ].join(" ")}
          >
            <div
              className={[
                comTransCss,
                "box-border w-full h-full rounded-3xl",
                "z-10",
                "xl:max-w-[330px]",
                "lg:max-w-[220px]",
                "md:max-w-[200px]",
              ].join(" ")}
              style={{ backgroundColor: color }}
            ></div>
            <div className="absolute flex w-full h-full">
              <div className="flex flex-col w-1/2 h-full">
                {/* 左上角 */}
                <div
                  className={[
                    comTransCss,
                    "flex justify-start items-center pl-4",
                    "h-full w-full opacity-0 group-hover:opacity-100",
                    "border-solid border-0 border-l-[0.5px] border-b-[0.5px] border-zinc-300",
                  ].join(" ")}
                >
                  <span className="text-xs">
                    ElementUI<br></br>
                    Vue2.x
                  </span>
                </div>
                {/* 左下角 */}
                <div
                  className={[
                    comTransCss,
                    "h-full w-full opacity-0 group-hover:opacity-100",
                    "border-solid border-0 border-l-[0.5px] border-zinc-300",
                  ].join(" ")}
                ></div>
              </div>
              <div className="flex flex-col w-1/2 h-full">
                {/* 右上角 */}
                <div
                  className={[
                    comTransCss,
                    "h-full w-full opacity-0 group-hover:opacity-100",
                    "border-solid border-0 border-r-[0.5px]  border-b-[0.5px] border-zinc-300",
                  ].join(" ")}
                ></div>

                {/* 右下角 */}
                <div
                  className={[
                    comTransCss,
                    "h-full w-full opacity-0 group-hover:opacity-100",
                    "border-solid border-0 border-r-[0.5px] border-zinc-300",
                  ].join(" ")}
                ></div>
              </div>
            </div>
            <div></div>
          </section>
        );
      })}
    </div>
  );
}
