import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import styles from "./style.module.css"; // 样式文件

const MagneticBall = () => {
  const ballRef = useRef(null);
  const gsapI = useRef(null);

  useEffect(() => {
    // 确保 ballRef.current 存在
    if (!ballRef.current) return;

    console.log("触发");

    // 初始化 GSAP 动画方法
    // const xMove = gsap.quickTo(ballRef.current, "x", {
    //   duration: 0.8,
    //   ease: "power3.out",
    // });

    // const yMove = gsap.quickTo(ballRef.current, "y", {
    //   duration: 0.8,
    //   ease: "power3.out",
    // });

    // 鼠标移动事件处理
    const handleMouseMove = (e) => {
      //   yMove(e.clientY);
      //   xMove(e.clientX);

      if (gsapI.current) gsapI.current.kill();
      gsapI.current = gsap.to(ballRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.5,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 清理函数
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div ref={ballRef} style={{ width: "50px", height: "50px" }}>
      <div className={[styles.magneticBall, "cursor-pointer", "hover:bg-amber-200"].join(" ")}></div>
    </div>
  );
};

export default MagneticBall;
