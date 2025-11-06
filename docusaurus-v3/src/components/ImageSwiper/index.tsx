/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2023-04-21 09:15:12
 * @LastEditors: Capsion 373704015@qq.com
 * @LastEditTime: 2025-02-27 21:49:42
 * @FilePath: \cps-blog\src\components\CpsImgSwiper\index.tsx
 * @Description: 这是一个图片轮播组件，支持横屏和竖屏排版，目前仅支持网页端浏览器，没做移动适配
 */
import React, { useState, useEffect } from "react";

import BannerAnim, { Element } from "rc-banner-anim";
import QueueAnim from "rc-queue-anim";
import { TweenOneGroup } from "rc-tween-one";
import { RightOutlined, LeftOutlined } from "@ant-design/icons";
import { isSupportWebp, imgUrl2Webp } from "./utils";

import defaultData, { type ICpsImgSwiperDataItem } from "./data";
import ImgPreview from "./imagePreview";

export type AlignmentModeT = "horizontal" | "vertical";
export interface ICpsImgSwiperProps {
  alignmentMode?: AlignmentModeT; // 横向|垂直
  showText?: boolean;
  showImg?: boolean;
  showArrow?: boolean; // 是否显示切换的箭头
  autoSwitch?: number; // 是否自动切换，默认0不开启，单位为ms
  data?: ICpsImgSwiperDataItem[];
  classNames?: string;
  imgPreview?: boolean; // 是否开启点击放大展示gif
  useWebp?: boolean; // 是否使用webp
  mainColorIndex: number;
  subColorIndex: number;
  mainColor?: string[];
  subColor?: string[];
  page?: number;
  onNext?: () => void;
  onPrev?: () => void;
}

export interface ICpsImgSwiperState {
  showInt: number;
  delay: number;
  oneEnter: boolean;
  webp: boolean; // 是否启用webp，首先通过props确定是否使用，在通过函数判断环境是否支持，最终生成布尔值状态存储
  mainColor?: string[];
  subColor?: string[];
  mainColorIndex?: number;
  subColorIndex?: number;
}

/**
 * @description: 左右两边的动画滑动效果
 */
export const ANIM_CONFIGS = {
  left: [
    { translateX: [0, -300], opacity: [1, 0] },
    { translateX: [0, 300], opacity: [1, 0] },
  ],
  right: [
    { translateX: [0, 300], opacity: [1, 0] },
    { translateX: [0, -300], opacity: [1, 0] },
  ],
};

// 新增异步图片加载组件
const AsyncImage = ({
  preview,
  gif,
  onClick,
  className,
}: {
  className: string;
  preview: string;
  gif?: string;
  // webp: boolean;
  onClick: (e?: any) => any;
}) => {
  const [src, setSrc] = useState(preview);

  useEffect(() => {
    // if (!gif) return;

    // 处理webp转换
    const targetGif = gif ? gif : preview;

    // 预加载GIF
    const img = new Image();
    img.src = targetGif;
    img.onload = () => setSrc(targetGif);
  }, [gif]);

  return <img src={src} className={className} alt="" onClick={onClick} crossOrigin="anonymous" />;
};

/**
 * @description: 【图片展示】组件
 */
function createImgComponent(props: {
  alignmentMode: AlignmentModeT;
  delay: number;
  data: ICpsImgSwiperDataItem[];
  webp: boolean;
  currtAnim: typeof ANIM_CONFIGS.right | typeof ANIM_CONFIGS.left;
  bgColor: string;
}) {
  return props.data.map((item, i) => {
    return (
      <Element key={i} leaveChildHide>
        <QueueAnim
          className="relative flex items-center justify-center w-full h-full"
          animConfig={props.currtAnim}
          duration={(e) => (e.key === "map" ? 800 : 1000)}
          delay={[!i ? props.delay : 300, 0]}
          ease={["easeOutCubic", "easeInQuad"]}
          key="img-wrapper"
        >
          <div
            key="bg"
            className={["absolute top-0 w-full", props.alignmentMode == "vertical" ? "h-1/2" : "h-2/3"].join(" ")}
            style={{ background: props.bgColor }}
          ></div>

          {/* 小图片 */}
          <div
            id="small-img"
            className={["absolute", props.alignmentMode == "vertical" ? "w-4/5 top-[10%]" : "w-[10%] top-4 right-4"].join(" ")}
            key="pic"
          >
            <img src={item.logo} width="100%" height="100%" alt="" loading="lazy" crossOrigin="anonymous" />
          </div>

          {/* 主图片 */}
          <div
            id="big-img"
            className={[props.alignmentMode == "vertical" ? "bottom-[15%] w-4/5" : "w-4/5", "absolute cursor-pointer"].join(" ")}
            key="map"
          >
            {/* <img src={preview} className="object-fill w-full h-full" alt="" onClick={(e) => this.showImg(item)} crossOrigin="anonymous" /> */}
            <AsyncImage preview={item.preview} gif={item.gif} className={"object-fill w-full h-full"} onClick={(e) => ImgPreview(item)} />
          </div>
        </QueueAnim>
      </Element>
    );
  });
}

