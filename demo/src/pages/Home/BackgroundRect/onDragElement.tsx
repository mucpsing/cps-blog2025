import { useRef, useCallback, useEffect, RefObject, MouseEvent, TouchEvent } from "react";

type DragState = {
  isDragging: boolean;
  startX: number;
  startY: number;
  translateX: number;
  translateY: number;
  element: HTMLElement | null;
};

type TransformValues = {
  translateX: number;
  translateY: number;
};

type DragEvent = MouseEvent | TouchEvent;

const useDrag = () => {
  const stateRef = useRef<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    translateX: 0,
    translateY: 0,
    element: null,
  });

  // 增强版 transform 解析函数
  const parseTransform = (transform: string): TransformValues => {
    let translateX = 0,
      translateY = 0;

    // 1. 优先解析 3D 矩阵变换
    const matrix3dMatch = transform.match(/matrix3d$([^)]+)$/);
    if (matrix3dMatch) {
      const matrix = matrix3dMatch[1].split(",").map(Number);
      return {
        translateX: matrix[12] || 0,
        translateY: matrix[13] || 0,
      };
    }

    // 2. 解析 2D 矩阵变换
    const matrixMatch = transform.match(/matrix$([^)]+)$/);
    if (matrixMatch) {
      const matrix = matrixMatch[1].split(",").map(Number);
      return {
        translateX: matrix[4] || 0,
        translateY: matrix[5] || 0,
      };
    }

    // 3. 解析 translate() 简写形式
    const translateMatch = transform.match(/translate(?:3d)?$([^)]+)$/);
    if (translateMatch) {
      const parts = translateMatch[1].split(/,\s*/);
      const [xPart, yPart] = parts;

      // 处理百分比单位
      const element = stateRef.current.element;
      if (element) {
        if (xPart.includes("%")) {
          const percent = parseFloat(xPart) / 100;
          translateX = percent * element.offsetWidth;
        } else {
          translateX = parseFloat(xPart) || 0;
        }

        if (yPart.includes("%")) {
          const percent = parseFloat(yPart) / 100;
          translateY = percent * element.offsetHeight;
        } else {
          translateY = parseFloat(yPart) || 0;
        }
      }
      return { translateX, translateY };
    }

    // 4. 解析独立 translateX/Y
    const xMatch = transform.match(/translateX$([^)]+)$/);
    const yMatch = transform.match(/translateY$([^)]+)$/);

    if (xMatch) {
      const value = xMatch[1];
      if (value.includes("%") && stateRef.current.element) {
        translateX = (parseFloat(value) / 100) * stateRef.current.element.offsetWidth;
      } else {
        translateX = parseFloat(value);
      }
    }

    if (yMatch) {
      const value = yMatch[1];
      if (value.includes("%") && stateRef.current.element) {
        translateY = (parseFloat(value) / 100) * stateRef.current.element.offsetHeight;
      } else {
        translateY = parseFloat(value);
      }
    }

    return { translateX, translateY };
  };

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    const state = stateRef.current;
    if (!state.isDragging || !state.element) return;

    // 获取当前坐标
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    // 计算增量
    const deltaX = clientX - state.startX;
    const deltaY = clientY - state.startY;

    // 更新当前位置
    state.translateX += deltaX;
    state.translateY += deltaY;

    // 应用新位置
    state.element.style.transform = `translate(${state.translateX}px, ${state.translateY}px)`;

    // 更新起点坐标（关键修复）
    state.startX = clientX;
    state.startY = clientY;
  }, []);

  const handleMouseUp = useCallback(() => {
    stateRef.current.isDragging = false;
    cleanup();
  }, []);

  const cleanup = useCallback(() => {
    document.removeEventListener("mousemove", handleMouseMove as EventListener);
    document.removeEventListener("mouseup", handleMouseUp);
    document.removeEventListener("touchmove", handleMouseMove as EventListener);
    document.removeEventListener("touchend", handleMouseUp);
  }, [handleMouseMove, handleMouseUp]);

  const startDrag = useCallback(
    (e: DragEvent, element: HTMLElement) => {
      e.preventDefault();
      e.stopPropagation();

      // 获取当前实际应用的 transform 值
      const computedStyle = window.getComputedStyle(element);
      const { translateX, translateY } = parseTransform(computedStyle.transform);

      // 初始化状态（关键修复）
      stateRef.current = {
        isDragging: true,
        startX: "touches" in e ? e.touches[0].clientX : e.clientX,
        startY: "touches" in e ? e.touches[0].clientY : e.clientY,
        translateX,
        translateY,
        element,
      };

      // 绑定事件监听
      document.addEventListener("mousemove", handleMouseMove as EventListener);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleMouseMove as EventListener, { passive: false });
      document.addEventListener("touchend", handleMouseUp);
    },
    [handleMouseMove, handleMouseUp]
  );

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return startDrag;
};

// 使用示例组件
const DraggableComponent = () => {
  const elementRef = useRef<HTMLDivElement>(null);
  const startDrag = useDrag();

  return (
    <div
      ref={elementRef}
      style={{
        transform: "translate(0px, 0px)",
        touchAction: "none",
        userSelect: "none",
        willChange: "transform", // 优化渲染性能
        position: "fixed", // 推荐使用 fixed 定位
        cursor: "grab", // 更直观的拖拽光标
        left: 0, // 确保定位基准正确
        top: 0,
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        startDrag(e, elementRef.current!);
      }}
      onTouchStart={(e) => {
        e.preventDefault();
        startDrag(e, elementRef.current!);
      }}
      onDragStart={(e) => e.preventDefault()} // 防止原生拖拽
    >
      拖拽我（修复版）
    </div>
  );
};

export default DraggableComponent;
