/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2024-02-21 17:21:43
 * @LastEditors: Capsion 373704015@qq.com
 * @LastEditTime: 2025-02-11 00:40:50
 * @FilePath: \cps-blog-docusaurus-v3\src\components\ImageSwiper\data.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import rawData from "@site/src/data/project";
import { shuffle } from "lodash";
// import useBaseUrl from "@docusaurus/useBaseUrl";
export interface ICpsImgSwiperDataItem {
  example?: any; //
  title: string; // 项目名称
  content: string; // 项目简介
  logo?: string; // logo
  preview: string; // 预览图
  mainColor: string; // 主颜色
  subColor: string; // 副颜色
  gif?: string; // 动态图
  website?: string; // 项目地址
}

/* 配色 */
const COLOR_LIST = [
  {
    mainColor: "#FFF43D",
    subColor: "#F6B429",
  },
  {
    mainColor: "#FC1E4F",
    subColor: "#FF4058",
  },
  {
    mainColor: "#9FDA7F",
    subColor: "#64D487",
  },
  {
    mainColor: "rgb(96, 224, 224)",
    subColor: "rgb(96, 224, 254)",
  },
];

function createData(): ICpsImgSwiperDataItem[] {
  return shuffle(rawData).map((item, index): ICpsImgSwiperDataItem => {
    // 因为颜色的数量不一定能与项目数据一一对上
    let colorIndex = index % COLOR_LIST.length;
    let res = {
      title: item.title,
      content: item.description,
      preview: item.preview,
      mainColor: COLOR_LIST[colorIndex].mainColor,
      subColor: COLOR_LIST[colorIndex].subColor,
    };

    if (item.logo) res["logo"] = item.logo;
    if (item.gif) res["gif"] = item.gif;
    if (item.website) res["website"] = item.website;

    return res;
  });
}

export default createData();
