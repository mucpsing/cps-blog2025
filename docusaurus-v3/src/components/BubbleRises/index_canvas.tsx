import React, { useEffect, useRef } from "react";

interface Bubble {
  x: number;
  y: number;
  size: number;
  distance: number;
  time: number;
  delay: number;
}

const DEFAULT_PROPS = { count: 20 };

export type BubblesProps = typeof DEFAULT_PROPS;

const CanvasBubbles: React.FC<BubblesProps> = (props) => {
  const { count } = { ...DEFAULT_PROPS, ...props };
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bubbles: Bubble[] = Array.from({ length: count }).map(() => ({
      x: Math.random() * canvas.width,
      y: canvas.height + 50, // Start below the canvas
      size: 2 + Math.random() * 4,
      distance: 6 + Math.random() * 4,
      time: 2 + Math.random() * 2,
      delay: -1 * (2 + Math.random() * 2),
    }));

    let animationFrameId: number;

    const drawBubbles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bubbles.forEach((bubble) => {
        const progress = (performance.now() / 1000 + bubble.delay) / bubble.time;
        const y = canvas.height - (progress % 1) * (bubble.distance * 50);
        const size = bubble.size * (1 - (progress % 1));

        ctx.beginPath();
        ctx.arc(bubble.x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = "#303846";
        // ctx.filter = "blur(8px)";
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(drawBubbles);
    };

    drawBubbles();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [count]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "200px" }} />;
};

export default CanvasBubbles;
