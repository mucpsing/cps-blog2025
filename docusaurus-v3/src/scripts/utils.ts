/*
 * @Author: CPS holy.dandelion@139.com
 * @Date: 2023-03-25 16:10:31
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2025-10-31 08:54:45
 * @filepath: \cps-blog\scripts\utils.ts
 * @Description: 一些会被重复调用的工具函数
 */

import * as fs from "fs";
import * as fsp from "fs/promises";
import * as path from "path";
import * as yaml from "yaml";
// import { shuffle } from "lodash";
// import type { NavbarItem } from "@docusaurus/theme-common/src/utils/useThemeConfig";

export type NavbarItem = {
  type?: string | undefined;
  items?: NavbarItem[];
  label?: string;
  position?: "left" | "right";
} & { [key: string]: unknown };

type NewNavbarItem = {
  filepath: string;
  title?: string;
  tags?: string[];
  description?: string;
  website?: string;
  github?: string;
  gitee?: string;
} & NavbarItem;
export interface NavItemParams {
  targetPath: string;
  excludeDirList?: string[] | null;
  includeDirList?: string[] | null;
  inDeep?: boolean;
  prefixUrl?: string;
}

/**
 * @description: 因为根目录没有index.md的话会报错，所以需要创建index.md
 * @param {string} folderPath
 * @param {string} mdName
 * @return {*}
 */
function createIndexMdFileByFolder(folderPath: string, mdName: string) {
  console.log("开始创建index.md文件...");

  let fileList = fs.readdirSync(folderPath);
  const indexMd = path.join(folderPath, mdName);
  const basename = path.basename(folderPath);
  const title = ["---", `title: ${basename}`, "---", "## 文章列表"];
  const data = [];

  for (let each of fileList) {
    if ([mdName, "index.md"].includes(each)) continue;
    const tar = path.join(folderPath, each);
    if (fs.statSync(tar).isDirectory()) data.push(`- ### ${each}`);
  }

  if (data.length > 0) fs.writeFileSync(indexMd, [...title, ...data].join("\n"));
}

/**
 * @description: 手动生成文档的目录，生成根目录下的index.md文件
 * @param {string} targetPath 指定的文件夹
 * @param {string[]} excludeDirList 需要排除的文件夹
 * @param {string} prefixUrl url的前缀，如果使用inDeep，这个是必须的
 */
export function createNavItemByDir({ targetPath, includeDirList = null, excludeDirList = null, prefixUrl = "" }: NavItemParams) {
  console.log("DEV: createNavItemByDir()", targetPath);
  if (!excludeDirList) excludeDirList = Array();
  if (!includeDirList) includeDirList = Array();

  let resList = fs.readdirSync(targetPath);
  // 新增过滤逻辑：优先使用 includeDirList
  if (includeDirList && includeDirList.length > 0) {
    resList = resList.filter((item) => includeDirList.includes(item));
  }

  let dirname = path.basename(targetPath);

  let navbarItemList: NewNavbarItem[] = [];
  resList.forEach((rootDirFile) => {
    let fullPath = path.join(targetPath, rootDirFile);
    let stat = fs.statSync(fullPath);
    const routeName = "index";

    // 存在与排除列表，不进行添加
    if ((excludeDirList as string[]).includes(rootDirFile)) return console.log("createNavItemByDir() 存在与排除列表，不进行添加");

    if (stat.isDirectory()) {
      navbarItemList.push({
        to: prefixUrl ? `${prefixUrl}/${rootDirFile}/${routeName}` : `${dirname}/${rootDirFile}`,
        label: rootDirFile,
        filepath: path.join(targetPath, rootDirFile),
      });

      createIndexMdFileByFolder(fullPath, `${routeName}.md`);
    }
  });

  console.log(navbarItemList);
  return navbarItemList;
}

/**
 * @description: 读取.md文件的头部数据，头部以---开始和结束的yaml格式数据
 * @param {string} filepath
 * @return {Promise<object | undefined>}
 */
export async function readMarkdownInfo(filepath: string): Promise<object | undefined> {
  const data = await fsp.readFile(filepath, { encoding: "utf8" });
  const FIND_FLAG = "---";

  let dataList = data.split(/[(\r\n)\r\n]+/);
  let regionLine: number[] = [];
  let hasStartFlag = false;

  dataList.forEach((eachLine, index) => {
    if (eachLine.trim() == FIND_FLAG) {
      // console.log(1, eachLine);
      // 查找头部
      if (!hasStartFlag) {
        regionLine.push(index);
        hasStartFlag = true;
        return;
      }
      // console.log(2);

      if (hasStartFlag) {
        // 查找尾部
        regionLine.push(index);
        hasStartFlag = false;
        return;
      }
    }
  });

  try {
    // 仅找到头部，没有找到尾部，不属于包裹
    if (regionLine.length != 2) return undefined;

    const infoData = dataList.slice(regionLine[0] + 1, regionLine[1] - regionLine[0]).join("\n");

    const yaml2Json = yaml.parse(infoData);

    return yaml2Json;
  } catch (error) {
    return undefined;
  }

  return undefined;
}

