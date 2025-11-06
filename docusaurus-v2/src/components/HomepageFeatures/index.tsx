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
    description: <>擅长使用Vue系技术栈进行web开发，略懂UI设计，能独立构建中小型web项目~</>,
  },
  {
    title: "后端技能",
    Svg: require("@site/static/img/undraw_docusaurus_tree.svg").default,
    description: (
      <>
        擅长使用<code>python</code>和<code>lua</code>
        进行后端开发，数据分析，AI模型训练，深度学习等均有涉及，最近在研究AI模特换装~
      </>
    ),
  },
  {
    title: "网络运维",
    Svg: require("@site/static/img/undraw_docusaurus_react.svg").default,
    description: (
      <>
        熟读<a href="http://cn.linux.vbird.org/linux_server/0110network_basic.php">《鸟哥的linux私房菜-基础篇》</a>、
        <a href="https://linux.vbird.org/linux_basic/">《鸟哥的linux私房菜-服务器篇》</a>一名合格的运维菜鸟。
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
