/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2023-03-28 16:25:46
 * @LastEditors: Capsion 373704015@qq.com
 * @LastEditTime: 2025-02-19 22:10:10
 * @FilePath: \cps-blog\src\pages\test\index.tsx
 * @Description: 泡泡文字聚散效果组建，父级元素必须采用绝对定位，最终泡泡扩散的位置会根据最近一个绝对定位的父级来生成
 */
import React from "react";
import TweenOne from "rc-tween-one";
import { throttle, type DebouncedFunc } from "lodash";

interface LogoGatherProps {
  image?: string;
  width?: number;
  height?: number;
  offsetX?: number;
  offsetY?: number;
  bubbleSize?: number;
  bubbleCount?: number; // 泡泡数量
  bubbleSizeMin?: number; // 泡泡的最小尺寸
  intervalTime?: number;
  bubbleScale?: number;
  positionElementId?: string;
  opacity?: number;
  opacityMax?: number;
  opacitymin?: number;
  autoGather?: boolean;
}

interface LogoGatherState {
  top: number | string;
  left: number | string;
  right: number | string;
  bottom: number | string;
  transform: string;

  children: any[];
  boxAnim: any;
  isMouseEnter: boolean;
  currtState: "dispersing" | "done" | "gathing";
}

declare global {
  interface Window {
    CPS_BUBBLE_ENV: { INTERVAL_LIST: any[] };
  }
}
export default class LogoGather extends React.Component<LogoGatherProps, LogoGatherState> {
  static defaultProps = {
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
    positionElementId: "", // 用于定位的元素id，组件会根据这个元素来进行绝对定位
    opacityMax: 0.8,
    opacitymin: 0.6,
    autoGather: true,
  };

  public isInit: boolean = false;
  public gather: boolean;
  public interval: null | number;
  public intervalTime: number;
  public pointArray: { x: number; y: number }[];
  public currtState: "dispersing" | "done" | "gathing" = "done";

  public dom: Element;
  public sideBox: Element;
  public sideBoxComp: Element;
  public parent: Element;
  public positionElement: Element;
  public IS_CURRT_WEB_PAGE: boolean = true;
  public resizeEvent: DebouncedFunc<() => void>;

  constructor(props) {
    super(props);
    this.state = {
      top: 0, // 初始位置进行隐藏
      left: 0, // 初始位置进行隐藏
      bottom: "unset",
      right: "unset",
      children: [],
      boxAnim: {},
      transform: null,
      isMouseEnter: false,
      currtState: "done", // dispersing|default
    };

    this.gather = true;
    this.interval = null;
  }

  init = () => {
    // 创建全局变量，这里因为采用了定时器，有时候无法获取最新的状态
    if (!window.CPS_BUBBLE_ENV) window.CPS_BUBBLE_ENV = { INTERVAL_LIST: [] };

    let isDone: boolean = false;

    // 这里必须使用setInterval防止setTimeout时，dom未完全生成
    const taskID = setInterval(() => {
      isDone = this.updatePositions();

      if (isDone) {
        clearInterval(taskID);
        this.createPointData();
        this.isInit = true;
        setTimeout(() => {
          // BUG 如果这里直接调用 this.disperseData() 则会触发找不到元素id
          this.onMouseLeave({ target: { id: "LogoGather.init" } });

          if (this.props.autoGather) {
          }
        }, 2000);
      }
    }, 100);

    document.addEventListener("visibilitychange", () => {
      var isHidden = document.hidden;

      if (isHidden) {
        this.IS_CURRT_WEB_PAGE = false;
      } else {
        this.IS_CURRT_WEB_PAGE = true;
      }
    });
  };

  componentDidMount() {
    this.dom = document.getElementById("bubbleWarp");

    this.init();

    // 防止界面更新泰国频繁
    this.resizeEvent = throttle(() => {
      // this.cleanInterval();

      this.updatePositions();
    }, 200);

    window.addEventListener("resize", this.resizeEvent);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.bubbleCount !== this.props.bubbleCount) {
      console.log("新 propse: ", this.props.bubbleCount);
      console.log("旧 propse: ", prevProps.bubbleCount);
    }

