import { gsap } from "gsap";
import { random } from "lodash";
import { useGSAP } from "@gsap/react";

import { useState, useRef, useEffect } from "react";

const utils = {
  generateSymmetricalArray(n: number): number[] {
    if (!Number.isInteger(n) || n <= 0) return [];

    const isOdd = n % 2 === 1;
    const m = isOdd ? (n - 1) / 2 : n / 2;

    return Array.from({ length: n }, (_, i) => (isOdd ? i - m : -(m - 0.5) + i));
  },
};

export default function HomeCards() {
  const tar = Array.from({ length: 5 }, () => "🍎");
  const t = utils.generateSymmetricalArray(tar.length);
  const gap = 200;

  const step_1 = useRef(
    gsap.timeline({
      scrollTrigger: {
        trigger: "#step_0",
        start: "center center",
        end: window.innerHeight * 2,
        markers: true,
        scrub: true, // 滚动与动画进度联动
      },
    })
  );

  useGSAP(() => {
    // gsap.set(".eachCard", {
    //   x: window.innerWidth / 2 - 150 / 2,
    //   y: window.innerHeight,
    //   scale: 1.6,
    //   opacity: 0,
    // });
    // step_1.current
    //   .to(".eachCard", {
    //     y: () => window.innerHeight / 2 - 150 / 2,
    //     direction: 2,
    //     stagger: 0.1,
    //     opacity: 1,
    //     scale: 1.2,
    //     ease: "expo.inOut",
    //   })
    //   .to(".eachCard", {
    //     direction: 0.4,
    //     ease: "steps.inOut",
    //     rotate: (index) => t[index] * random(0, 10),
    //   })
    //   .to(".eachCard", {
    //     x: (index) => t[index] * gap + window.innerWidth / 2 - 150 / 2,
    //     y: (index) => window.innerHeight / 2 - 150 / 2 + 30 * Math.abs(t[index]),
    //     direction: 3,
    //     ease: "elastic.inOut",
    //   });
  });
  return (
    <>
      {tar.map((item, key) => {
        return (
          <div key={key} className={["w-[150px] h-[150px] bg-amber-300 fixed", "eachCard"].join(" ")}>
            {item}
          </div>
        );
      })}
    </>
  );
}
