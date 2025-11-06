import React from "react";
import styles from "./style.module.css";
import { type } from "@generated/site-storage";

interface BubbleStyle {
  "--size": string;
  "--distance": string;
  "--position": string;
  "--time": string;
  "--delay": string;
}

const DEFAULT_PROPS = { count: 20 };

export type BubblesProps = typeof DEFAULT_PROPS;

const FooterBubbles: React.FC = (props: BubblesProps) => {
  props = { ...DEFAULT_PROPS, ...props };

  const bubbles: BubbleStyle[] = Array.from({ length: props.count }).map(() => ({
    "--size": `${2 + Math.random() * 4}rem`,
    "--distance": `${6 + Math.random() * 4}rem`,
    "--position": `${-5 + Math.random() * 110}%`,
    "--time": `${2 + Math.random() * 2}s`,
    "--delay": `${-1 * (2 + Math.random() * 2)}s`,
  }));

  return (
    <div className={styles.bubbles}>
      {bubbles.map((eachStyle, i) => (
        <div key={i} className={styles.bubble} style={eachStyle}></div>
      ))}
    </div>
  );
};

const SvgFilter: React.FC = () => (
  <svg style={{ position: "fixed", top: "100vh" }}>
    <defs>
      <filter id="blob">
        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="blob" />
      </filter>
    </defs>
  </svg>
);

const Footer: React.FC = () => {
  return (
    <div className={styles.footer}>
      <FooterBubbles />
      <div className={styles.background}></div>
      <SvgFilter />
    </div>
  );
};

export default Footer;