/**
 * @description: 【文字描述】组件
 */
function createTextComponent(props: { alignmentMode: AlignmentModeT; bgColor: string; delay: number; data: ICpsImgSwiperDataItem[] }) {
  return props.data.map((item, i) => {
    const { title, content } = item;
    return (
      <Element key={i} prefixCls={props.alignmentMode == "vertical" ? "" : ""} style={{ padding: "clamp(0.5rem, calc(10%), 0.8rem)" }}>
        <QueueAnim className="flex flex-col items-start text-gray-700" type="bottom" duration={800} delay={[!i ? props.delay + 500 : 800, 0]}>
          <h2 key="title" style={{ fontSize: "clamp(0.7rem, 0.489rem + 1.05vw, 1.2rem)", margin: 0 }}>
            {title}
          </h2>
          <em
            key="line"
            style={{ background: props.bgColor, margin: "clamp(0.5vh, 2.5rem, 1vw) 0", transition: "background 1s .3s" }}
            className="inline-block w-16 h-[2px]"
          />
          <p key="content" style={{ fontSize: "clamp(0.5rem, 0.5rem + 0.5vw, 1rem)", margin: 0 }}>
            {content}
          </p>
        </QueueAnim>
      </Element>
    );
  });
}

export default class CpsImgSwiper extends React.Component<ICpsImgSwiperProps, ICpsImgSwiperState> {
  bannerImg: any;
  bannerText: any;
  autoSwitchInterID: any;

  // 因为过渡效果分为左右两边，需要根据每次点击的按钮来重新指定是采用左边的过渡还是右边的过渡效果
  currtAnim = ANIM_CONFIGS.right;

  static defaultProps: ICpsImgSwiperProps = {
    // alignmentMode: "vertical",
    alignmentMode: "horizontal",
    showText: false,
    showImg: true,
    showArrow: true,
    autoSwitch: 30000,
    classNames: "md:w-[500px] md:h-[400px] lg:w-[500px] lg:h-[350px] xl:w-[950px] xl:h-[650px]",
    data: defaultData,
    imgPreview: false,
    useWebp: false,
    mainColor: ["#FC1E4F", "#FFF43D", "#9FDA7F"], // 主背景颜色
    subColor: ["#FF4058", "#F6B429", "#64D487"], // 副背景颜色
    mainColorIndex: 0,
    subColorIndex: 0,
    page: 0,
    onNext: () => {},
    onPrev: () => {},
  };

  constructor(props: ICpsImgSwiperProps) {
    super(props);
    this.state = {
      showInt: 0,
      delay: 0,
      oneEnter: false,
      webp: props.useWebp ? isSupportWebp() : false,
      mainColorIndex: 0,
      subColorIndex: 0,
    };
  }

  componentDidUpdate(prevProps: Readonly<ICpsImgSwiperProps>, prevState: Readonly<ICpsImgSwiperState>, snapshot?: any): void {
    if (!this.props.autoSwitch) return;

    if (this.props.page !== prevProps.page) {
      console.log("触发换页右边");
      this.onRight();

      // this.switchPage(this.props.page)
    }
  }

  componentDidMount(): void {
    if (this.props.autoSwitch) this.autoSwitchOn(this.props.autoSwitch);
  }

  componentWillUnmount(): void {
    if (this.autoSwitchInterID) this.autoSwitchOff();

    this.setState = (state, callback) => null;
  }

  onChange = () => {
    this.state.showInt;
    if (!this.state.oneEnter) {
      this.setState({ delay: 300, oneEnter: true });
    }
  };

  // 向左翻页的控制函数
  onLeft = (e?) => {
    // console.log("onLeft");
    // 为防止正在切换功能与本次主动切换冲突，每次手动切换后将停止自动翻页定时器
    this.autoSwitchOff(e);

    // 向左数组递减，为0时跳转到数组末尾，实现左边轮播循环
    // 检查索引是否第一个，如果不是，否则减1，如果是则跳转到数组长度。
    const showInt = (this.state.showInt - 1 + this.props.data.length) % this.props.data.length;
    const mainColorIndex = (this.state.mainColorIndex - 1 + this.props.mainColor.length) % this.props.mainColor.length;
    const subColorIndex = (this.state.subColorIndex - 1 + this.props.subColor.length) % this.props.subColor.length;

    this.currtAnim = ANIM_CONFIGS.left;
    this.setState({ showInt, subColorIndex, mainColorIndex });
    this.bannerImg.prev();
    this.bannerText.prev();

    this.props.onPrev();
  };

