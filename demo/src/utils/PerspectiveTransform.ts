/*
 * @Author: Capsion 373704015@qq.com
 * @Date: 2025-04-02 12:14:23
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2025-04-25 09:06:59
 * @FilePath: \gsap-lenis-learn\src\components\MatrixCSS\PerspectiveTransform2.ts
 * @Description: 
 * @example:
 *  const ms = new PerspectiveTransform(testRef.current, 200, 200, false);
    ms.topLeft = { x: -100, y: 0 };
    const tr = ms.current.update();
 */

export interface CoordsT {
  topLeft?: { x: number; y: number } | [x: number, y: number];
  topRight?: { x: number; y: number } | [x: number, y: number];
  bottomLeft?: { x: number; y: number } | [x: number, y: number];
  bottomRight?: { x: number; y: number } | [x: number, y: number];
}
export default class PerspectiveTransform {
  element: HTMLElement;
  style: CSSStyleDeclaration;
  computedStyle: CSSStyleDeclaration;
  width: number;
  height: number;
  useBackFacing: boolean;

  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };

  stylePrefix: string;
  drp: number;
  useDPRFix: boolean;
  transformStyleName: string;
  transformDomStyleName: string;
  transformOriginDomStyleName: string;
  transformOrigin: string;

  resetStyle: string; // 记录初始状态，用来配置reset

  aM: number[][] = [
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
  ];
  bM: number[] = [0, 0, 0, 0, 0, 0, 0, 0];

  constructor(element: HTMLElement, useBackFacing?: boolean) {
    this.element = element;
    this.style = element.style;
    this.computedStyle = window.getComputedStyle(element);

    const rect = element.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.useBackFacing = !!useBackFacing;

    this.topLeft = { x: 0, y: 0 };
    this.topRight = { x: rect.width, y: 0 };
    this.bottomLeft = { x: 0, y: rect.height };
    this.bottomRight = { x: rect.width, y: rect.height };

    this.stylePrefix = "";
    this.drp = 1;
    this.useDPRFix = false;
    this.transformStyleName = "";
    this.transformDomStyleName = "";
    this.transformOriginDomStyleName = "";
    this.transformOrigin = "";
    this._setTransformStyleName();

    this.resetStyle = this.createTransformStyle();
  }

  _setTransformStyleName() {
    const testStyle = this.element.style;
    this.stylePrefix = "webkitTransform" in testStyle ? "webkit" : "MozTransform" in testStyle ? "Moz" : "msTransform" in testStyle ? "ms" : "";
    this.transformStyleName = this.stylePrefix + (this.stylePrefix.length > 0 ? "Transform" : "transform");
    this.transformOriginDomStyleName = "-" + this.stylePrefix.toLowerCase() + "-transform-origin";
  }

  reset(): void {
    this.element.style.transform = this.resetStyle;
    (this.element.style as any)[this.transformStyleName] = this.resetStyle;
  }

  checkError(): number {
    if (this.hasDistancesError()) return 1;
    if (this.hasPolyonError()) return 2;
    return 0;
  }

  formatNumber(num: number, threshold = 1e-6) {
    // 处理极小的数值（防止科学计数法）
    if (Math.abs(num) < 0.000001) {
      return num === 0 ? "0" : num.toExponential().replace(/\.?0+e/, "e");
    }

    const integer = Math.round(num);
    const decimal = num - integer;

    // 当数值非常接近整数时直接返回整数
    if (Math.abs(decimal) < threshold) {
      return integer.toString();
    }

    // 处理非整数情况
    const scale = 1e6; // 精度控制参数
    const scaled = Math.round(num * scale);
    const main = Math.trunc(scaled / scale);
    const fraction = scaled % scale;

    // 拼接整数和小数部分
    return fraction === 0 ? main.toString() : `${main}.${Math.abs(fraction).toString().padStart(6, "0").replace(/0+$/, "")}`;
  }

  /**
   * @description: 核心方法，将矩阵转换后的样式字符串返回，直接作用在transform属性上
   * @return {string} :`matrix3d(1.2, 0, 0, 0, 0.2, 1, 0, 0.002, 0, 0, 1, 0, -20, 20, 0, 1)`
   */
  createTransformStyle(): string {
    const { width, height, aM, bM } = this;

    let offsetX = 0;
    let offsetY = 0;
    const offset = this.computedStyle.getPropertyValue(this.transformOriginDomStyleName);

    if (offset.includes("px")) {
      const parts = offset.split("px");
      offsetX = -parseFloat(parts[0]);
      offsetY = -parseFloat(parts[1]);
    } else if (offset.includes("%")) {
      const parts = offset.split("%");
      offsetX = (-parseFloat(parts[0]) * width) / 100;
      offsetY = (-parseFloat(parts[1]) * height) / 100;
    }

    const dst = [this.topLeft, this.topRight, this.bottomLeft, this.bottomRight];
    const arr: number[] = [0, 1, 2, 3, 4, 5, 6, 7];
    for (let i = 0; i < 4; i++) {
      aM[i][0] = aM[i + 4][3] = i & 1 ? width + offsetX : offsetX;
      aM[i][1] = aM[i + 4][4] = i > 1 ? height + offsetY : offsetY;
      aM[i][6] = (i & 1 ? -offsetX - width : -offsetX) * (dst[i].x + offsetX);
      aM[i][7] = (i > 1 ? -offsetY - height : -offsetY) * (dst[i].x + offsetX);
      aM[i + 4][6] = (i & 1 ? -offsetX - width : -offsetX) * (dst[i].y + offsetY);
      aM[i + 4][7] = (i > 1 ? -offsetY - height : -offsetY) * (dst[i].y + offsetY);
      bM[i] = dst[i].x + offsetX;
      bM[i + 4] = dst[i].y + offsetY;
      aM[i][2] = aM[i + 4][5] = 1;
      aM[i][3] = aM[i][4] = aM[i][5] = 0;
      aM[i + 4][0] = aM[i + 4][1] = aM[i + 4][2] = 0;
    }

    const col: number[] = [];
    for (let j = 0; j < 8; j++) {
      for (let i = 0; i < 8; i++) col[i] = aM[i][j];
      for (let i = 0; i < 8; i++) {
        const row = aM[i];
        const kmax = Math.min(i, j);
        let sum = 0.0;
        for (let k = 0; k < kmax; k++) sum += row[k] * col[k];
        row[j] = col[i] -= sum;
      }

      let p = j;
      for (let i = j + 1; i < 8; i++) {
        if (Math.abs(col[i]) > Math.abs(col[p])) p = i;
      }

      if (p !== j) {
        for (let k = 0; k < 8; k++) {
          [aM[p][k], aM[j][k]] = [aM[j][k], aM[p][k]];
        }
        [arr[p], arr[j]] = [arr[j], arr[p]];
      }

      if (aM[j][j] !== 0.0) {
        for (let i = j + 1; i < 8; i++) aM[i][j] /= aM[j][j];
      }
    }

    for (let i = 0; i < 8; i++) arr[i] = bM[arr[i]];
    for (let k = 0; k < 8; k++) {
      for (let i = k + 1; i < 8; i++) arr[i] -= arr[k] * aM[i][k];
    }
    for (let k = 7; k >= 0; k--) {
      arr[k] /= aM[k][k];
      for (let i = 0; i < k; i++) arr[i] -= arr[k] * aM[i][k];
    }

    // const ft = (tar: number[], i: number) => tar[i].toFixed(9);
    // const style = `matrix3d(${[
    //   ft(arr, 0),
    //   ft(arr, 3),
    //   "0",
    //   ft(arr, 6),
    //   ft(arr, 1),
    //   ft(arr, 4),
    //   "0",
    //   ft(arr, 7),
    //   "0,0,1,0",
    //   ft(arr, 2),
    //   ft(arr, 5),
    //   "0",
    //   "1",
    // ].join(", ")})`;
    const style = `matrix3d(${arr[0].toFixed(9)},${arr[3].toFixed(9)},0,${arr[6].toFixed(9)},${arr[1].toFixed(9)},${arr[4].toFixed(
      9
    )},0,${arr[7].toFixed(9)},0,0,1,0,${arr[2].toFixed(9)},${arr[5].toFixed(9)},0,1)`;

    return style;
  }

  /**
   * @description: 使用绝对位置信息来生成矩阵变换
   */
  update(): void {
    const style = this.createTransformStyle();

    (this.element.style as any)[this.transformStyleName] = style;
  }

  /**
   * @description: 相对偏移量来生成矩阵变换
   * @example
   *martrixInstance.current = new PerspectiveTransform(el.current as HTMLDivElement, false);
   * 
   *martrixInstance.render({
      topLeft: { x: 50, y: 0 },
      topRight: { x: 50, y: 0 },
      bottomLeft: { x: -50, y: 0 },
      bottomRight: { x: -50, y: 0 },
    });
   */
  render({ topLeft, topRight, bottomLeft, bottomRight }: CoordsT): void {
    if (topLeft) this.coordsAppend(this.topLeft, topLeft);
    if (topRight) this.coordsAppend(this.topRight, topRight);
    if (bottomLeft) this.coordsAppend(this.bottomLeft, bottomLeft);
    if (bottomRight) this.coordsAppend(this.bottomRight, bottomRight);

    this.update();
  }

  /**
   * @description: 通过相对偏移量来实现对元素的矩阵变换，另外一种方法是修改实例的topLeft、topRight、bottomLeft、bottomRight
   * @param {object} sourcsCoords
   * @param {object} appCoords
   */
  private coordsAppend(sourcsCoords: { x: number; y: number }, appCoords: { x: number; y: number } | [x: number, y: number]) {
    if (Array.isArray(appCoords)) {
      appCoords = { x: appCoords[0], y: appCoords[1] };
    }
    sourcsCoords.x += appCoords.x;
    sourcsCoords.y += appCoords.y;
  }

  private hasDistancesError(): boolean {
    const points = [
      [this.topLeft, this.topRight],
      [this.bottomLeft, this.bottomRight],
      [this.topLeft, this.bottomLeft],
      [this.topRight, this.bottomRight],
      [this.topLeft, this.bottomRight],
      [this.topRight, this.bottomLeft],
    ];

    for (const [p1, p2] of points) {
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      if (Math.sqrt(dx * dx + dy * dy) <= 1) return true;
    }
    return false;
  }

  private getDeterminant(p0: { x: number; y: number }, p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    return p0.x * p1.y + p1.x * p2.y + p2.x * p0.y - p0.y * p1.x - p1.y * p2.x - p2.y * p0.x;
  }

  private hasPolyonError(): boolean {
    const det1 = this.getDeterminant(this.topLeft, this.topRight, this.bottomRight);
    const det2 = this.getDeterminant(this.bottomRight, this.bottomLeft, this.topLeft);

    if (this.useBackFacing) {
      if (det1 * det2 <= 0) return true;
    } else {
      if (det1 <= 0 || det2 <= 0) return true;
    }

    const det3 = this.getDeterminant(this.topRight, this.bottomRight, this.bottomLeft);
    const det4 = this.getDeterminant(this.bottomLeft, this.topLeft, this.topRight);

    if (this.useBackFacing) {
      if (det3 * det4 <= 0) return true;
    } else {
      if (det3 <= 0 || det4 <= 0) return true;
    }

    return false;
  }
}
