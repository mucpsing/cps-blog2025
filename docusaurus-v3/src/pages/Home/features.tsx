/*
 * @Author: Capsion 373704015@qq.com
 * @Date: 2025-02-13 22:17:47
 * @LastEditors: Capsion 373704015@qq.com
 * @LastEditTime: 2025-02-21 22:06:55
 * @FilePath: \cps-blog-docusaurus-v3\src\pages\Home\features.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: "前端技能",
    Svg: require("@site/static/img/undraw_docusaurus_mountain.svg").default,
    description: (
      <>
        能独立完成前端项目，也能配合后端使用常见框架开发<code>Vue</code>、<code>Rect</code>、<code>TS+CSS</code>、<code>TailwillCSS</code>、
        <code>Uniapp</code>；<br />
        <a href="https://linux.vbird.org/linux_basic/">前端项目展示</a>
      </>
    ),
  },
  {
    title: "后端技能",
    Svg: require("@site/static/img/undraw_docusaurus_tree.svg").default,
    description: (
      <>
        掌握的语言：<code>Python</code>、<code>Java</code>、<code>Lua</code>、<code>Go</code>； 常用的框架：<code>Fastapi</code>、
        <code>Spring全家桶</code>能独或配合前端完成项目开发
        <br />
        <a href="https://linux.vbird.org/linux_basic/">后端项目展示</a>
      </>
    ),
  },
  {
    title: "网络运维",
    Svg: require("@site/static/img/Operations Engineer.svg").default,
    description: (
      <>
        熟读<a href="http://cn.linux.vbird.org/linux_server/0110network_basic.php">《鸟哥的linux私房菜-基础篇、服务器》</a>、
        <a href="https://linux.vbird.org/linux_basic/">《鸟哥的linux私房菜-服务器篇》</a>一名合格的运维菜鸡。 <br />
        <a href="https://linux.vbird.org/linux_basic/">完整项目展示</a>
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
