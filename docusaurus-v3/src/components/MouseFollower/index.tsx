import React, { useEffect, useRef, useState } from "react";

const ColorTransitionCircle = ({ offsetX = 0, offsetY = 0, radius = 30, colors = [] }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapperRef = useRef(null);
  const intervalRef = useRef(null);

  // 初始状态，监听鼠标移动
  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX + offsetX, y: e.clientY + offsetY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [offsetX, offsetY]);

  // 组件挂载后开始背景色过渡效果
  //   useEffect(() => {
  //     if (colors.length > 0) {
  //       let currentIndex = 0;
  //       intervalRef.current = setInterval(() => {
  //         setActiveIndex((currentIndex = (currentIndex + 1) % colors.length));
  //       }, 1000);

  //       return () => clearInterval(intervalRef.current);
  //     }
  //   }, [colors]);

  return (
    <div
      ref={wrapperRef}
      className={[
        "absolute flex items-center justify-center",
        "transition delay-[300ms] duration-[1200ms] ease-in-out",
        "w-[60px] h-[60px] overflow-hidden rounded-full",
      ].join(" ")}
      style={{
        transform: `translate(${position.x}px,${position.y}px )`,
      }}
    >
      {/* 背景div列表
      <div
        className="absolute flex transition-transform ease-out"
        style={{
          transform: `translateX(-${activeIndex * (radius * 2)}px)`, // 根据activeIndex移动背景
        }}
      >
        {colors.map((color, index) => (
          <div key={index} className="w-[60px] h-[60px] rounded-full" style={{ backgroundColor: color }} />
        ))}
      </div> */}

      {/* 鼠标跟随的圆形div */}
      <div
        className={["absolute bg-red-300 rounded-full cursor-pointer hover:bg-slate-200", "transition-all", "flex flex-col gap-[10px]"].join(" ")}
        style={{
          width: radius * 2,
          height: radius * 2,
        }}
      >
        <div id="__eyes" className={["flex flex-row", "w-full h-full"].join(" ")}>
          <div id="__left" className={["w-1/3 h-2/5 bg-white"].join(" ")}></div>
          <div id="__right" className={[""].join(" ")}></div>
        </div>

        <div id="__mouth" className={["flex flex-row", "w-full h-full"].join(" ")}>
          <div className={["w-2/3 h-2/5 bg-white"].join(" ")}></div>
        </div>
      </div>
    </div>
  );
};

export default ColorTransitionCircle;
