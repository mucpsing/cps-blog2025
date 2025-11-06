/*
 * @Author: Capsion 373704015@qq.com
 * @Date: 2025-02-13 22:20:06
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2025-11-06 08:26:59
 * @FilePath: \cps-blog-docusaurus-v3\src\pages\index.tsx
 * @Description:  入口文件，首页
 */
import React, { useEffect } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import useGlobalData from "@docusaurus/useGlobalData";
import Start from "./Start";

import Home from "./Home";
import Test from "./Test";

export default function HomePage() {
  const globalData = useGlobalData();
  useEffect(() => {
    console.log("globalData: ", globalData);
  });
  return (
    <BrowserOnly fallback={<div>this page client only Loading...</div>}>
      {/* <BrowserOnly fallback={<div>Loading 123333333 </div>}> */}
      {() => {
        return <Home />;

        // if (process.env.NODE_ENV === "development") {
        //   return <Test />;
        // } else {
        //   return <Home />;
        // }
      }}
    </BrowserOnly>
  );
}
