/*
 * @Author: Capsion 373704015@qq.com
 * @Date: 2025-05-09 12:10:40
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2025-11-12 09:23:55
 * @FilePath: \gsap-lenis-learn\src\pages\Home\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { useState, useRef, useEffect } from "react";

import "@site/src/assets/font/fonts.css";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";

import { GlobalContext, skillIcons, type pageStepType } from "@site/src/store";
import { mainTexts, subTexts, bubbleList } from "@site/src/store";
import { DEFAULT_SUB_COLOR, DEFAULT_MAIN_COLOR } from "@site/src/store";

import MainText from "./mainText";
import SubText from "./SubText";
import HomeButtonBar from "./HomeButtonBar";

import DocsText from "./DocsText";
import BackgroundBubble from "./BackgroundBubble";
import BackgroundRect from "./BackgroundRect";
import CoderSwiper from "./CoderSwiper";
import HomeCards from "@site/src/components/HomeCards";

import MouseTracker from "@site/src/components/MouseIconsTracker";
import DraggableElement from "@src/components/DraggableEl";

// 手动定义有首页有多少step
// step_0 加载状态
// step_1 首页1
const ALL_STEP = ["step_0", "step_1", "step_2", "step_3"] as const;
type StepT = (typeof ALL_STEP)[number];

gsap.registerPlugin(useGSAP, ScrollTrigger);
ScrollTrigger.defaults({ markers: { startColor: "green", endColor: "red", fontSize: "12px" } });
gsap.defaults({ ease: "none" });

function Step_1() {
    const mainRef = useRef<HTMLDivElement>(null);

    // -1 动画前准备状态，loading状态
    // 0  进场动画，loading正式开始动画，所有动画完成后进入
    // 1  循环动画，页面持续状态
    const [pageStep, setPageStep] = useState<pageStepType>("loadding");
    const [animationStep, setAnimationStep] = useState<number>(-1);

    const [childCount, setChildCount] = useState(new Set<string>()); // 子组件数量
    const [completedCount, setCompletedCount] = useState(new Set<string>()); // 已完成子组件数量

    // 颜色配置
    const [colorIndex, setColorIndex] = useState<number>(0);

    useEffect(() => {
        const t = setTimeout(() => {
            setAnimationStep(0);
            console.log("开始动画: ", animationStep);
        }, 1000);
        return () => clearTimeout(t);
    });

    // 当所有子组件完成时触发
    useEffect(() => {
        if (childCount.size > 0 && completedCount.size === childCount.size) {
            switch (pageStep) {
                case "loadding":
                    console.log("准备阶段");
                    break;

                case "start":
                    console.log("开始动画");

                    break;
            }

            // 当所有子组件完成动画后，触发页面进入下一阶段动画
            setAnimationStep((s) => s + 1);

            // 重置计数器（暂定是否必须添加）
            setChildCount((e) => {
                e.clear();
                return e;
            });
            setCompletedCount((e) => {
                e.clear();
                return e;
            });
        }
    }, [completedCount]);

    // 创建上下文值
    const globalContextValue = {
        colorIndex,
        mainColor: DEFAULT_MAIN_COLOR[colorIndex],
        subColor: DEFAULT_SUB_COLOR[colorIndex],

        pageStep: "loadding" as "loadding" | "start",

        animationStep: animationStep,

        register: (strID: string) => {
            setChildCount((c) => {
                c.add(strID);
                // console.info(`register: ${strID} - ${c.size}`);
                return c;
            });
        },

        reportCompletion: (strID: string) =>
            setCompletedCount((c) => {
                c.add(strID);
                // console.info(`reportCompletion: ${strID} - ${c.size}`);
                return c;
            }),
    };

    return (
        <ReactLenis root>
            <GlobalContext.Provider value={globalContextValue}>
                <main ref={mainRef} className="relative w-full h-screen overflow-hidden main z-2">
                    {/* <DraggableElement></DraggableElement> */}
                    <div className={["bg-amber-300 w-[200px] h-[60px] fixed top-0 left-0 flex justify-center items-center"].join(" ")}>
                        <button
                            onClick={() => {
                                console.log("globalContextValue: ", globalContextValue);

                                setColorIndex((prev) => prev + 1);
                            }}
                            className={"bg-red-500 px-5 py-2 rounded-lg text-white cursor-pointer"}
                        >{`动画按钮_${globalContextValue.pageStep}_${globalContextValue.animationStep}`}</button>
                    </div>
                    <section
                        className={[
                            "__home_main_text relative w-fit z-3",
                            "top-[10%] left-[5%]",
                            "lg:top-[13%] lg:left-[4%]",
                            "xl:top-[14%] xl:left-[5%]",
                            "2xl:top-[15%] 2xl:left-[6%]",
                            "min-[1920px]:top-[20%] min-[1920px]:left-[10%]",
                        ].join(" ")}
                    >
                        <SubText
                            className={["lg:h-[3rem] lg:text-[2.6rem]", "xl:h-[3.5rem] xl:text-[3rem]", "2xl:h-[3.5rem] 2xl:text-[3rem]"].join(" ")}
                            texts={subTexts}
                        ></SubText>

                        <div className="my-3"></div>

                        <MainText
                            className={["lg:h-[4.5rem] lg:text-[4rem]", "xl:h-[5rem] xl:text-[4.5rem]", "2xl:h-[5.5rem] 2xl:text-[5rem]"].join(" ")}
                            texts={mainTexts}
                        ></MainText>

                        <div className="my-6"></div>

                        <DocsText
                            className={["lg:text-[.9rem] lg:max-w-[500px]", "xl:text-[1rem] xl:max-w-[600px]", "2xl:text-[1.1rem] 2xl:max-w-[700px]"].join(" ")}
                        ></DocsText>

                        <div className="mt-15"></div>

                        <HomeButtonBar></HomeButtonBar>

                        <div className={["w-[700px] h-[320px] border-2 border-red-200 border-solid"].join(" ")}>
                            <MouseTracker DEBUG={false} iconsList={skillIcons} size={25} count={skillIcons.length} threshold={100}></MouseTracker>
                        </div>
                    </section>

                    <div className={["flex justify-between items-center h-full", "mx-10 xl:mx-20"].join(" ")}>
                        <section>
                            <SubText
                                className={["lg:h-[3rem] lg:text-[2.6rem]", "xl:h-[3.5rem] xl:text-[3rem]", "2xl:h-[3.5rem] 2xl:text-[3rem]"].join(" ")}
                                texts={subTexts}
                            ></SubText>
                            <div className="my-3"></div>

                            <MainText
                                className={["lg:h-[4.5rem] lg:text-[4rem]", "xl:h-[5rem] xl:text-[4.5rem]", "2xl:h-[5.5rem] 2xl:text-[5rem]"].join(" ")}
                                texts={mainTexts}
                            ></MainText>

                            <div className="my-6"></div>

                            <DocsText
                                className={["lg:text-[.9rem] lg:max-w-[500px]", "xl:text-[1rem] xl:max-w-[600px]", "2xl:text-[1.1rem] 2xl:max-w-[700px]"].join(
                                    " "
                                )}
                            ></DocsText>

                            <div className="mt-15"></div>

                            <HomeButtonBar></HomeButtonBar>

                            {/* 暂时因为排版问题，无法出现 */}
                            {/* <div className={["w-[500px] h-[220px]"].join(" ")}>
                <MouseTracker DEBUG={false} iconsList={skillIcons} size={30} count={skillIcons.length} threshold={100}></MouseTracker>
              </div> */}
                        </section>

                        <section className={["w-1/2 h-full flex justify-center items-center"].join(" ")}>
                            <HomeCards></HomeCards>
                        </section>
                    </div>

                    {/* 动画进度条组件 */}
                    <div className={["fixed bottom-[5vh] left-1/2 -translate-x-1/2 w-4/5"].join(" ")}>
                        <div className={["bg-red-400 rounded-3xl h-[8px] w-full"].join(" ")}></div>
                    </div>

                    {/* <BackgroundRect className="pointer-events-none -z-[1]"></BackgroundRect> */}
                </main>

                <BackgroundBubble bubble={bubbleList}></BackgroundBubble>
            </GlobalContext.Provider>
        </ReactLenis>
    );
}

function Test() {
    return <div>Home</div>;
}

export default Step_1;