  // 向右翻页的控制函数
  onRight = (e?) => {
    // console.log("onRight");
    // 为防止正在切换功能与本次主动切换冲突，每次手动切换后将停止自动翻页定时器
    this.autoSwitchOff(e);

    // 向右数组递增，为数组长度时跳转到数组开头，实现右边轮播循环
    // 检查索引是否最后一个，如果不是，则加1，如果是则跳转到0。
    const showInt = (this.state.showInt + 1) % this.props.data.length;
    const mainColorIndex = (this.state.mainColorIndex + 1) % this.props.mainColor.length;
    const subColorIndex = (this.state.subColorIndex + 1) % this.props.subColor.length;

    this.currtAnim = ANIM_CONFIGS.right;
    this.setState({ showInt, subColorIndex, mainColorIndex });
    this.bannerImg.next();
    this.bannerText.next();
    this.props.onNext();
  };

  switchPage = (page: number) => {
    const currtPage = this.state.showInt;
    if (currtPage < page) {
      this.onRight();
    } else if (currtPage > page) {
      this.onLeft();
    }
  };

  autoSwitchOn = (switchDelay: number) => {
    setTimeout(() => {
      this.onRight("autoSwitch");
      this.autoSwitchInterID = setInterval(() => {
        this.onRight("autoSwitch");
      }, switchDelay);
    }, 1000);
  };

  autoSwitchOff = (e?: any) => {
    if (typeof e !== "string" && this.autoSwitchInterID) {
      clearInterval(this.autoSwitchInterID);

      this.autoSwitchInterID = 0;

      console.log("autoSwitchOff");
    }
  };

  showImg = (target: ICpsImgSwiperDataItem) => {
    if (this.props.imgPreview) ImgPreview(target);
  };

  render() {
    let ImgComponents = createImgComponent({
      alignmentMode: this.props.alignmentMode,
      delay: this.state.delay,
      data: this.props.data,
      bgColor: this.props.mainColor[this.state.mainColorIndex],
      webp: this.state.webp,
      currtAnim: this.currtAnim,
    });

    let TextComponents = createTextComponent({
      alignmentMode: this.props.alignmentMode,
      delay: this.state.delay,
      data: this.props.data,
      bgColor: this.props.subColor[this.state.subColorIndex],
    });

    return (
      <div className={["bg-white rounded-md overflow-hidden relative", "flex justify-center items-center", this.props.classNames].join(" ")}>
        {/* 图片展示 */}
        <BannerAnim
          className={[
            "cps-swiper-img relative overflow-hidden",
            this.props.alignmentMode == "vertical" ? `w-1/2 h-full inline-block z-[1]` : "min-w-[200px] w-full h-full block absolute z-[2]",
          ].join(" ")}
          sync
          type="across"
          duration={1000}
          ease="easeInOutExpo"
          arrow={false}
          thumb={false}
          ref={(c) => (this.bannerImg = c)}
          onChange={this.onChange}
          dragPlay={false}
        >
          {ImgComponents}
        </BannerAnim>

        {/* 文字描述 */}
        <BannerAnim
          style={{ backdropFilter: "blur(5px)" }}
          className={[
            // z-5 是因为标题需要点击，会被左右切换的按钮遮挡
            "cps-swiper-text overflow-hidden z-[5]",
            this.props.alignmentMode == "vertical" ? `w-1/2 h-full inline-block relative` : "w-full h-1/3 block absolute bottom-0 bg-white/50",
          ].join(" ")}
          sync
          type="across"
          duration={1000}
          arrow={false}
          thumb={false}
          ease="easeInOutExpo"
          ref={(c) => (this.bannerText = c)}
          dragPlay={false}
        >
          {TextComponents}
        </BannerAnim>

        {/* 左右箭头 - 触发换页 */}
        {this.props.showArrow ? (
          <TweenOneGroup enter={{ opacity: 0, type: "from" }} leave={{ opacity: 0 }}>
            <LeftOutlined
              className={["z-[3] left-1 absolute text-2xl top-1/2", "h-full w-[100px] flex items-center justify-start", "text-white"].join(" ")}
              onClick={this.onLeft}
              style={{ transform: "translateY(-50%)" }}
            />
            <RightOutlined
              className={["z-[3] right-1 absolute text-2xl top-1/2", "h-full w-[100px] flex items-center justify-end", "text-white"].join(" ")}
              style={{ transform: "translateY(-50%)" }}
              onClick={this.onRight}
            />
          </TweenOneGroup>
        ) : null}
      </div>
    );
  }
}
