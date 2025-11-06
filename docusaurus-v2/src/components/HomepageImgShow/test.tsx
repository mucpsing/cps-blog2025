import React, { useState } from "react";
import QueueAnim from "rc-queue-anim";

import TweenOne, { TweenOneGroup } from "rc-tween-one";

import data from "./data";
import "./test.css";

let CURRT_HOVER_INDRX = -1;

/**
 * @description: 用来保留tailwindcss的grid-cols类名
 */
function TempClass() {
  return (
    <ul className="hidden grid-cols-1 grid-cols-2 grid-cols-3 grid-cols-4 grid-cols-5 grid-cols-6 grid-cols-7 grid-cols-8 grid-cols-9 grid-cols-10 grid-cols-11 grid-cols-12 grid-cols-13"></ul>
  );
}

function onHover(index: number) {
  console.log({ index });

  CURRT_HOVER_INDRX = index;
}

/**
 * @description: 计算元素在二维空间的具体位置
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

function ImageList(props: { splicCol: number; imgWidth: number; gap: number }) {
  const [refObj, setRefObj] = useState({});

  const [currtIndex, setCurrtIndex] = useState(-1);
  const [baseWidth, setBaseWidth] = useState(-1);
  const [baseHeight, setBaseHeight] = useState(-1);

  const [maskY, setMaskY] = useState<string | number>("0px");
  const [maskX, setMaskX] = useState<string | number>("0px");
  const [maskW, setMaskW] = useState<string | number>("0px");
  const [maskH, setMaskH] = useState<string | number>("0px");

  const [isOpen, setIsOpen] = useState("0");
  const [gutter, setGutter] = useState(40);

  const onHover = (e: any, index: number) => {
    const target = e.target;

    if (baseWidth === -1 && target.clientWidth) {
      setBaseWidth(target.clientWidth);
      setMaskW(`${target.clientWidth}px`);
    }
    if (baseHeight === -1 && target.clientHeight) {
      setBaseHeight(target.clientHeight);
      setMaskH(`${target.clientHeight}px`);
    }

    setCurrtIndex(index);

    // console.log({ w: target.clientWidth, h: target.clientHeight, x: target.x, y: target.y });
  };

  const onClickParent = (index) => {
    index += 1;
    const DEFAULT_COL = 4;
    const DEFAULT_ROW = Math.round(data.length / DEFAULT_COL);
    const flag = index % DEFAULT_COL;

    let currtRow, currtCol;
    let isLeft,
      isTop = false;

    // 获取当前点击的容器在第几行第几列
    if (flag == 0) {
      // 能被4整除，代表最后一个
      currtRow = index / DEFAULT_COL;
      currtCol = DEFAULT_COL;
    } else {
      currtRow = (index - flag) / 4 + 1;
      currtCol = flag;
    }

    isLeft = Boolean(DEFAULT_COL - currtCol >= DEFAULT_COL / 2);
    isTop = Boolean(currtRow <= Math.round(DEFAULT_ROW / 2));
    console.log({ currtCol, currtRow, isLeft, isTop, refObj });

    let oldX, oldY;
    if (currtCol == 1) {
      oldX = 0;
    } else {
      let marginX = (currtCol - 1) * gutter;
      let newX = baseWidth * (currtCol - 1);
      oldX = marginX + newX;
    }

    if (currtRow == 1) {
      oldY = 0;
    } else {
      let marginY = (currtRow - 1) * gutter;
      let newY = baseHeight * (currtRow - 1);
      oldY = newY + marginY;
    }

    setMaskX(`${oldX}px`);
    setMaskY(`${oldY}px`);
    setMaskW(`${baseWidth}px`);
    setMaskH(`${baseHeight}px`);

    setTimeout(() => {
      setIsOpen("1");

      if (isLeft) {
        setMaskX(0);
      } else {
        setMaskX("50%");
      }

      setMaskW(`50%`);
      setMaskH(`${baseHeight * 2 + gutter}px`);

      setTimeout(() => {
        setIsOpen("2");

        setMaskX(0);
        setMaskW("100%");
        setTimeout(() => {
          setIsOpen("0");
        }, 600);
      }, 600);
    }, 100);
  };

  const showMask = () => {
    setIsOpen("0");
    console.log({ isOpen });
  };

  return (
    <QueueAnim
      component="div"
      type="bottom"
      style={{ gap: `${props.gap}px` }}
      className={[`grid-cols-${props.splicCol}`, "grid relative"].join(" ")}
    >
      {data.map((item, i) => {
        const { row: currtRow, col: currtCol } = getRowAndCol(i, props.splicCol);
        const key = `${currtRow},${currtCol}`;
        return (
          <div
            className="shadow-xl cursor-pointer shadow-black/25"
            key={key}
            onMouseEnter={(e) => onHover(e, i)}
            onClick={(e) => onClickParent(i)}
          >
            <img width="100%" height="100%" src={item.image} alt={key} />
          </div>
        );
      })}

      <div
        onClick={(e) => showMask()}
        className={[
          "absolute bg-white opacity-50",
          isOpen == "1" ? "imgContainer-open1" : "",
          isOpen == "2" ? "imgContainer-open2" : "",
        ].join(" ")}
        style={{ width: maskW, height: maskH, top: maskY, left: maskX }}
      ></div>
    </QueueAnim>
  );
}

export default function Test(props) {
  return (
    <section className="w-full p-10 bg-red-400">
      <QueueAnim component="header" delay={300} type="bottom" className="text-center">
        <h2 className="my-4 text-4xl" key="title">
          项目展示
        </h2>
        <p className="my-5 text-lg" key="subTitle">
          以下项目中的所有商业项目均通过甲方同意公开后才展示
        </p>
      </QueueAnim>
      {ImageList({ splicCol: 4, imgWidth: 300, gap: 40 })}
    </section>
  );
}
