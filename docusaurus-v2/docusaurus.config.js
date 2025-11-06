const path = require("path");
const utils = require("./scripts/utils");

const currentDocsPath = path.resolve("../docs");

console.log("工作目录:", currentDocsPath);

const outputPath = path.resolve("./data/project.js");

const { addHeaderTag } = require("./scripts/customPlugs");

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/* 【路由】首页名人名言 */
const { extractTagline } = require("./scripts/taglineList");
const taglineList = extractTagline(path.join(currentDocsPath, "【07】常识科普/社会真实/名人名言.md"));

/* 【导航】学习笔记 */
const excludeDirList = [
  "【00】安卓开发",
  "【10】work",
  "【14】面试相关",
  "【17】读书笔记",
  "【18】副业开发",
  "【18】副业开发",
  "【19】AR增强现实",
  "【21】个人收藏",
  ".obsidian",
  "gg",
  ".trash",
  "资源收集",
  "临时",
];

const includeDirList = ["【00】编程相关", "【01】前端开发", "【02】后端开发", "【03】运维相关", "【05】项目经历", "【05】项目经历", "【13】Game"];
// const includeDirList = ["【00】安卓开发", "【00】编程相关", "【01】前端开发", "【02】后端开发","【03】运维相关", "【05】项目经历"];
const navBarDocsItems = {
  label: "📔 学习笔记",
  type: "dropdown",
  position: "right",
  items: utils.createNavItemByDir({ targetPath: currentDocsPath, excludeDirList, includeDirList }),
};

/* 【路由】生成项目页 /project 的数据 */
const defaultPath = [path.join(currentDocsPath, "【05】项目经历/原创作品/"), path.join(currentDocsPath, "【05】项目经历/完整项目/")];
const defaultPrefix = ["/docs/【05】项目经历/原创作品", "/docs/【05】项目经历/完整项目"];

(async () => await utils.createProjectDataByFolder(defaultPath, defaultPrefix, outputPath))();

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Capsion | 编程资料整理", // 网站主题
  // tagline: '好记性不如烂笔头',
  tagline: taglineList.join(","),
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://www.capsion.top",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "capsion", // Usually your GitHub org/user name.
  // projectName: "blog", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "zh",
    locales: ["en", "zh"],
  },

  markdown: {
    mermaid: true,
  },

  themes: ["@docusaurus/theme-mermaid"],

  // headTags: [
  //   {
  //     tagName: "script",
  //     attributes: { charset: "utf-8", src: "/scripts/beforeWindowLoad.js" },
  //   },
  // ],

  // 优先插入脚本
  scripts: [
    {
      src: "/scripts/beforeWindowLoad.js",
      async: false,
    },
  ],

  plugins: [
    // [
    //   require.resolve("@easyops-cn/docusaurus-search-local"),
    //   {
    //     indexDocs: true,
    //     indexBlog: false,
    //     indexPages: true,
    //     language: ["zh"], // 支持中文和英文
    //     hashed: true,
    //     highlightSearchTermsOnTargetPage: true,
    //     explicitSearchResultPath: true,
    //   },
    // ],
    // addHeaderTag,
    [
      require.resolve("docusaurus-lunr-search"),
      {
        languages: ["en", "zh"], // language codes
      },
    ],
    [
      "@docusaurus/plugin-ideal-image",
      {
        quality: 70,
        max: 1030, // max resized image's size.
        min: 640, // min resized image's size. if original is lower, use that size.
        steps: 2, // the max number of images generated between min and max (inclusive)
        disableInDev: false,
      },
    ],
  ],

  presets: [
    [
      "@docusaurus/preset-classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // exclude: excludeDirList,
          include: includeDirList,
          path: currentDocsPath,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl: "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
        },
        blog: {
          // routeBasePath: "/",
          showReadingTime: true,
          blogSidebarTitle: "最近更新",
          blogSidebarCount: "ALL",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl: "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: "img/docusaurus-social-card.jpg",
      navbar: {
        title: "🍌 Capsion Lab 🍌",
        logo: {
          alt: "My Bady Daughter",
          src: "img/mimi_small.png",
        },

        // 导航栏
        items: [
          { to: "/", label: "🏠 首页", position: "left" },
          {
            type: "search",
            position: "left",
          },
          {
            type: "dropdown",
            label: "🧪 我的实验",
            position: "left",
            items: [
              {
                to: "/",
                label: "🛵 真智能自电",
              },
              {
                to: "/",
                label: "🤖 AI模特换装",
              },
            ],
          },

          navBarDocsItems,
          {
            label: "💼 完整&项目 🌟",
            position: "right",
            to: "/project",
          },

          {
            type: "dropdown",
            label: "🤸 关于我",
            position: "right",
            items: [
              {
                type: "html",
                className: "dropdown-archived-versions",
                value: "<b>代码托管</b>",
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
              {
                type: "html",
                className: "dropdown-archived-versions",
                value: "<b>个人信息</b>",
              },
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
                label: "Blog",
                to: "/blog",
              },
              {
                label: "GitHub",
                href: "https://github.com/facebook/docusaurus",
              },
            ],
          },

          {
            title: "备案信息",
            items: [
              {
                label: "备案号： 粤ICP备2020116876号-1",
                href: "https://beian.miit.gov.cn/",
              },
            ],
          },
        ],
        // copyright: `{<a>https://beian.miit.gov.cn/</a>}`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
