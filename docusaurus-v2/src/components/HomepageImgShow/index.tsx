import React from "react";

import QueueAnim from "rc-queue-anim";
import TweenOne, { TweenOneGroup } from "rc-tween-one";
import { CloseOutlined } from "@ant-design/icons";

// import "rc-banner-anim/assets/index.css";

import dataArray from "./data";

/**
 * @description: 提供一个索引和元素长度，返回该索引的二维位置
 * @param {number} index 一维的位置（元素下标）
 * @param {number} COL_COUNT 元素每行的个数
 */
function getRowAndCol(index: number, COL_COUNT: number = 4) {
  index += 1;
  const res = index % COL_COUNT;

  let col, row;
  if (res == 0) {
    row = index / COL_COUNT;
    col = COL_COUNT;
  } else {
    row = (index - res) / COL_COUNT + 1;
    col = res;
  }

  return { row, col };
}

const CLOSE_CLASS_LIST = ["cps-pic-click-will-close"]; // 拥有这个class名称的被电击时，如果内容被展开，会触发自动关闭
interface IPicDetailsState {
  picOpen: { [key: string]: boolean }; // 是否有图片被展开
  currtOpenIndex: number; // 当前展开的图片容器
  height: number;
  width: number;
  gap: number;
  imgWidth: number;
  imgHeight: number;
  imgBoxWidth: number;
  imgBoxHeight: number;
  imgOpenHeight: number;
}

interface IPicDetailsProps {
  title?: string; // 组件标题
  subTitle?: string; // 副标题
  splitCol?: number; // 图片分列的数量
  gap?: number; // 间距（百分比），以宽度为基础，10 就是图片宽度的10%
  autoClose?: Boolean; // 点击外部收起
  imgScale?: string; // 图片尺寸比例，默认4:3
  rounded?: boolean; // 是否圆角
  shadow?: boolean; // 是否带阴影
  defaultWidth?: number; // 整体宽度
  autoWidth?: boolean; // 响应式宽度
}

export default class PicDetailsDemo extends React.Component<IPicDetailsProps, IPicDetailsState> {
  wrapperElement: HTMLElement;
  wrapperImgElement: HTMLElement;

  static defaultProps = {
    title: "图片展示",
    subTitle: "以下项目中的所有商业项目均通过甲方同意公开后才展示",
    splitCol: 4,
    gap: 10,
    imgScale: "4:3",
    rounded: true,
    shadow: true,
    autoClose: true,
    defaultWidth: 800,
    autoWidth: true,
  };

  constructor(props) {
    super(props);

    this.state = {
      picOpen: {},
      currtOpenIndex: -1, // 当前展开的图片
      width: props.defaultWidth,
      height: props.defaultWidth,
      imgWidth: 100,
      imgHeight: 100,
      gap: props.gap,
      imgBoxWidth: 110,
      imgBoxHeight: 110,
      imgOpenHeight: 220,
    };
  }

  componentDidMount() {
    this.wrapperImgElement = document.getElementById("cps-pic-details-img-wrapper");

    if (this.wrapperImgElement) {
      window.addEventListener("resize", () => {
        if (this.props.autoWidth) this.updateImgWrapperWidth();
      });
      this.updateImgWrapperWidth();
    } else {
      console.log("组件初始化失败，无法获取父级DOM，动态高度将失效");
    }
  }

  /**
   * @description: 动态修改图片尺寸
   */
  updateImgWrapperWidth = () => {
    // 间距公式：元素宽度/列数量*间距百分比(props.gap)
    const gap = ((this.wrapperImgElement.clientWidth / this.props.splitCol) * this.props.gap) / 100;
    const imgWidth = (this.wrapperImgElement.clientWidth - gap * (this.props.splitCol - 1)) / this.props.splitCol;
    const [wScale, hScale] = this.props.imgScale.split(":");
    const imgHeight = (imgWidth / parseFloat(wScale)) * parseFloat(hScale);
    const height = (dataArray.length / this.props.splitCol) * (imgHeight + gap);

    this.setState({
      gap,
      height,
      imgWidth,
      imgHeight,
      imgBoxWidth: imgWidth + gap,
      imgBoxHeight: imgHeight + gap,
      imgOpenHeight: gap + imgHeight * 2,
    });
  };

  /**
   * @description: 组件全局点击事件，主要用来控制当内容被展开时，是否点击其他地方会自动收起内容
   */
  onClick = (e: any, i: number) => {
    e.preventDefault();
    e.stopPropagation();

    // 展开状态下点击无关区域是否自动收起内容展示
    if (this.props.autoClose) {
      const classList = e.target.classList.toString().split(" ") as string[];

      if (this.state.currtOpenIndex != -1 && classList.some((item) => CLOSE_CLASS_LIST.includes(item))) {
        this.onClose(e, this.state.currtOpenIndex);
      }
    }
  };

  onImgClick = (e, i: number) => {
    const { picOpen } = this.state;
    e.preventDefault();
    e.stopPropagation();

    Object.keys(picOpen).forEach((key) => {
      // 如果当前未被点击过，则需要创建对应的字段
      if (key !== i.toString() && picOpen[key]) {
        // false表示当前容器还没展开
        picOpen[key] = false;
      }
    });

    picOpen[i] = true; // 容器状态改为展开

    this.setState({ picOpen });
    this.setState({ currtOpenIndex: i });
  };

  onClose = (e, i: number) => {
    const { picOpen } = this.state;
    picOpen[i] = false;
    this.setState({ picOpen });
    this.setState({ currtOpenIndex: -1 });
  };

