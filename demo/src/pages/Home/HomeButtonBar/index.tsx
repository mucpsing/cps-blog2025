/*
 * @Author: Capsion 373704015@qq.com
 * @Date: 2025-04-18 23:43:54
<<<<<<< HEAD
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2025-05-09 09:52:07
=======
 * @LastEditors: Capsion 373704015@qq.com
 * @LastEditTime: 2025-05-07 22:24:47
>>>>>>> 426771d72684b1931d919521de4b323e9576d106
 * @FilePath: \gsap-lenis-learn\src\pages\Home\HomeButtonBar\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import Iconfont from "@site/src/components/Iconfont";
import { useGlobalContext } from "@src/store";

function IconBar() {
  const { register, reportCompletion, animationStep } = useGlobalContext();

  const gsapI = useRef<gsap.core.Tween>(null);
  const iconsList = [
    "logoicon-bilibili-line",
    "logoicon-juejin",
    "logoicon-github-fill",
    "logoicon-gitee",
    "logoicon-QQ-circle-fill",
    "logoicon-weixin",
  ];

  useGSAP(() => {
    register("IconBar");

    switch (animationStep) {
      case -1:
        gsap
          .set(".eachIcon", {
            opacity: 0,
            yPercent: 100,
          })
          .eventCallback("onComplete", () => {
            reportCompletion("IconBar");
          });
        break;

      case 0:
        gsapI.current = gsap.to(".eachIcon", {
          duration: 0.6,
          opacity: 1,
          yPercent: 0,
          ease: "power1.inOut",
          stagger: 0.05,
        });

        break;
    }

    return () => {
      if (gsapI.current) gsapI.current.kill();
    };
  });

  return (
    <div className={["mt-8 w-[360px]"].join(" ")}>
      <div className={["flex justify-evenly"].join(" ")}>
        {iconsList.map((icon, key) => (
          <div key={key}>
            <Iconfont className="eachIcon text-2xl hover:text-[#FC1E4F] cursor-pointer" iconName={icon}></Iconfont>
          </div>
        ))}
      </div>
    </div>
  );
}

function HomeButtonBar() {
  const { register, reportCompletion, animationStep } = useGlobalContext();

  return (
    <div className={["flex flex-col justify-start items-start"].join(" ")}>
      <div className={["flex justify-start gap-10", "h-[50px] w-[360px] text-[1rem]"].join(" ")}>
        <button
          className={[
            "flex-1 h-full cursor-pointer",
            "rounded-2xl bg-[#FC1E4F]  text-white",
            "hover:bg-white hover:border-2 hover:border-[#FC1E4F] hover:text-[#FC1E4F]",
            "transition-all duration-300 ease-in-out",
          ].join(" ")}
        >
          <strong>📄 个人简介</strong>
        </button>
        <button
          className={[
            "flex-1 h-full cursor-pointer",
            "rounded-2xl border-2 border-[#FC1E4F]  text-[#FC1E4F]",
            "hover:border-0 hover:bg-[#FC1E4F] hover:text-[#fff]",
            "transition-all duration-300 ease-in-out",
          ].join(" ")}
        >
          <strong>作品项目 💼</strong>
        </button>
      </div>

      <IconBar></IconBar>
    </div>
  );
}

export default HomeButtonBar;
