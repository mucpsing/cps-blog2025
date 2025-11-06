/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2025-05-28 15:34:12
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2025-11-03 10:31:32
 * @FilePath: \cps-blog\demo\src\components\DraggButton\index.tsx
 * @Description: 弹力球带拉扯线
 */
// 导入新版 GSAP 模块
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(Draggable);

// 配置类型定义（扁平结构）
interface WidgetConfig {
  particleCount: number; // 粒子数量
  minParticleSize: number; // 最小粒子尺寸
  maxParticleSize: number; // 最大粒子尺寸
  particleColor: string; // 粒子颜色
  lineColor: string; // 连线颜色
  baseColor: string; // 按钮底层颜色
  mainColor: string; // 按钮主颜色
  highlightColor: string; // 按钮高亮颜色
  textColor: string; // 按钮文字颜色
  buttonText: string; // 按钮显示文字
}

// 默认配置（扁平化）
const DEFAULT_CONFIG: WidgetConfig = {
  particleCount: 15,
  minParticleSize: 7,
  maxParticleSize: 15,
  particleColor: "silver",
  lineColor: "rgba(0,0,0,0.8)",
  baseColor: "rgba(0,0,0,0.2)",
  mainColor: "#d50027",
  highlightColor: "#ff002f",
  textColor: "white",
  buttonText: "LET ME GO",
};

class InteractiveWidget {
  private config: WidgetConfig;
  private container: HTMLElement;
  private svgElement: SVGSVGElement;
  private centerButton: SVGGElement;
  private positionsX: number[] = [];
  private positionsY: number[] = [];
  private centerX: number = 0;
  private centerY: number = 0;
  private draggableInstance?: Draggable[]; // 新增拖拽实例引用

  constructor(container: HTMLElement, userConfig?: Partial<WidgetConfig>) {
    // 合并配置
    this.config = { ...DEFAULT_CONFIG, ...userConfig };
    this.container = container;

    // 初始化 SVG
    this.initSVG();
    this.createCenterButton();
    this.createParticles();
    this.setupDrag();

    // 新增初始化连线更新
    this.updateConnections();
  }

  // 初始化 SVG 画布
  private initSVG(): void {
    const { offsetWidth: width, offsetHeight: height } = this.container;

    this.svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svgElement.style.position = "absolute";
    // this.svgElement.style.left = "0";
    // this.svgElement.style.top = "0";
    this.svgElement.setAttribute("width", `${width}px`);
    this.svgElement.setAttribute("height", `${height}px`);
    this.svgElement.setAttribute("viewBox", `0 0 ${width} ${height}`);

    this.container.appendChild(this.svgElement);
  }

  // 创建中心按钮
  private createCenterButton(): void {
    const { baseColor, mainColor, highlightColor, textColor, buttonText } = this.config;

    this.centerButton = document.createElementNS("http://www.w3.org/2000/svg", "g");

    // 创建圆形元素
    const createCircle = (cy: number, r: number, fill: string): SVGCircleElement => {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cy", cy.toString());
      circle.setAttribute("r", r.toString());
      circle.setAttribute("fill", fill);
      return circle;
    };

    this.centerButton.appendChild(createCircle(20, 73, baseColor));
    this.centerButton.appendChild(createCircle(0, 80, mainColor));
    this.centerButton.appendChild(createCircle(-5, 75, highlightColor));

    // 创建文本元素
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.textContent = buttonText;
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-family", "Verdana");
    text.setAttribute("alignment-baseline", "middle");
    text.setAttribute("font-size", "20");
    text.setAttribute("fill", textColor);

    this.centerButton.appendChild(text);
    this.svgElement.appendChild(this.centerButton);
  }

  // 创建粒子系统
  private createParticles(): void {
    const { particleCount, minParticleSize, maxParticleSize, particleColor, lineColor } = this.config;

    for (let i = 0; i < particleCount; i++) {
      const size = this.getRandomInt(minParticleSize, maxParticleSize);
      const [x, y] = this.generatePosition();

      // 创建粒子
      const particle = this.createSVGElement("circle", {
        r: size.toString(),
        cx: x.toString(),
        cy: y.toString(),
        fill: particleColor,
        opacity: "0.7",
        stroke: "gray",
        "stroke-width": "2",
      });

      // 创建连线
      const line = this.createSVGElement("line", {
        x1: x.toString(),
        y1: y.toString(),
        // x2: x.toString(),
        // y2: y.toString(),
        x2: this.centerX.toString(),
        y2: this.centerY.toString(),
        "stroke-width": (size / 2).toString(),
        "stroke-linecap": "round",
        stroke: lineColor,
      });

      this.svgElement.insertBefore(particle, this.centerButton);
      this.svgElement.insertBefore(line, this.centerButton);
      this.positionsX.push(x);
      this.positionsY.push(y);
    }

    // 计算中心点
    // this.centerX = this.calculateCenter(this.positionsX);
    // this.centerY = this.calculateCenter(this.positionsY);
    // gsap.set(this.centerButton, { x: this.centerX, y: this.centerY });

    this.centerX = this.calculateCenter(this.positionsX);
    this.centerY = this.calculateCenter(this.positionsY);
    gsap.set(this.centerButton, {
      x: this.centerX,
      y: this.centerY,
      onComplete: () => this.updateConnections(),
    });
  }

  // 设置拖拽交互
  private setupDrag(): void {
    // 将元素包装为数组
    this.draggableInstance = Draggable.create([this.centerButton], {
      // [!code focus]
      type: "x,y",
      onDrag: () => this.updateConnections(),
      onRelease: () => {
        gsap.to(this.centerButton, {
          duration: 1,
          x: this.centerX,
          y: this.centerY,
          ease: "elastic.out(1, 0.15)",
          onUpdate: () => this.updateConnections(),
        });
      },
    });
  }

  // 更新连线
  private updateConnections(): void {
    const transform = (this.centerButton as any)._gsap;
    gsap.set("line", {
      attr: {
        x2: transform?.x || this.centerX,
        y2: transform?.y || this.centerY,
      },
    });
  }

  // 工具方法
  private getRandomInt(min: number, max: number): number {
    return min + Math.floor(Math.random() * (max - min));
  }

  private generatePosition(): [number, number] {
    const { offsetWidth: w, offsetHeight: h } = this.container;
    return [this.getRandomInt(10, w - 10), this.getRandomInt(10, h - 10)];
  }

  private calculateCenter(arr: number[]): number {
    const min = Math.min(...arr);
    return min + (Math.max(...arr) - min) / 2;
  }

  private createSVGElement<T extends keyof SVGElementTagNameMap>(tag: T, attrs: Record<string, string>): SVGElement {
    const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    return element;
  }

  public destroy(): void {
    // 1. 清除所有GSAP动画
    gsap.killTweensOf(this.centerButton);

    // 2. 销毁拖拽实例
    if (this.draggableInstance) {
      this.draggableInstance.forEach((instance) => instance.kill());
      this.draggableInstance = undefined;
    }

    // 3. 移除DOM元素
    if (this.svgElement && this.svgElement.parentNode === this.container) {
      this.container.removeChild(this.svgElement);
    }

    // 4. 清除引用帮助GC
    this.svgElement.remove();
    (this as any).svgElement = null;
    (this as any).centerButton = null;
    (this as any).container = null;
  }
}

// 类型扩展声明
declare global {
  interface Window {
    _gsap: any;
  }
}

export default InteractiveWidget;