    if (prevProps.width !== this.props.width) {
      console.log("尺寸改变！");
    }
  }

  componentWillUnmount() {
    this.cleanInterval();

    window.removeEventListener("resize", this.resizeEvent);

    this.resizeEvent.cancel();
  }

  onMouseEnter = (e) => {
    if (!e || !e.target.id.startsWith("LogoGather")) return;

    this.setState({ isMouseEnter: true }, () => {
      if (!this.gather) this.updateTweenData();
    });
  };

  onMouseLeave = (e) => {
    if (!e || !e.target.id.startsWith("LogoGather")) return;

    this.setState({ isMouseEnter: false }, () => {
      if (this.gather) this.updateTweenData();
    });
  };

  setDataToDom(data: Uint8ClampedArray, w: number, h: number) {
    this.pointArray = [];
    const DEFAULT_DELAY = 12000;

    const number = this.props.bubbleCount;
    for (let i = 0; i < w; i += number) {
      for (let j = 0; j < h; j += number) {
        if (data[(i + j * w) * 4 + 3] > 150) {
          this.pointArray.push({ x: i, y: j });
        }
      }
    }

    const children = [];
    this.pointArray.forEach((item, i) => {
      const r = (Math.random() * this.props.bubbleSizeMin + this.props.bubbleSizeMin) * this.props.bubbleScale;
      const opacity = this.props.opacity ? this.props.opacity : Math.random() * this.props.opacitymin + this.props.opacitymin;

      const delay = Math.floor(Math.random() * (DEFAULT_DELAY / 3));
      const start = DEFAULT_DELAY / 2 - delay;

      const R = Math.round(Math.random() * 95 + 160);
      const G = Math.round(Math.random() * 95 + 160);
      const B = Math.round(Math.random() * 95 + 160);

      children.push(
        <TweenOne className="absolute rounded-[100%]" key={i} style={{ left: item.x, top: item.y }}>
          <div
            style={{
              pointerEvents: "none",
              width: r,
              height: r,
              opacity: opacity / 2,
              backgroundColor: `rgb(${R},${G},${B})`,
              borderRadius: "50%",
              animation: `up-and-down-${(i % 2) + 1} ${start}ms ease-in-out ${delay}ms infinite`,
              // filter: "blur(.5px)",
            }}
          ></div>
        </TweenOne>
      );
    });

    this.setState({
      children,
      boxAnim: { opacity: 0, type: "from", duration: 800 },
    });
  }

  createPointData = () => {
    const { width, height } = this.props;
    let canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    canvas.width = width;
    canvas.height = height;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);
      const data = ctx.getImageData(0, 0, width, height).data;
      this.setDataToDom(data, width, height);
      canvas.remove();
    };
    img.crossOrigin = "anonymous";
    img.src = this.props.image;
  };

  gatherData = () => {
    if (!this.dom || !this.sideBox) return console.warn("bubble: 无法获取dom或者sideBox");
    this.currtState = "gathing";

    const rect = this.dom.getBoundingClientRect();
    const sideRect = this.sideBox.getBoundingClientRect();

    const children = this.state.children.map((item) =>
      React.cloneElement(item, {
        animation: {
          x: 0,
          y: 0,
          opacity: 1,
          scale: 1,
          delay: Math.random() * 500,
          duration: 800,
          ease: "easeInOutQuint",
        },
      })
    );

    this.setState({ children }, () => {
      this.currtState = "done";
    });
  };

  disperseData = () => {
    if (!this.dom || !this.sideBox) return console.warn("bubble: 无法获取dom或者sideBox");

    const rect = this.dom.getBoundingClientRect();
    const sideRect = this.sideBox.getBoundingClientRect();
    // const positionRect = this.positionElement.getBoundingClientRect();

    const sideTop = sideRect.top - rect.top;
    const sideLeft = sideRect.left - rect.left;

    const children = this.state.children.map((item) => {
      const r = (Math.random() * this.props.bubbleSizeMin + this.props.bubbleSizeMin) * 2;

      return React.cloneElement(item, {
        animation: {
          width: r,
          height: r,
          x: Math.random() * rect.width - sideLeft - item.props.style.left,
          y: Math.random() * rect.height - sideTop - item.props.style.top,
          opacity: this.props.opacity ? this.props.opacity : Math.random() * this.props.opacitymin + this.props.opacitymin,
          scale: Math.random() * 2.4 + 0.1,
          duration: Math.random() * 500 + 500,
        },
      });
    });

    this.setState({ children }, () => {
      this.currtState = "done";
    });
  };

  updatePositions = (): boolean => {
    // console.log("updatePositions");

    // 不需要获取定位信息
    if (!this.props.positionElementId) {
      // console.log("不需要定位");
      return true;
    }

    if (!this.positionElement) {
      this.positionElement = document.getElementById(this.props.positionElementId);

      if (!this.positionElement) {
        console.log("获取元素失败");
        return false;
      }
    }

    if (!this.dom) {
      console.log("父级包裹元素实例读取失败");
      return false;
    }

    // 以下代码根据最近一个相对定位的父级元素重新计算泡泡散开时候的位置
    const { top, left, transform } = this.state;

    const positionElement = this.positionElement.getBoundingClientRect();
    const parent = this.dom.getBoundingClientRect();

    const translateX = this.props.width / 2 - positionElement.width / 2;
    const translateY = this.props.height / 2 - positionElement.height / 2;
    const newTransform = `translate(-${translateX}px, -${translateY}px)`;

    const newTop = positionElement.y - parent.y + this.props.offsetY;
    console.log("newTop: ", newTop);
    const newLeft = positionElement.x - parent.x + this.props.offsetX;
    const newState = { top: newTop, left: newLeft, transform: newTransform };

    const oldStateString = JSON.stringify({ top, left, transform });
    const newStateString = JSON.stringify(newState);

    if (oldStateString != newStateString) this.setState(newState);

    return true;
  };

  updateTweenData = () => {
    try {
      if (!this.IS_CURRT_WEB_PAGE) return;

      if (!this.dom) this.dom = document.getElementById("bubbleWarp");

      if (!this.sideBox) this.sideBox = document.getElementById("LogoGather.hoverZone");

      console.log("当前状态: ", this.currtState);

      if (this.gather) {
        if (this.state.isMouseEnter) return;
        this.disperseData();
      } else {
        this.gatherData();
      }

      this.gather = !this.gather;

      if (this.props.autoGather) {
        console.log("触发自动聚合");

        this.cleanInterval();

        window.CPS_BUBBLE_ENV.INTERVAL_LIST.push(setInterval(this.updateTweenData, this.props.intervalTime));
      }
    } catch (error) {
      console.log("更新数据失败: ", error);
    }
  };

  cleanInterval = () => {
    if (window.CPS_BUBBLE_ENV.INTERVAL_LIST.length > 0) {
      window.CPS_BUBBLE_ENV.INTERVAL_LIST.forEach((intervalID) => clearInterval(intervalID));
      window.CPS_BUBBLE_ENV.INTERVAL_LIST = [];
    }
  };

  render() {
    return (
      <div id="bubbleWarp" className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <TweenOne
          animation={this.state.boxAnim}
          className={["absolute pointer-events-auto bg-orange-300/10 rounded-xl", this.isInit ? "shadow-md" : "opacity-0"].join(" ")}
          style={{
            width: `${this.props.width}px`,
            height: `${this.props.height}px`,
            top: this.state.top,
            left: this.state.left,
            bottom: this.state.bottom,
            right: this.state.right,
            transform: this.state.transform,
          }}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          id="LogoGather.hoverZone"
          ref={(c) => (this.sideBoxComp = c as any)}
        >
          {this.state.children}

          {process.env.NODE_ENV === "development" ? (
            <div className="translate-y-3">
              <div>测试bar</div>
              <button onClick={this.gatherData}> 聚合 </button>
              <button onClick={this.disperseData}> 散开 </button>
              <button
                onClick={() => {
                  console.log("暂停");
                }}
              >
                {" "}
                暂停{" "}
              </button>
            </div>
          ) : null}
        </TweenOne>
      </div>
    );
  }
}
