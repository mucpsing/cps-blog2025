"use strict";
/*
 * @Author: CPS holy.dandelion@139.com
 * @Date: 2023-03-25 16:10:31
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2025-10-27 15:06:02
 * @filepath: \cps-blog\scripts\utils.ts
 * @Description: 一些会被重复调用的工具函数
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNavItemByDir = createNavItemByDir;
exports.readMarkdownInfo = readMarkdownInfo;
exports.createProjectDataByFolder = createProjectDataByFolder;
const fs = __importStar(require("fs"));
const fsp = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const yaml = __importStar(require("yaml"));
/**
 * @description: 根据指定的文件夹生成菜单：学习笔记 【子菜单】
 * @param {string} targetPath 指定的文件夹
 * @param {string} excludeDirList 一些不想包含在内的目录
 * @param {boolean} inDeep 是否递归读取，如果递归，则列出所有md文件，否则仅列出顶层的目录
 * @param {string} prefixUrl url的前缀，如果使用inDeep，这个是必须的
 */
function createNavItemByDir({ targetPath, includeDirList = null, excludeDirList = null, inDeep = false, prefixUrl = "" }) {
    if (!excludeDirList)
        excludeDirList = Array();
    if (!includeDirList)
        includeDirList = Array();
    const urlDocsPath = "docs";
    let resList = fs.readdirSync(targetPath);
    // 新增过滤逻辑：优先使用 includeDirList
    if (includeDirList && includeDirList.length > 0) {
        resList = resList.filter((item) => includeDirList.includes(item));
    }
    let dirname = path.basename(targetPath);
    if (dirname == "docs_dev")
        dirname = dirname.replace(dirname, urlDocsPath);
    console.log({ dirname });
    let navbarItemList = [];
    resList.forEach((rootDirFile) => {
        let fullPath = path.join(targetPath, rootDirFile);
        let stat = fs.statSync(fullPath);
        // 存在与排除列表，不进行添加
        if (excludeDirList.includes(rootDirFile))
            return;
        // inDeep空值是否展开目录，目前仅支持2层读取，不想处理太多递归问题
        if (!inDeep) {
            if (stat.isDirectory()) {
                navbarItemList.push({
                    to: prefixUrl ? `${prefixUrl}/${rootDirFile}` : `${dirname}/${rootDirFile}`,
                    label: rootDirFile,
                    filepath: fullPath,
                });
            }
        }
        else {
            if (stat.isDirectory()) {
                let fileSubList = fs.readdirSync(fullPath);
                // 该目录存在index.md的话，仅将index.md暴露出来
                if (fileSubList.includes("index.md")) {
                    navbarItemList.push({
                        to: prefixUrl ? `${prefixUrl}/${rootDirFile}` : `${rootDirFile}`,
                        label: `${rootDirFile}`,
                        filepath: path.join(fullPath, "index.md"),
                    });
                }
                else {
                    // 不存在index.md 将生成 【目录名】+ 文件名 的方式进行暴露
                    fileSubList.forEach((eachSubFile) => {
                        let fullSubPath = path.join(fullPath, eachSubFile);
                        if (excludeDirList.includes(eachSubFile))
                            return;
                        if (fs.statSync(fullSubPath).isFile() && eachSubFile.endsWith(".md")) {
                            const basename = eachSubFile.split(".")[0];
                            navbarItemList.push({
                                to: prefixUrl ? `${prefixUrl}/${rootDirFile}/${basename}` : `${rootDirFile}/${basename}`,
                                label: `【${rootDirFile}】${basename}`,
                                filepath: fullSubPath,
                            });
                        }
                    });
                }
            }
        }
    });
    return navbarItemList;
}
/**
 * @description: 读取.md文件的头部数据，头部以---开始和结束的yaml格式数据
 * @param {string} filepath
 * @return {Promise<object | undefined>}
 */
async function readMarkdownInfo(filepath) {
    const data = await fsp.readFile(filepath, { encoding: "utf8" });
    const FIND_FLAG = "---";
    let dataList = data.split(/[(\r\n)\r\n]+/);
    let regionLine = [];
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
        if (regionLine.length != 2)
            return undefined;
        const infoData = dataList.slice(regionLine[0] + 1, regionLine[1] - regionLine[0]).join("\n");
        const yaml2Json = yaml.parse(infoData);
        return yaml2Json;
    }
    catch (error) {
        return undefined;
    }
    return undefined;
}
/**
 * @description: 生成/data/project.js数据，对应项目project页和home页组件使用的数据
 * @param {string} filepathList 要读取的文件夹，主要调用createNavItemByDir生成基础数据
 * @param {string} prefixUrl 对应文件夹要生成的url前缀
 * @param {string} outputPath 数据最终导出的js文件，以CommontJS格式导出
 * @return {*}
 */
async function createProjectDataByFolder(filepathList, prefixUrl, outputPath) {
    const fileInfoList = [];
    for (let index = 0; index < filepathList.length; index++) {
        fileInfoList.push(...createNavItemByDir({
            targetPath: filepathList[index],
            excludeDirList: ["index.md"],
            inDeep: true,
            prefixUrl: prefixUrl[index],
        }));
    }
    let mdDataList = [];
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
