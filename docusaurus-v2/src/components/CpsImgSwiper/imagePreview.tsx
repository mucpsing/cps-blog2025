import React from "react";
import ReactDOM from "react-dom";
import type { ICpsImgSwiperDataItem } from "./data";

export interface ImagePreviewProps {
  src?: string;
  onload?: (param: any) => void;
}
export interface ImagePreviewState {
  show?: boolean;
}

const IMG_CACHE = [];
const SHOW_HREF = ["http://localhost:3000/", "https://capsion.top/"];
let SHOW: boolean = false;

class ImagePreview extends React.Component<ImagePreviewProps, ImagePreviewState> {
  public parent: HTMLElement;
  constructor(props) {
    super(props);

    this.parent = document.getElementById("cps-img-preview");
  }

  /**
   * @description: 当大图加载成功时，执行本函数
   */
  onload = (input: any) => {
    if (this.props.onload) this.props.onload(input);
  };

  close = () => {
    console.log("关闭");
    this.setState({ show: false });
    SHOW = false;
  };

  show = () => {
    console.log("show");

    if (!this.parent) {
      this.parent = document.getElementById("cps-img-preview");
    }
    this.parent.style.display = "";

    return "";
  };

  hidden = () => {
    console.log("hidden");

    if (!this.parent) {
      this.parent = document.getElementById("cps-img-preview");
    }
    this.parent.style.display = "none";
    return "hidden";
  };

  render(): React.ReactNode {
    return (
      <div
        className={[
          "overlay z-[1000]",
          SHOW ? this.show() : this.hidden(),
          "absolute w-full h-full top-0 left-0 flex justify-center items-center",
          "bg-black/70",
        ].join(" ")}
        onClick={this.close}
      >
        <img className="" src={this.props.src} alt="img" onLoad={(e) => this.onload(this.props.src)} />
      </div>
    );
  }
}

export default (target: ICpsImgSwiperDataItem) => {
  console.log({ target });

  // 单例
  const createImgPreviewElement = () => {
    let div = document.createElement("div");
    div.id = "cps-img-preview";
    div.style.position = "absolute";
    div.style.top = "0";
    div.style.left = "0";
    div.style.width = "100%";
    div.style.height = "100%";
    // div.style.pointerEvents = "none";

    document.body.appendChild(div);
    return div;
  };

  let element: HTMLElement | undefined;

  try {
    element = document.getElementById("cps-img-preview");
  } catch (err) {
    console.log("需要重新创建");
  }

  if (!element) {
    element = createImgPreviewElement();
  }

  SHOW = true;
  ReactDOM.render(<ImagePreview src={target.gif ? target.gif : target.preview} />, element);
};
