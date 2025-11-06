/*
 * @Author: CPS holy.dandelion@139.com
 * @Date: 2023-02-07 19:55:02
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2024-09-18 17:16:18
 * @FilePath: \cps-blog\src\pages\index.tsx
 * @Description: 首页
 */
import React from "react";
import Head from "@docusaurus/Head";

import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

import HomepageFeatures from "@site/src/components/HomepageFeatures";
import HomepageSwiper from "@site/src/components/HomepageSwiper";

import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";

if (ExecutionEnvironment.canUseDOM) {
  // As soon as the site loads in the browser, register a global event listener
  window.addEventListener("keydown", (e) => {
    if (e.code === "Period") {
      location.assign(location.href.replace(".com", ".dev"));
    }
  });
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description="Description will go into a meta tag in <head />">
      <Head>
        {/* 修复css不加载的问题 */}
        <link rel="stylesheet" href="/css/globalcss.css" />
      </Head>
      <header className="relative flex flex-col">
        <HomepageSwiper />
      </header>

      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
