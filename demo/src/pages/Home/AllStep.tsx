/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2025-05-12 09:12:18
 * @LastEditors: Capsion 373704015@qq.com
 * @LastEditTime: 2025-11-06 21:36:55
 * @FilePath: \gsap-lenis-learn\src\pages\Home\AllStep.tsx
 * @Description: 这是首页入口，核心负责将滚动进行平滑和衔接
 */

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollSmoother, ScrollTrigger } from "gsap/all";

import type { RefObject } from "react";
import { useState, useRef, useEffect } from "react";
// import { ReactLenis, useLenis } from "lenis/react";

// import { GlobalContext, skillIcons, type pageStepType } from "@site/src/store";
import { DEFAULT_SUB_COLOR, DEFAULT_MAIN_COLOR } from "@site/src/store";

// import HomeCards from "@src/components/HomeCards";
// import DraggButton from "@src/components/DraggButton";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export default function App() {
    let Smoother: ScrollSmoother;
    let Trigger: ScrollTrigger;

    const test = () => {
        console.log("test 1234444");

        if (!Smoother || !Trigger) return;

        console.log(Smoother.scrollTrigger.start);
        console.log(Smoother.scrollTrigger.end);
        console.log("当前位置: ", (Smoother.scrollTrigger.end * Smoother.progress).toFixed(3));
    };

    const stepContainerRef = useRef<HTMLDivElement>(null);
    const step_1 = useRef<HTMLElement>(null);

    useGSAP(() => {
        const container = document.querySelector("#all-step");
        const sections = gsap.utils.toArray("#all-step .each_step");

        Smoother = ScrollSmoother.create({
            wrapper: "#app-wrapper",
            content: "#app-content",
            smooth: 2.5,
            effects: true,
            smoothTouch: 0.1,
            onStop: (self) => {
                console.log("onStop: ", self.progress);
                console.log(1);
            },

            onUpdate: (self) => {
                console.log("onUpdate: ", self.getVelocity());
                if (self.getVelocity() < 10) {

                    console.log("onUpdate: ", self.getVelocity());

                }
            },
        });

        Trigger = Smoother.scrollTrigger;

        if (!container || !sections || sections.length < 2) return;

        // 确保每个 section 的宽度为视口宽（如果你在 CSS 中已设置，这里可省）
        sections.forEach((s) => (s.style.width = window.innerWidth + "px"));

        // 计算横向需要滚动的距离：总宽 - 可见宽
        const horizontalDistance = container.scrollWidth - window.innerWidth;

        // 创建横向动画（移动所有 section 的 x）
        gsap.to(sections, {
            xPercent: -100 * (sections.length - 1),
            ease: "none",
            scrollTrigger: {
                trigger: container,
                start: "top top",
                end: () => "+=" + horizontalDistance, // 精确匹配需要的垂直滚动距离
                pin: true,
                scrub: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                markers: true, // 调试时改为 true 查看 start/end
            },
        });
    }, []);

    return (
        <div id="app-wrapper">
            <div className={["fixed bottom-10 w-screen h-[200px] bg-amber-200 z-10"].join(" ")}>
                <button className={["text-center text-3xl border-2 border-cyan-300"].join(" ")} onClick={test}>
                    next
                </button>
            </div>
            <div id="app-content">
                {/* <HomeCards></HomeCards> */}
                <div id="all-step" ref={stepContainerRef} className={["flex"].join(" ")}>
                    <div id="step_0" style={{ background: DEFAULT_SUB_COLOR[0] }} className={["shrink-0 basis-[100vw] h-screen", "each_step"].join(" ")}>
                        step_{1}
                    </div>
                    <div
                        id="step_1"
                        ref={step_1 as RefObject<HTMLDivElement>}
                        style={{ background: DEFAULT_SUB_COLOR[1] }}
                        className={["shrink-0 basis-[100vw] h-screen", "each_step"].join(" ")}
                    >
                        step_{2}
                    </div>
                    <div id="step_2" style={{ background: DEFAULT_SUB_COLOR[2] }} className={["shrink-0 basis-[100vw] h-screen", "each_step"].join(" ")}>
                        step_{3}
                    </div>
                    <div id="step_3" style={{ background: DEFAULT_SUB_COLOR[3] }} className={["shrink-0 basis-[100vw] h-screen", "each_step"].join(" ")}>
                        step_{4}
                    </div>
                </div>
            </div>
        </div>
    );
}
