import * as utils from "./utils";
import { throttle } from "lodash";

export interface BubbleProps {
  DEBUG?: boolean;
  image?: string;
  width?: number;
  height?: number;
  offsetX?: number;
  offsetY?: number;
  bubbleSize?: number;
  bubbleCount?: number; // 泡泡数量步长，默认10
  bubbleSizeMin?: number; // 泡泡的最小尺寸
  intervalTime?: number;
  bubbleScale?: number;
  positionElementId?: string;
  opacity?: number;
  opacityMax?: number;
  opacitymin?: number;
  autoSwitch?: boolean;
  bubbleRangeId?: string;
  hoverGather?: boolean;
}

export class CpsBubbleComponent {
  private DEFAULT_PROPS: BubbleProps = {
    DEBUG: process.env.NODE_ENV === "development", // 是否开启调试模式
    positionElementId: "CpsBubble.positionElement", // 用于定位的元素id，泡泡文字会在这个元素的范围内生成
    image: "/logo/capsion.png",
    offsetX: 0,
    offsetY: 0,
    width: 600,
    height: 200,
    bubbleScale: 1,
    bubbleSize: 10,
    bubbleCount: 10,
    bubbleSizeMin: 5,
    intervalTime: 8000, // 泡泡往复的时间，这里需要重构
    opacityMax: 0.9,
    opacitymin: 0.7,
    autoSwitch: true,
    bubbleRangeId: "body",
    hoverGather: true,
  };
  private props: BubbleProps = {};
  private pointArray = [];
  public INTERVAL_LIST = [];
  private id = "CpsBubble";

  private dom: HTMLElement; // 组成字母的范围参考元素
  private positionElement: HTMLElement;
  private bubbleRegionElement: HTMLElement; // 用来批量挂载泡泡的容器，不起到任何作用，但是泡泡都在这个容器内部
  private bubbleDisperseRangeElement: HTMLElement;
  private bubbleElementList: HTMLDivElement[] = []; // 存放所有泡泡div实例
  private isGather = true;

  private resizeGatherIntervalID: NodeJS.Timeout;
  private observer: MutationObserver; // 监听元素变化，可以修复首次加载时，位置元素会变化的问题
  private observerSize: ResizeObserver;

  private initialWidth = 0;
  private initialHeight = 0;

  private _oldRegion: [number, number, number, number] = [0, 0, 0, 0];

  constructor(props) {
    this.props = { ...this.DEFAULT_PROPS, ...props };
    if (this.props.DEBUG) console.log("CpsBubbleComponent create");

    this.init();
  }

  public test = () => {
    // 按钮1
    const baseStyle = { pointerEvents: "auto", width: "100px", heigh: "60px", backgroundColor: "green" };
    const testButtonElement = document.createElement("button");
    testButtonElement.innerText = "切换";
    testButtonElement.onclick = () => this.onTest();
    Object.assign(baseStyle, testButtonElement.style);
    this.dom.appendChild(testButtonElement);

    // 按钮2
    const testButtonElement2 = document.createElement("button");
    testButtonElement2.innerText = "destroy";
    testButtonElement2.onclick = this.destroy;
    Object.assign(baseStyle, testButtonElement2.style);
    this.dom.appendChild(testButtonElement2);
  };

  private onTest = () => {
    if (this.props.DEBUG) console.log("onTest: ");
    const rect = this.positionElement.getBoundingClientRect();
    console.log("pointArray: ", this.pointArray);
    console.log("rect: ", rect);

    this.switch();
  };

