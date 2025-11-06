/*
 * @Author: Capsion 373704015@qq.com
 * @Date: 2025-03-25 20:12:12
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2025-05-09 09:51:44
 * @FilePath: \gsap-lenis-learn\src\components\CapsionText\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState, useRef } from "react";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import "./CapsionText.css";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGlobalContext } from "@src/store";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const CapsionTextLogo: React.FC<{ texts: string[]; step?: number; className?: string }> = ({
  texts = ["WELLCOME TO", "This is My blog", "I'm Capsion", "I'm a Front-end Developer", "I'm a Designer", "I'm a Gamer"],
  className = "",
}) => {
  const { register, reportCompletion, animationStep } = useGlobalContext();

  const capsionTextLogoRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  const currentTextRef = useRef<HTMLDivElement>(null);
  const nextTextRef = useRef<HTMLDivElement>(null);

  const animation = useRef<gsap.core.Timeline>(null);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [nextIndex, setNextIndex] = useState<number>(1);

  const upDownAnimation = () => {
    if (!animation.current) {
      animation.current = gsap
        .timeline({ paused: true, repeat: -1, repeatDelay: 1 })

        .to(currentTextRef.current, { yPercent: -100, duration: 0.5, ease: "power2.inOut" }, 1)
        .to(nextTextRef.current, { yPercent: -100, duration: 0.5, ease: "power2.inOut" }, 1)

        .set(currentTextRef.current, { yPercent: 100 }, 2)
        .call(() => setCurrentIndex((prev) => (prev + 2) % texts.length), [], 2.5)

        .to(currentTextRef.current, { yPercent: 0, duration: 0.5, ease: "power2.inOut" }, 3.5)
        .to(nextTextRef.current, { yPercent: -200, duration: 0.5, ease: "power2.inOut" }, 3.5)

        .set(nextTextRef.current, { yPercent: 100 }, 4)

        .call(
          () =>
            setNextIndex((prev) => {
              let nextIndex = (prev + 2) % texts.length;

              if (nextIndex == 0) nextIndex = 1;
              if (nextIndex >= texts.length) nextIndex = 1;

              return nextIndex;
            }),
          [],
          "+=0.5"
        );

      animation.current.restart();
    }

    return animation.current;
  };

  useGSAP(
    () => {
      register("SubText");

      switch (animationStep) {
        case 0:
          // gsap.from(capsionTextLogoRef.current, {
          //   xPercent: -200,
          //   opacity: 0,
          //   direction: 20,
          //   ease: "power1.in",
          // });
          // gsap.set(capsionTextLogoRef.current, {
          //   xPercent: "-200%",
          //   opacity: 0,
          // });
          // gsap.to(capsionTextLogoRef.current, {
          //   x: 0,
          //   direction: 5.8,
          //   ease: "power1.in",
          //   opacity: 1,
          // });

          reportCompletion("SubText");
          // 文字循环
          break;
        case 1:
          // gsap.from(".eachChar", {
          //   yPercent: 130,
          //   stagger: 0.02,
          //   direction: 1.2,
          //   ease: "back.out",
          // });

          upDownAnimation();
          break;
      }

      // return () => context.revert();
    },
    { scope: textContainerRef, dependencies: [animationStep] }
  );

  return (
    <section ref={capsionTextLogoRef} className={[className, "h-[2rem] text-[1.8rem]", "text-left overflow-hidden w-full relative"].join(" ")}>
      <div ref={textContainerRef} className={["overflow-hidden leading-none", "text-black mix-blend-difference"].join(" ")}>
        <div ref={currentTextRef} className={["up py-[5px] eachChar"].join(" ")}>
          {texts[currentIndex]}
        </div>

        {texts.length > 1 && (
          <div ref={nextTextRef} className={["down py-[5px] absolute eachChar"].join(" ")}>
            {texts[nextIndex]}
          </div>
        )}
      </div>
    </section>
  );
};

export default CapsionTextLogo;
