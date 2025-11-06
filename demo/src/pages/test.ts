import { useRef, useEffect } from "react";
import { gsap } from "gsap";
// import customEase from "gsap/customEase";

// gsap.registerPlugin(customEase);

type TrailConfig = {
  interval?: number; // 轨迹处理间隔(ms)
  spacing?: number; // 元素生成间隔(像素)
  size?: number; // 元素尺寸
  color?: string;
  duration?: number;
};

export const useSmartTrail = (config?: TrailConfig) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const points = useRef<{ x: number; y: number; timestamp: number }[]>([]);
  const pendingDistance = useRef(0);
  const lastProcessedIndex = useRef(-1);

  const { interval = 50, spacing = 25, size = 8, color = "#ff6b6b", duration = 0.8 } = config || {};

  // 轨迹处理核心逻辑
  const processTrailSegment = () => {
    if (points.current.length < 2) return;

    let totalDistance = pendingDistance.current;
    let startIndex = Math.max(lastProcessedIndex.current, 0);

    // 遍历轨迹点计算距离
    for (let i = startIndex; i < points.current.length - 1; i++) {
      const p1 = points.current[i];
      const p2 = points.current[i + 1];

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const segmentDistance = Math.sqrt(dx * dx + dy * dy);
      const segmentVector = { x: dx / segmentDistance, y: dy / segmentDistance };

      // 沿轨迹生成元素
      while (totalDistance + segmentDistance >= spacing) {
        const consume = spacing - totalDistance;
        const ratio = consume / segmentDistance;

        const x = p1.x + segmentVector.x * consume;
        const y = p1.y + segmentVector.y * consume;
        createParticle(x, y);

        totalDistance = 0;
        pendingDistance.current = segmentDistance - consume;
      }

      totalDistance += segmentDistance;
      lastProcessedIndex.current = i;
    }

    // 清理旧数据
    const now = Date.now();
    points.current = points.current.filter((p) => now - p.timestamp < interval * 2);
  };

  // 创建粒子（带对象池优化）
  const particlePool = useRef<HTMLDivElement[]>([]);
  const createParticle = (x: number, y: number) => {
    const el = particlePool.current.find((p) => !p.isConnected) || document.createElement("div");

    Object.assign(el.style, {
      position: "fixed",
      pointerEvents: "none",
      borderRadius: "50%",
      width: `${size}px`,
      height: `${size}px`,
      background: color,
      left: `${x - size / 2}px`,
      top: `${y - size / 2}px`,
      opacity: "0.8",
    });

    if (!el.isConnected) {
      containerRef.current?.appendChild(el);
      particlePool.current.push(el);
    }

    // 动画序列
    gsap.killTweensOf(el);
    gsap.to(el, {
      y: window.innerHeight + 100,
      opacity: 0,
      duration,
      ease: "power2.in",
      overwrite: true,
    });
  };

  // 事件监听与定时处理
  useEffect(() => {
    let timer: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      points.current.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now(),
      });
    };

    const startProcessing = () => {
      timer = setInterval(() => {
        processTrailSegment();
        pendingDistance.current = 0;
      }, interval);
    };

    window.addEventListener("mousemove", handleMouseMove);
    startProcessing();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(timer);
      particlePool.current.forEach((el) => el.remove());
    };
  }, []);

  return containerRef;
};