  public init = () => {
    if (this.props.DEBUG) console.log("CpsBubbleComponent: init()");

    this.positionElement = document.getElementById(this.props.positionElementId);
    if (!this.positionElement) {
      console.error("CpsBubbleComponent: init() 未找到定位元素:positionElement");
      return false;
    }

    const rect = this.positionElement.getBoundingClientRect();
    const baseStyle = {
      position: "absolute",
      left: `${rect.x}`,
      y: rect.y,
      width: `${this.props.width}px`,
      height: `${this.props.height}px`,
    };

    // 创建元素
    const existingDom = document.getElementById(this.id);
    if (existingDom) {
      if (this.props.DEBUG) console.warn("页面已经存在对应id元素");
      return;
    }

    this.dom = utils.createCoverElement(this.props.positionElementId, baseStyle).element;
    this.dom.id = this.id;
    if (this.props.hoverGather) {
      this.dom.className = "bubbleWarp";
      this.dom.onmouseenter = this.gatherData;
      this.dom.onmouseleave = this.disperseData;
    }

    if (this.props.bubbleRangeId == "body") {
      this.bubbleDisperseRangeElement = document.body;
    } else {
      this.bubbleDisperseRangeElement = document.getElementById(this.props.bubbleRangeId);
    }

    // 创建 MutationObserver 来监听目标元素位置变化，重新修正泡泡位置
    this.observer = new MutationObserver(this.onRise);
    this.observer.observe(this.positionElement, { attributes: true, childList: true, subtree: true });

    // 创建尺寸改变事件，重新修正拼凑的尺寸
    this.observerSize = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const { width, height } = entry.contentRect;
        console.log(`positionElement元素新尺寸：${width}px x ${height}px`);
      });
    });
    this.observerSize.observe(this.positionElement);

    // 监听窗口大小变化，确保新元素尺寸同步更新
    window.addEventListener("resize", this.onRise);

    // 默认将背景挂载到body上
    document.body.appendChild(this.dom);

    setTimeout(() => {
      // 创建泡泡并挂载到body
      this.createPointData(rect.width, rect.height);

      // 添加DEBUG控制按钮
      if (this.props.DEBUG) this.test();
    }, 1000);

    return true;
  };

  public switch = () => {
    this.isGather ? this.disperseData() : this.gatherData();

    this.isGather = !this.isGather;
  };

  public onRise = throttle(() => this.updatePositions(), 200);

  /**
   * @description: 更新整个组件的位置，组件位置与传入的props.positionElementId 绑定
   */
  public updatePositions = () => {
    if (this.props.DEBUG) console.log("触发  updatePositions");
    if (this.resizeGatherIntervalID) clearTimeout(this.resizeGatherIntervalID);

    // 进行扩散，然后重新计算元素位置
    // if (this.isGather) this.disperseData();
    if (!this.isGather) this.gatherData();

    const rect = this.positionElement.getBoundingClientRect();
    this.dom.style.width = `${rect.width}px`;
    this.dom.style.height = `${rect.height}px`;
    this.dom.style.left = `${rect.left + this.props.offsetX}px`;
    this.dom.style.top = `${rect.top + this.props.offsetY}px`;

    // 进行聚合，在聚合中会根据实际元素是否改变而重新计算泡泡位置
    this.resizeGatherIntervalID = setTimeout(() => {
      // this.gatherData();
      this.disperseData();
    }, 1000);
  };

  private createPointData = async (width: number, height: number) => {
    if (this.props.DEBUG) console.log("触发  updateBubblePosition");
    width = Math.trunc(width);
    height = Math.trunc(height);

    let canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    canvas.width = width;
    canvas.height = height;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = this.props.image;

    // 使用 Promise 封装图片加载过程
    const data = await this.loadImage(img, width, height, ctx);
    this.createBubble(data, width, height);
    canvas.remove();
  };

  private loadImage = (img: HTMLImageElement, width: number, height: number, ctx: CanvasRenderingContext2D) => {
    return new Promise<Uint8ClampedArray>((resolve, reject) => {
      img.onload = () => {
        try {
          // 图片加载完成后，绘制到 canvas 上并获取 image data
          ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);
          const data = ctx.getImageData(0, 0, width, height).data;
          resolve(data);
        } catch (error) {
          reject("Error loading image data");
        }
      };

      img.onerror = (error) => {
        reject("Error loading image");
      };
    });
  };

  private createBubble = (data: Uint8ClampedArray, w: number, h: number) => {
    if (this.props.DEBUG) console.log("触发  createBubble");
    const DEFAULT_DELAY = 12000;
    const number = this.props.bubbleCount;
    for (let i = 0; i < w; i += number) {
      for (let j = 0; j < h; j += number) {
        if (data[(i + j * w) * 4 + 3] > 150) {
          this.pointArray.push({ x: Math.trunc(i), y: Math.trunc(j) });
        }
      }
    }

    this.bubbleRegionElement = document.createElement("div");
    this.bubbleRegionElement.id = "CpsBubble.bubbleRegionElement";
    const transition = "all .8s cubic-bezier(0.4, 0, 0.2, 1) 0s";
    Object.assign(this.bubbleRegionElement.style, {
      position: "absolute",
      transition,
      pointerEvent: "none",
      top: 0,
      left: 0,
      width: "100vw",
      height: "0",
      opacity: 0,
    });

    const rect = this.positionElement.getBoundingClientRect();
    this.initialWidth = rect.width;
    this.initialHeight = rect.height;
    const offsetX = Math.trunc(rect.left + this.props.offsetX);
    const offsetY = Math.trunc(rect.top + this.props.offsetY);
    this._oldRegion = [offsetX, offsetY, rect.width, rect.height];

    this.pointArray.forEach((item, i) => {
      const r = (Math.random() * this.props.bubbleSizeMin + this.props.bubbleSizeMin) * this.props.bubbleScale;
      const opacity = this.props.opacity ? this.props.opacity : Math.random() * this.props.opacitymin + this.props.opacitymin;

      const delay = Math.floor(Math.random() * (DEFAULT_DELAY / 3));
      const start = DEFAULT_DELAY / 2 - delay;

      // 泡泡外层容器，主要用来保证泡泡扩散和聚合位置移动
      const eachBubbleWarpStyle = {
        position: "absolute",
        borderRadius: "50%",
        left: `${item.x + offsetX}px`,
        top: `${item.y + offsetY}px`,
        transition,
        pointerEvents: "none",
        willChange: "transform",
        opacity: 1,
      };

      // 泡泡内层容器，主要用来保证泡泡自身上下浮动和比例大小
      const eachBubbleStyle = {
        width: `${r}px`,
        height: `${r}px`,
        opacity,
        backgroundColor: utils.getRandomColor(),
        borderRadius: "50%",
        animation: `up-and-down-${(i % 2) + 1} ${start}ms ease-in-out ${delay}ms infinite`,
        pointerEvents: "none",
      };

      const eachBubbleElement = document.createElement("div");
      Object.assign(eachBubbleElement.style, eachBubbleStyle);

      const eachBubbleWarpElement = document.createElement("div");
      Object.assign(eachBubbleWarpElement.style, eachBubbleWarpStyle);

      eachBubbleWarpElement.appendChild(eachBubbleElement);

      this.bubbleElementList.push(eachBubbleWarpElement);
      this.bubbleRegionElement.appendChild(eachBubbleWarpElement);
    });

    document.body.appendChild(this.bubbleRegionElement);
    setTimeout(() => (this.bubbleRegionElement.style.opacity = "1"));
  };

  public gatherCenter = () => {
    const newStyle: any = {
      transform: `translate(0,0)`,
      opacity: 0,
    };

    requestAnimationFrame(() => {
      this.bubbleElementList.forEach((bubbleElement, i) => {
        Object.assign(bubbleElement.style, newStyle);
      });
    });
  };

  public gatherData = () => {
    requestAnimationFrame(() => {
      const rect = this.positionElement.getBoundingClientRect();
      const scaleX = rect.width / this.initialWidth;
      const scaleY = rect.height / this.initialHeight;
      console.log(scaleX, scaleY);

      this.bubbleElementList.forEach((bubbleElement, i) => {
        const newStyle: any = {
          transform: `translate(${0 + this.props.offsetX},${0 + this.props.offsetY})`,
        };

        const oldTop = this.pointArray[i].x;
        const newTop = this.pointArray[i].x + rect.left + this.props.offsetX;
        const oldLeft = this.pointArray[i].y;
        const newLeft = this.pointArray[i].y + rect.top + this.props.offsetY;
        const isPositionChanged = oldTop != newTop || oldLeft != newLeft;

        if (isPositionChanged) {
          newStyle.left = `${(this.pointArray[i].x + rect.left + this.props.offsetX) * scaleX}px`;
          newStyle.top = `${(this.pointArray[i].y + rect.top + this.props.offsetY) * scaleY}px`;
        }

        Object.assign(bubbleElement.style, newStyle);
      });

      this.isGather = true;
    });
  };

  public disperseData = () => {
    if (!this.bubbleDisperseRangeElement) return console.warn("bubble: 无法获取dom或者positionElement");

    // 获取泡泡的扩散范围
    const sideRect = this.bubbleDisperseRangeElement.getBoundingClientRect();

    // 计算样式
    const newStlyeList = this.bubbleElementList.map((item) => {
      const { left, top } = item.getBoundingClientRect();

      let coords = utils.getRandomPointByDOMRect(sideRect);
      while (
        coords[0] > sideRect.width + sideRect.left + this.props.bubbleSizeMin ||
        coords[1] > sideRect.height + sideRect.top + this.props.bubbleScale
      ) {
        coords = utils.getRandomPointByDOMRect(sideRect);
      }
      const offsetX = coords[0] - left;
      const offsetY = coords[1] - top;

      return { transform: `translate(${offsetX}px, ${offsetY}px)` };
    });

    // 更新样式
    requestAnimationFrame(() => {
      this.bubbleElementList.forEach((bubbleElement, i) => {
        Object.assign(bubbleElement.style, newStlyeList[i]);
        this.isGather = false;
      });
    });
  };

  public destroy = () => {
    try {
      window.removeEventListener("resize", this.onRise);
      if (this.observer) this.observer.disconnect();
      if (this.observerSize) this.observerSize.disconnect();

      if (this.dom) {
        document.body.removeChild(this.dom);
        this.dom = null;
      }

      if (this.bubbleRegionElement) {
        if (this.bubbleRegionElement.style) this.bubbleRegionElement.style.opacity = "0";
        document.body.removeChild(this.bubbleRegionElement);
        this.bubbleRegionElement = null;
      }

      setTimeout(() => {
        if (this.props.DEBUG) console.log("destroy::");
      }, 100);
    } catch (err) {
      console.log("destroy::err", err);
    }
  };
}
