import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import process from "node:process";
import fse from "fs-extra";

import * as path from "path";
import * as scripts from "./src/scripts";

// 失效
// import disableSvgoCleanupIds from "./src/plugins/disable-svgo-cleanup-ids";

// import pluginCdnReplacer from "./src/plugins/fixImageUrlToCDN";

import { extractTagline } from "./src/scripts/taglineList";
const DOCS_PATH_LIST = [
  path.resolve("../cps-blog/docs"), // office
  "D:/CPS/docs", // home
];

let DOCS_PATH = path.resolve("./docs");
DOCS_PATH_LIST.forEach((docsPath) => {
  if (fse.existsSync(docsPath)) {
    fse.copySync(path.join(docsPath, "/【05】项目经历"), path.join(path.resolve("./docs"), "/【05】项目经历"));
    fse.copySync(path.join(docsPath, "/【07】常识科普"), path.join(path.resolve("./docs"), "/【07】常识科普"));

    // 判断是否生产
    // DOCS_PATH = docsPath;
  }
});

console.log("当前DOCS_PATH: ", DOCS_PATH);

// 因为css引入异常，这里将一些引入异常的css文件复制到static中，然后通过页面文件添加对应的link来引入
scripts.copyCssToStatic([path.resolve("./src/components/FallingItemsList"), path.resolve("./src/components/BubbleText")]);

/* 【首页】名人名言 */
const taglineList = extractTagline(path.resolve("./docs/【07】常识科普/社会真实/名人名言.md"));

/* 排除的文件夹 */
const excludeDirList = ["【18】副业开发", ".obsidian", "gg", ".trash", "【00】安卓开发", "临时", "【10】work", "svg", "资源收集"];
const includeDirList = ["【00】编程相关", "【01】前端开发", "【02】后端开发", "【03】运维相关", "【05】项目经历", "【05】项目经历", "【13】Game"];

export default async function createConfigAsync() {
  const config: Config = {
    title: "Capsion | 个人博客 | 编程资料整理",
    tagline: taglineList.join(","),
    favicon: "img/favicon.ico",

    // Set the production url of your site here
    url: "https://www.capsion.top",
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: "/",

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    projectName: "capsion-blog", // Usually your repo name.
    organizationName: "capsion-blog", // Usually your GitHub org/user name.
    // deploymentBranch: "pages",
    // trailingSlash: false,

    // onBrokenLinks: "throw",
    onBrokenLinks: "warn",
    onBrokenMarkdownLinks: "warn",

    // Even if you don't use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you
    // may want to replace "en" with "zh-Hans".
    i18n: {
      defaultLocale: "zh-Hans",
      locales: ["zh-Hans"],
    },

    plugins: ["docusaurus-plugin-sass"],
    // plugins: ["@docusaurus/plugin-ideal-image", "docusaurus-plugin-sass"],

    // 开启mermaid（思维导图）支持
    markdown: { mermaid: true },
    themes: [
      "@docusaurus/theme-mermaid",
      [
        "@easyops-cn/docusaurus-search-local",
        {
          // `hashed` is recommended as long-term-cache of index file is possible.
          hashed: true,

          // For Docs using Chinese, it is recomended to set:
          language: ["en", "zh"],

          // If you're using `noIndex: true`, set `forceIgnoreNoIndex` to enable local index:
          // forceIgnoreNoIndex: true,
        },
      ],
    ],

    presets: [
      [
        "@docusaurus/preset-classic",
        {
          docs: {
            path: DOCS_PATH,
            include: includeDirList,
          },

          theme: {
            // customCss: ["./src/css/custom.css", "./src/components/BubbleText/bubble.css", "./src/components/FallingItemsList/FallingItemsList.css"],
            customCss: ["./src/css/custom.css", "./src/components/BubbleText/bubble.css", "./src/components/FallingItemsList/FallingItemsList.css"],
          },
        } satisfies Preset.Options,
      ],
    ],

    themeConfig: {
      liveCodeBlock: {
        /**
         * 实时效果显示的位置，在编辑器上方还是下方
         * 可选参数："top" | "bottom"
         */
        playgroundPosition: "bottom",
      },
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: true,
        },
      },
      // Replace with your project's social card
      image: "img/docusaurus-social-card.jpg",
      navbar: {
        title: "🍌 Capsion Lab 🍌",
        logo: { alt: "My Site Logo", src: "img/logo.svg" },
        items: [
          { to: "/", label: "🏠 首页", position: "left" },

          {
            label: "📔 学习笔记",
            type: "dropdown",
            position: "left",
            items: scripts.createNavItemByDir({ targetPath: DOCS_PATH, excludeDirList, includeDirList }),
          },

          { type: "search", position: "left" },

          // {
          //   type: "dropdown",
          //   label: "🧪 我的实验",
          //   position: "left",
          //   items: [
          //     {
          //       to: "/sample/jiuhao",
          //       label: "🛵 真智能自电",
          //     },
          //     {
          //       to: "/sample/ai",
          //       label: "🤖 AI模特换装",
          //     },
          //   ],
          // },

          {
            label: "💼 作品案例",
            position: "right",
            to: "/project",
          },

          {
            type: "dropdown",
            label: "🤸 联系我",
            position: "right",
            items: [
              {
                type: "html",
                className: "dropdown-archived-versions",
                value: "<b>我的代码</b>",
              },
              {
                href: "https://gitee.com/capsion/capsion",
                label: "Gitee",
              },
              {
                href: "https://github.com/mucpsing/mucpsing",
                label: "GitHub",
              },

              {
                type: "html",
                value: '<hr class="dropdown-separator">',
              },
              // {
              //   type: "html",
              //   className: "dropdown-archived-versions",
              //   value: "<b>个人信息</b>",
              // },
              {
                href: "https://gitee.com/capsion/resume",
                label: "📃 个人简历",
              },
            ],
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "NoteBooks",
            items: [
              {
                label: "Blog",
                to: "/docs",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Stack Overflow",
                href: "https://stackoverflow.com/questions/tagged/docusaurus",
              },
              {
                label: "Discord",
                href: "https://discordapp.com/invite/docusaurus",
              },
              {
                label: "Twitter",
                href: "https://twitter.com/docusaurus",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "Gitee",
                href: "https://gitee.com/capsion/capsion",
              },
              {
                label: "GitHub",
                href: "https://github.com/mucpsing/mucpsing",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    } satisfies Preset.ThemeConfig,
  };

  if (process.env.PAGE_TYPE && process.env.PAGE_TYPE == "github") {
    const githubConfig = {
      url: "https://mucpsing.github.io",
      baseUrl: "/blog-docusaurus-v3/",
      projectName: "blog-docusaurus-v3", // Usually your repo name.
      organizationName: "mucpsing", // Usually your GitHub org/user name.
      deploymentBranch: "pages",
    };

    Object.assign(config, githubConfig);
  }

  // config.stylesheets = [`${config.baseUrl}css/bubble.css`];
  config.scripts = [{ src: `${config.baseUrl}scripts/replaceImaUrlToCDN.js`, async: true }];
  return config;
}
// export default config;
