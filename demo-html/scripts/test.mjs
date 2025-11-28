/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2025-11-28 08:49:58
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2025-11-28 08:51:37
 * @FilePath: \cps-blog\demo-html\scripts\createIconsData.mjs
 * @Description: 这是生成iconlist的数据
 */
import { readdirSync, statSync } from 'fs';
import { join, resolve, relative } from 'path';
import { fileURLToPath } from 'url';

/**
 * 模拟 Vite 的 import.meta.glob 功能
 * @param {string} pattern - 文件匹配模式
 * @param {Object} options - 配置选项
 * @returns {Object} 模块映射对象
 */
async function globImport(pattern, options = {}) {
  const { eager = false, as = 'default' } = options;
  
  // 获取当前文件所在目录
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = join(__filename, '..');
  
  // 解析别名路径（简化版，实际项目中可能需要更复杂的别名解析）
  const resolvedPattern = pattern.replace('@site', join(__dirname, '..', '..'));
  
  // 提取目录和文件匹配模式
  const [dirPath, filePattern] = parseGlobPattern(resolvedPattern);
  const regex = globToRegex(filePattern);
  
  // 读取目录并过滤文件
  const files = readdirSync(dirPath)
    .filter(file => regex.test(file))
    .map(file => join(dirPath, file))
    .filter(filePath => statSync(filePath).isFile());
  
  const result = {};
  
  for (const filePath of files) {
    const relativePath = relative(__dirname, filePath);
    
    if (as === 'url') {
      // 返回文件 URL
      result[`./${relativePath}`] = eager 
        ? `file://${filePath}`
        : async () => `file://${filePath}`;
    } else {
      // 动态导入模块
      if (eager) {
        const module = await import(filePath);
        result[`./${relativePath}`] = as === 'default' ? module.default : module;
      } else {
        result[`./${relativePath}`] = async () => {
          const module = await import(filePath);
          return as === 'default' ? module.default : module;
        };
      }
    }
  }
  
  return result;
}

/**
 * 解析 glob 模式，分离目录和文件模式
 */
function parseGlobPattern(pattern) {
  const lastSlashIndex = pattern.lastIndexOf('/');
  const dirPath = pattern.substring(0, lastSlashIndex);
  const filePattern = pattern.substring(lastSlashIndex + 1);
  return [dirPath, filePattern];
}

/**
 * 将 glob 模式转换为正则表达式
 */
function globToRegex(glob) {
  return new RegExp(
    '^' +
    glob
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.') +
    '$'
  );
}

// 使用示例
const svgFiles = await globImport("@site/public/icons/skill-icons/*.svg", { 
  eager: true, 
  as: "url" 
});


