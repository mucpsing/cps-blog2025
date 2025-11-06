/*
 * @Author: CPS holy.dandelion@139.com
 * @Date: 2023-02-07 19:55:02
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2025-11-06 08:34:13
 * @FilePath: \cps-blog\src\pages\index.tsx
 * @Description: 首页
 */
import React, { useState } from "react";
import Head from "@docusaurus/Head";
// import Layout from "@site/src/theme/GlobalLayout";
import Layout from "@theme/Layout";

import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

import HomepageSwiper from "./body";
import HomepageFeatures from "./features";
import Skill from "./Skill";
import ProjectSwper from "./ProjectSwper";

import { Highlight, themes } from "prism-react-renderer";

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const [colorIndex, setColorIndex] = useState(0);
  // const codeBlock = `
  // const GroceryItem: React.FC<GroceryItemProps> = ({ item }) => {
  //   return (
  //     <div>
  //       <h2>{item.name}</h2>
  //       <p>Price: {item.price}</p>
  //       <p>Quantity: {item.quantity}</p>
  //     </div>
  //   );
  // }
  // `;
  return (
    <Layout title={siteConfig.title} description="Description will go into a meta tag in <head />">
      <Head>
        {/* 修复css不加载的问题 */}
        <link rel="stylesheet" href={`${siteConfig.baseUrl}css/bubble.css`} />
      </Head>

      {/* <Highlight theme={themes.shadesOfPurple} code={codeBlock} language="tsx">
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                <span>{i + 1}</span>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight> */}

      <div id="homepage.swiper" className="relative flex flex-col">
        <HomepageSwiper colorIndex={colorIndex} setColorIndex={setColorIndex} />
      </div>

      {/* <div id="ccvbbbb" className={["w-[100vw] bg-slate-400 h-[550px]"].join(" ")}>
        <Skill colorIndex={colorIndex} />
      </div> */}

      <div>
        <ProjectSwper />
      </div>

      <div>
        <HomepageFeatures />
      </div>
    </Layout>
  );
}
