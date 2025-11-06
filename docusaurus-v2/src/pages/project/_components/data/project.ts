import projects from "@site/data/project";
export type Tag = {
  label: string;
  description: string;
  color: string;
};

/**
 * @description: 仅支持必须小写
 */
export type TagType =
  | "favorite"
  | "opensource"
  | "product"
  | "design"
  | "javascript"
  | "typescript"
  | "python"
  | "sublimetext"
  | "vscode"
  | "vue"
  | "reactjs"
  | "nodejs"
  | "element"
  | "uni-app"
  | "vant"
  | "tailwindcss"
  | "electron"
  | "fastapi"
  | "swagger";

export type Project = {
  title: string;
  description: string;
  preview?: string;
  gif?: string;
  website: string;
  source?: string | null;
  filepath?: string;
  tags: TagType[];
};

export const Tags: Record<TagType, Tag> = {
  swagger: {
    label: "SwaggerUI",
    description: "",
    color: "#85ea2d",
  },
  fastapi: {
    label: "FastAPI",
    description: "高性能，易用，轻量，高效！",
    color: "#05988a",
  },
  electron: {
    label: "Electron",
    description: "JavaScript、HTML 和 CSS 构建跨平台的桌面应用程序，简单好用，前端福音",
    color: "#8fd3e0",
  },
  tailwindcss: {
    label: "TailwindCSS",
    description: "目前为止最好用的书写css框架，没有之一",
    color: "#38bdf8",
  },
  vant: {
    label: "Vant",
    description: "Vant 是一个轻量、可靠的移动端组件库，于 2017 年开源。",
    color: "#36d7b7",
  },
  "uni-app": {
    label: "uni-app",
    description:
      "使用 Vue.js 开发所有前端应用的框架，开发者编写一套代码，可发布到iOS、Android、Web（响应式）、以及各种小程序",
    color: "#2b993a",
  },
  element: {
    label: "ElementUI",
    description: "基于 Vue 3，面向设计师和开发者的组件库",
    color: "#3f85ed",
  },
  vue: {
    label: "Vue",
    description: "好用又容易上手的SAP框架",
    color: "#327959",
  },
  reactjs: {
    label: "Reactjs",
    description: "React最受欢迎的web框架之一",
    color: "#087ea4",
  },
  nodejs: {
    label: "nodejs",
    description: "前端coder最友好的后端切入点",
    color: "#43853d",
  },
  python: {
    label: "Python",
    description: "py相关项目，人工智能，ai模型等，赶上时代步伐，学起来",
    color: "#4281b3",
  },
  vscode: {
    label: "VScode插件",
    description: "原创VSCode插件，大大提供团队搬砖效率",
    color: "#2376ae",
  },
  sublimetext: {
    label: "ST插件",
    description: "原创SublimeText插件，大大提供团队搬砖效率",
    color: "#ff8000",
  },
  favorite: {
    label: "喜爱",
    description: "我最喜欢的网站，一定要去看看!",
    color: "#ff0000",
  },
  opensource: {
    label: "开源",
    description: "开源项目可以提供灵感!",
    color: "#33ccb9",
  },
  product: {
    label: "产品",
    description: "与产品相关的项目!",
    color: "#dfd545",
  },
  design: {
    label: "设计",
    description: "设计漂亮的网站!",
    color: "#a44fb7",
  },
  javascript: {
    label: "JavaScript",
    description: "JavaScript 项目",
    color: "#dfd545",
  },
  typescript: {
    label: "TypeScript",
    description: "TypeScript 项目",
    color: "#3178c6",
  },
};

const Projects: Project[] = projects as Project[];

export const TagList = Object.keys(Tags) as TagType[];

function sortProject(sortMode: string = "suffle") {
  const result = Projects;

  // switch (sortMode) {
  //   case "suffle":
  //     return shuffle(Projects);
  // }

  // Sort by site name
  // result = sortBy(result, (user) => user.title.toLowerCase());
  // Sort by favorite tag, favorites first
  // result = sortBy(result, (user) => !user.tags.includes('javascript'));
  return result;
}

export const sortedProjects = sortProject();
