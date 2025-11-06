/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2025-04-21 09:56:53
 * @LastEditors: Capsion 373704015@qq.com
 * @LastEditTime: 2025-05-01 08:36:14
 * @FilePath: \gsap-lenis-learn\src\components\DraggableEl\index.tsx
 * @Description: 这是一个拖拽组件，让传入的元素支持拖拽，基于绝对定位，可以通过style传入fiexd来改变
 * @example:
 * 
 *  import DraggableElement from "@src/components/DraggableEl";
 *  <DraggableElement>
        <section className={["border-2 border-red-400 rounded-4xl w-[500px] h-[400px]"].join(" ")}></section>
    </DraggableElement>
 */
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useMemo } from "react";
import { type CSSProperties } from "react";

import { Highlight, themes } from "prism-react-renderer";
import codeSnippetsBlocks from "@site/src/components/CodeSwiper/data";

export interface DraggableElementProps {
  children?: React.ReactNode;
  parentElementId?: string;
  onMove?: (distance: [number, number]) => void;
  style?: CSSProperties;
  startCoords?: { x: number; y: number };
  className?: string;
}

export interface DraggableElementHandle {
  getMoveDistance: () => [number, number];
  setCoords: (x: number, y: number) => void; // 暴露方法
  parentElement: HTMLElement | null;
}

const DEFAULT_PROPS = {
  className: "",
  startCoords: { x: 0, y: 0 },
  onMove: () => {},
  parentElementId: "",
  style: {},
  children: null,
};

const DraggableElement = forwardRef<DraggableElementHandle, DraggableElementProps>((_props = {}, ref) => {
  const props = { ...DEFAULT_PROPS, ..._props };

  const draggableRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLElement | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false); // 改为使用ref跟踪状态
  const startPos = useRef(props.startCoords || { x: 0, y: 0 });
  const initialElementPos = useRef({ x: 0, y: 0 });

  const codeBlocks = Object.values(codeSnippetsBlocks);
  const codeKeys = Object.keys(codeSnippetsBlocks);
  const codeStep = useRef(1);

  useEffect(() => {
    console.log("123123123");
    parentRef.current = props.parentElementId ? document.getElementById(props.parentElementId) : null;
  }, [props.parentElementId]);

  useImperativeHandle(ref, () => ({
    getMoveDistance: () => [position.x, position.y],
    setCoords: (x: number, y: number) => setCoords(x, y), // 暴露方法
    parentElement: parentRef.current,
  }));

  const getBoundaryLimits = () => {
    if (!props.parentElementId) return null;
    if (!draggableRef.current) return null;

    let parentRect;
    if (parentRef.current) {
      parentRect = parentRef.current.getBoundingClientRect();
    } else {
      parentRect = document.body.getBoundingClientRect();
    }

    const elementRect = draggableRef.current.getBoundingClientRect();

    return {
      minX: 0,
      minY: 0,
      maxX: parentRect.width - elementRect.width,
      maxY: parentRect.height - elementRect.height,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true; // 直接修改ref
    startPos.current = { x: e.clientX, y: e.clientY };
    initialElementPos.current = { x: position.x, y: position.y };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const setCoords = (x: number, y: number) => {
    let newX = x;
    let newY = y;

    // 应用边界限制
    const limits = getBoundaryLimits();
    if (limits) {
      newX = Math.max(limits.minX, Math.min(newX, limits.maxX));
      newY = Math.max(limits.minY, Math.min(newY, limits.maxY));
    }

    setPosition({ x: newX, y: newY });
    props.onMove([newX, newY]); // 触发移动回调
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || !draggableRef.current) return; // 使用ref判断

    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;

    let newX = initialElementPos.current.x + dx;
    let newY = initialElementPos.current.y + dy;

    setCoords(newX, newY);
  };

  const handleMouseUp = () => {
    isDragging.current = false; // 修改ref状态
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      className={["rounded-4xl border-red-400 border-2"].join(" ")}
      ref={draggableRef}
      style={{
        ...props.style,
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: 9999,
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: "move",
        userSelect: "none",
        touchAction: "none",
      }}
      onMouseDown={handleMouseDown}
    >
      <section className={["w-full h-full text-start p-5 transition-all duration-700"].join(" ")}>
        <Highlight theme={themes.okaidia} code={codeBlocks[codeStep.current]} language={codeKeys[codeStep.current]}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre style={style}>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  <span className={["mr-3"].join(" ")}>{i + 1}</span>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </section>
    </div>
  );
});

export default DraggableElement;