/**
 * @description: 读取指定md文件的头部frontmaster信息，转换成json数据以cjs格式导出，供项目页面直获取数据
 * @param {string} filepathList 要读取的文件夹，主要调用createNavItemByDir生成基础数据
 * @param {string} prefixUrl 对应文件夹要生成的url前缀
 * @param {string} outputPath 数据最终导出的js文件，CommontJS格式
 */
export async function createProjectDataByFolder(filepathList: string[], prefixUrl: string[], outputPath: string): Promise<void> {
  const fileInfoList = [];
  for (let index = 0; index < filepathList.length; index++) {
    fileInfoList.push(
      ...createNavItemByDir({
        targetPath: filepathList[index],
        excludeDirList: ["index.md"],
        inDeep: true,
        prefixUrl: prefixUrl[index],
      })
    );
  }

  let mdDataList: object[] = [];
  const fileList = fileInfoList.map((item) => ({ filepath: item.filepath, website: item.to }));
  for (let index = 0; index < fileList.length; index++) {
    let res = await readMarkdownInfo(fileList[index].filepath);

    if (res) {
      // console.log("【项目】: ", fileList[index].filepath);
      mdDataList.push({ ...res, ...fileList[index] });
    }
  }

  if (mdDataList.length > 0) {
    // mdDataList = shuffle(mdDataList);

    const firstLine = "module.exports = ";
    const outputData = firstLine + [JSON.stringify(mdDataList, undefined, "  ")].join("\n");

    await fsp.writeFile(outputPath, outputData);
  }
}

/**
 * @description: 更新静态资源到static目录
 * @param {string} cssDirList
 * @return {*}
 */
export async function copyCssToStatic(cssDirList: string[]): Promise<number> {
  const staticPath = path.resolve("./static");
  const cssTargetDir = path.join(staticPath, "css");
  let count = 0;

  // 确保目标目录存在
  await fsp.mkdir(cssTargetDir, { recursive: true });

  // 使用 for...of 替代 forEach
  for (const cssDir of cssDirList) {
    try {
      // console.log(`开始处理目录: ${cssDir}`);
      const cssFiles = await fs.promises.readdir(cssDir);

      // 并行处理文件复制
      await Promise.all(
        cssFiles.map(async (cssFile) => {
          const cssFilePath = path.join(cssDir, cssFile);
          const cssFileStat = await fsp.stat(cssFilePath);

          if (cssFileStat.isFile() && cssFile.endsWith(".css")) {
            const targetPath = path.join(cssTargetDir, path.basename(cssFile));
            const cssContent = await fsp.readFile(cssFilePath, "utf8");

            await fsp.writeFile(targetPath, cssContent);
            count++;
            console.log(`已复制: ${targetPath}`);
          }
        })
      );
    } catch (error) {
      console.error(`处理目录 ${cssDir} 时出错:`, error);
      throw error; // 根据需求决定是否终止流程
    }
  }

  return count;
}

/**
 * @description: 遍历目录，以该目录的内容来生成新的index.md，确保sidebar的正确
 * @param {string} targetDir
 */
export async function createIndexMdFileToFolder(targetDir: string) {
  const resList = await fsp.readdir(targetDir);

  // 生成目录列表项内容
  const generateDirItems = async (fullPath: string) => {
    const subFolderFileList = await fsp.readdir(fullPath);
    const dirItems: string[] = [];

    for (const file of subFolderFileList) {
      const filePath = path.join(fullPath, file);
      const stat = await fsp.stat(filePath);
      if (stat.isDirectory()) dirItems.push(`- ${file}`);
    }

    return dirItems;
  };

  // 生成完整文件内容
  const generateFileContent = (title: string, dirItems: string[]) => [`# ${title}`, " ", "## 文章列表", ...dirItems].join("\n");

  for (const rootDirFile of resList) {
    const fullPath = path.join(targetDir, rootDirFile);
    if (!(await fsp.stat(fullPath)).isDirectory()) continue;

    const indexFilePath = path.join(fullPath, "index.md");
    const dirItems = await generateDirItems(fullPath);
    if (dirItems.length === 0) continue;

    const newContent = generateFileContent(rootDirFile, dirItems);
    let hasIndexMd = false;
    let contentChanged = false;
    let oldData = null; // 默认值

    try {
      oldData = await fsp.readFile(indexFilePath, "utf-8");
      hasIndexMd = true;
      contentChanged = oldData !== newContent;
    } catch (error) {
      hasIndexMd = false;
      contentChanged = true; // 文件不存在时需要新建
    }

    if (contentChanged) await fsp.writeFile(indexFilePath, newContent);
  }
}

/* 文件夹试调 */
// (async () => {
//   const defaultPath = ["./docs/【05】项目经历/原创作品/", "./docs/【05】项目经历/完整项目/"];
//   const defaultPrefix = ["/docs/【05】项目经历/原创作品", "/docs/【05】项目经历/完整项目"];
//   const output = path.resolve("./data/project.js");
//   await createProjectDataByFolder(defaultPath, defaultPrefix, output);
// })();

/* 文件试调 */
// (async function test() {
//   const target = path.resolve("./docs/【05】项目经历/完整项目/个人网站/index.md");

//   let res = await readMarkdownInfo(target);

//   console.log({ res });
// })();
