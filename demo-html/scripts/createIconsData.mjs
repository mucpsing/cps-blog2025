/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2025-11-28 08:49:58
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2025-11-28 08:51:37
 * @FilePath: \cps-blog\demo-html\scripts\createIconsData.mjs
 * @Description: 这是生成iconlist的脚本，如果添加了新的icon，最好都执行一下
 */
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * @description: 原地打乱数组的顺序，实现每次随机
 */
function shuffleArray(array) {
  // 注意这里用 let m = array.length 而不是 const
  for (let m = array.length; m > 0; m--) {
    // 生成 [0, m) 范围内的随机索引
    const randomIndex = Math.floor(Math.random() * m);
    // ES6 解构赋值交换元素
    [array[m - 1], array[randomIndex]] = [array[randomIndex], array[m - 1]];
  }
  return array;
}

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconDir = '../asset/icons/skill-icons/';

const iconDirPath = path.join(path.resolve(__dirname), iconDir);

const svgFiles = fs.readdirSync(iconDirPath).filter(file => file.endsWith('.svg'));

const skillIcons = shuffleArray(svgFiles);

const exportData = `
if(!window.CPS_SCRIPTS) window.CPS_SCRIPTS = {}
window.CPS_SCRIPTS.skillIcons = ["${skillIcons.join('\",\"')}"]
`

fs.writeFileSync(path.join(iconDirPath, 'import-skill-icons-data.js'), exportData)
