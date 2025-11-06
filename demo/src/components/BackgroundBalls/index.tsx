import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface BlurBallsProps {
  count?: number;
  sizeRange?: [number, number];
}

const BlurBalls = ({ count = 4, sizeRange = [1.2, 1.5] }: BlurBallsProps) => {
  const [balls, setBalls] = useState<
    Array<{
      x: number;
      y: number;
      size: number;
      opacity: number;
    }>
  >([]);
  const ballsRef = useRef<HTMLDivElement[]>([]);
  const posRef = useRef({ mouseX: 0, mouseY: 0, distanceX: 0, distanceY: 0 });

  // 生成随机位置并检测碰撞
  const generatePosition = (existingPositions: any[]) => {
    const MIN_DISTANCE = 0.15;
    let x,
      y,
      attempts = 0;

    do {
      x = Math.random() * 0.9;
      y = Math.random() * 0.9;
      attempts++;
    } while (existingPositions.some((pos) => Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2) < MIN_DISTANCE) && attempts < 100);

    return { x, y };
  };

  // 初始化小球位置
  useEffect(() => {
    const newBalls = [];
    for (let i = 0; i < count; i++) {
      const { x, y } = generatePosition(newBalls);
      newBalls.push({
        x,
        y,
        size: Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0],
        opacity: Math.random() * 0.4 + 0.6,
      });
    }
    setBalls(newBalls);
  }, [count, sizeRange]);

  // 鼠标移动处理
  useEffect(() => {
    const handleMove = (x: number, y: number) => {
      const { mouseX, mouseY, distanceX, distanceY } = posRef.current;
      if (Math.abs(x - mouseX) >= window.innerWidth / 10) posRef.current.mouseX = x;
      if (Math.abs(y - mouseY) >= window.innerHeight / 10) posRef.current.mouseY = y;

      posRef.current.distanceX += ((x - mouseX) / window.innerWidth) * 80;
      posRef.current.distanceY += ((y - mouseY) / window.innerHeight) * 80;

      gsap.to(ballsRef.current, {
        x: -posRef.current.distanceX,
        y: -posRef.current.distanceY,
        duration: 3,
        ease: "power3.out",
      });

      posRef.current.mouseX = x;
      posRef.current.mouseY = y;
    };

    const reset = () => {
      gsap.to(ballsRef.current, {
        x: 0,
        y: 0,
        duration: 5,
        ease: "power3.out",
      });
      posRef.current.distanceX = posRef.current.distanceY = 0;
    };

    document.addEventListener("mousemove", (e) => handleMove(e.x, e.y));
    document.addEventListener("touchmove", (e) => handleMove(e.touches[0].clientX, e.touches[0].clientY));
    document.addEventListener("mouseleave", reset);
    document.addEventListener("touchend", reset);

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("mouseleave", reset);
      document.removeEventListener("touchend", reset);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0"
      style={{
        ["--scale" as any]: 1,
        transform: "translateZ(0)", // 启用GPU加速
      }}
    >
      {balls.map((ball, i) => (
        <div
          key={i}
          ref={(el) => el && (ballsRef.current[i] = el)}
          className="absolute"
          style={{
            left: `${ball.x * 100}%`,
            top: `${ball.y * 100}%`,
            width: `calc(var(--scale) * 50rem * ${ball.size})`,
            height: `calc(var(--scale) * 50rem * ${ball.size})`,
            opacity: ball.opacity,
            transform: "translateZ(0)",
          }}
        >
          <img src="/blurball.png" alt="blur ball" className="relative h-[120%] w-[120%]" />
        </div>
      ))}
    </div>
  );
};

export default BlurBalls;