  onTweenEnd = (i) => {
    const { picOpen } = this.state;
    delete picOpen[i];
    this.setState({ picOpen });
  };

  getDelay = (e) => {
    const i = e.index + (dataArray.length % this.props.splitCol);
    return (i % this.props.splitCol) * 100 + Math.floor(i / this.props.splitCol) * 100 + 200;
  };

  getLiChildren = () => {
    const { imgWidth, imgHeight, imgBoxWidth, imgBoxHeight, imgOpenHeight, picOpen } = this.state;
    return dataArray.map((item, i) => {
      const { image, title, content } = item;
      const { col: currtCol } = getRowAndCol(i, this.props.splitCol);

      const isEnter = typeof picOpen[i] === "boolean";
      const isOpen = picOpen[i];
      const isRight = Boolean(currtCol > this.props.splitCol / 2);
      const isTop = Math.floor(i / this.props.splitCol);

      const left = isEnter ? 0 : imgBoxWidth * (i % this.props.splitCol);
      const imgLeft = isEnter ? imgBoxWidth * (i % this.props.splitCol) : 0;

      let top = isTop ? (isTop - 1) * imgBoxHeight : 0;
      top = isEnter ? top : imgBoxHeight * isTop;
      let imgTop = isTop ? imgBoxHeight : 0;
      imgTop = isEnter ? imgTop : 0;

      const liStyle = isEnter ? { width: "100%", height: imgOpenHeight, zIndex: 1 } : null;

      // const liAnimation = isOpen
      //   ? { boxShadow: "0 2px 8px rgba(140, 140, 140, .35)" }
      //   : { boxShadow: "0 0px 0px rgba(140, 140, 140, 0)" };

      let aAnimation: any = isEnter
        ? {
            delay: 400,
            ease: "easeInOutCubic",
            width: imgWidth,
            height: imgHeight,
            onComplete: this.onTweenEnd.bind(this, i),
            left: imgBoxWidth * (i % this.props.splitCol),
            top: isTop ? imgBoxHeight : 0,
          }
        : null;

      aAnimation = isOpen
        ? {
            ease: "easeInOutCubic",
            left: isRight ? imgBoxWidth * (this.props.splitCol / 2) - this.state.gap / 2 : 0,
            width: "50%",
            height: imgOpenHeight,
            top: 0,
          }
        : aAnimation;

      // 位置 js 控制；
      return (
        <TweenOne
          key={i}
          style={{ left, top, ...liStyle }}
          component="li"
          className={[isOpen ? "open block" : "block", "z-[0] inline-block absolute"].join(" ")}
          // animation={liAnimation}
        >
          <TweenOne
            component="a"
            onClick={(e) => this.onImgClick(e, i)}
            style={{ left: imgLeft, top: imgTop, width: imgWidth, height: imgHeight }}
            className={[
              this.props.shadow ? "hover:shadow-lg hover:shadow-cyan-500/50" : "",
              isOpen && this.props.shadow ? "shadow-lg shadow-cyan-500/50" : "",
              "block z-[1] absolute overflow-hidden cursor-pointer",
            ].join(" ")}
            animation={aAnimation}
          >
            <img className="block object-cover w-full h-full" src={image} width="100%" height="100%" alt="" />
          </TweenOne>

          <TweenOneGroup
            enter={[
              { opacity: 0, duration: 0, type: "from", delay: 400 },
              { ease: "easeOutCubic", type: "from", left: isRight ? "50%" : "0%" },
            ]}
            leave={{ ease: "easeInOutCubic", left: isRight ? "50%" : "0%" }}
            component="section"
          >
            {isOpen && (
              <div
                className={[
                  `cps-pic-details-demo-text-wrapper`,
                  "text-gray-500 w-1/2 bg-white px-4 py-3 inline-block absolute align-top",
                ].join(" ")}
                key="text"
                style={{ left: isRight ? "0%" : "50%", height: `${imgOpenHeight}px` }}
              >
                <h1 className="mx-auto my-1 text-lg">{title}</h1>
                <CloseOutlined className="top-[20px] absolute right-[20px]" onClick={(e) => this.onClose(e, i)} />
                <em className="h-[2px] w-16 bg-red-500 block" />
                <p className="mt-2 text-xs">{content}</p>
              </div>
            )}
          </TweenOneGroup>
        </TweenOne>
      );
    });
  };

  render() {
    return (
      <section className={["cps-pic-click-will-close"].join(" ")} onClick={(e) => this.onClick(e, -1)}>
        <div
          id="cps-pic-details-wrapper"
          className={["cps-pic-click-will-close", "w-full h-full py-10 px-20", "overflow-hidden rounded-sm"].join(" ")}
        >
          {/* 标题部分 */}
          {/* <QueueAnim
            type="bottom"
            className={["text-gray-500", "cps-pic-click-will-close", "w-full my-[20px] mx-auto text-center"].join(" ")}
          >
            <h1 key="h1" className="text-4xl cps-pic-click-will-close">
              {this.props.title}
            </h1>
            <p key="p" className="mt-5 text-lg cps-pic-click-will-close">
              {this.props.subTitle}
            </p>
          </QueueAnim> */}

          {/* 图片展示部分 */}
          <QueueAnim
            delay={this.getDelay}
            id="cps-pic-details-img-wrapper"
            component="ul"
            style={{ height: `${this.state.height}px` }}
            className={["cps-pic-click-will-close", "relative list-none m-auto"].join(" ")}
            interval={0}
            type="bottom"
          >
            {this.getLiChildren()}
          </QueueAnim>
        </div>
      </section>
    );
  }
}
