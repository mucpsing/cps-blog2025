import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface TextSwitcherProps {
  texts: string[];
  interval?: number;
}

const TextSwitcher: React.FC<TextSwitcherProps> = ({ texts, interval = 2000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);
  const animation = useRef<gsap.core.Timeline>(null);

  useEffect(() => {
    if (texts.length <= 1) return;

    // 初始化容器宽度
    const setContainerWidth = () => {
      if (containerRef.current && currentRef.current) {
        containerRef.current.style.width = `${currentRef.current.offsetWidth}px`;
      }
    };

    // 创建动画时间轴
    animation.current = gsap
      .timeline({ paused: true })
      .to(currentRef.current, {
        yPercent: -100,
        duration: 0.6,
        ease: "power2.inOut",
      })
      .fromTo(nextRef.current, { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: "power2.inOut" }, 0)
      .to(
        containerRef.current,
        {
          width: () => nextRef.current?.offsetWidth,
          duration: 0.6,
          ease: "power2.inOut",
        },
        0
      )
      .eventCallback("onComplete", () => {
        setCurrentIndex((prev) => (prev + 1) % texts.length);
        gsap.set(currentRef.current, { yPercent: 0 });
        gsap.set(nextRef.current, { yPercent: 100 });
        setContainerWidth();
      });

    return () => {
      animation.current?.kill();
    };
  }, [texts]);

  useEffect(() => {
    if (texts.length <= 1) return;

    const timer = setInterval(() => {
      // 准备下一个内容
      const nextIndex = (currentIndex + 1) % texts.length;
      if (nextRef.current) {
        nextRef.current.textContent = texts[nextIndex];
      }
      // 触发动画
      animation.current?.restart();
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, interval, texts]);

  if (texts.length === 0) return null;
  if (texts.length === 1) return <div>{texts[0]}</div>;

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        display: "inline-block",
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
    >
      <div
        ref={currentRef}
        style={{
          position: "relative",
          display: "inline-block",
        }}
      >
        {texts[currentIndex]}
      </div>
      <div
        ref={nextRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          y: "100%",
          display: "inline-block",
        }}
      >
        {texts[(currentIndex + 1) % texts.length]}
      </div>
    </div>
  );
};

export default TextSwitcher;
