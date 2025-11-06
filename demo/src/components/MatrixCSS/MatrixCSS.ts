import PerspectiveTransform from "@site/src/utils/PerspectiveTransform";

export interface MatrixCSSOptions {
  element: HTMLElement;
  width: number;
  height: number;
  bg_width?: number;
  bg_height?: number;
  ratio?: number;
}

export interface Point {
  x: number;
  y: number;
}

export type ResizablePoint = Point | [number, number];

export class MatrixCSS {
  private stylePrefix: string = "";
  private dpr: number = 1;
  public useDPRFix: boolean = false;
  private transformStyleName: string = "";
  private transformOriginDomStyleName: string = "";

  private element: HTMLElement;
  private style: CSSStyleDeclaration;
  private ratio: number;
  private width: number;
  private height: number;
  private transform: PerspectiveTransform;

  constructor(options: MatrixCSSOptions) {
    const { element, width, height, bg_width, bg_height, ratio } = options;

    this.element = element;
    this.style = element.style;
    this.width = width;
    this.height = height;
    this.ratio = ratio || (bg_width && width ? bg_width / width : 1);

    this._setTransformStyleName();

    this.transform = new PerspectiveTransform(
      element, // 根据之前重构的 PerspectiveTransform 构造函数参数添加
      width,
      height,
      true
    );
  }

  private _setTransformStyleName(): void {
    const testStyle = document.createElement("div").style;
    this.stylePrefix = "webkitTransform" in testStyle ? "webkit" : "MozTransform" in testStyle ? "Moz" : "msTransform" in testStyle ? "ms" : "";

    this.transformStyleName = this.stylePrefix + (this.stylePrefix.length > 0 ? "Transform" : "transform");
    this.transformOriginDomStyleName = `-${this.stylePrefix.toLowerCase()}-transform-origin`;
  }

  public getTransformOrigin(points: { leftTop?: ResizablePoint; rightTop?: ResizablePoint; leftDown?: ResizablePoint; rightDown?: ResizablePoint; ratio?: number }): string {
    const { leftTop, rightTop, leftDown, rightDown, ratio } = points;

    if (ratio) this.ratio = ratio;

    const oldTransformOrigin = window.getComputedStyle(this.element).getPropertyValue("transform-origin");

    if (leftTop) this.transform.topLeft = this.resize(leftTop);
    if (rightTop) this.transform.topRight = this.resize(rightTop);
    if (leftDown) this.transform.bottomLeft = this.resize(leftDown);
    if (rightDown) this.transform.bottomRight = this.resize(rightDown);

    const style = this.transform.update(oldTransformOrigin);
    this.style[this.transformStyleName as any] = style;
    return style;
  }

  /**
   * 渲染变换矩阵样式
   * @param points 变换点位参数
   * @param points.leftTop 左上角点位
   * @param points.rightTop 右上角点位
   * @param points.leftDown 左下角点位
   * @param points.rightDown 右下角点位
   * @param points.ratio 缩放比例
   * @returns 当前实例,支持链式调用
   */
  public render(points: { leftTop?: ResizablePoint; rightTop?: ResizablePoint; leftDown?: ResizablePoint; rightDown?: ResizablePoint; ratio?: number }): this {
    let style = this.getTransformOrigin(points);

    if (this.useDPRFix) {
      style = `scale(${this.dpr},${this.dpr})perspective(1000px)${style}translateZ(${(1 - this.dpr) * 1000}px)`;
      this.style[this.transformStyleName as any] = style;
    }

    return this;
  }

  private resize(point: ResizablePoint): Point {
    if ("x" in point) {
      return {
        x: Math.floor(point.x * this.ratio),
        y: Math.floor(point.y * this.ratio),
      };
    }
    return {
      x: Math.floor(point[0] * this.ratio),
      y: Math.floor(point[1] * this.ratio),
    };
  }
}

export default MatrixCSS;
