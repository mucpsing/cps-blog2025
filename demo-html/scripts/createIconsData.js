import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 使用nodejs重新实现，转换成url
// const svgFiles = import.meta.glob("@site/public/icons/skill-icons/*.svg", { eager: true, as: "url" });

const iconDir = "../asset/icons/skill-icons/";

const iconDirPath = path.join(path.resolve(__dirname), iconDir);
console.log(iconDirPath);

const svgFiles = fs.readdirSync(iconDirPath).filter((file) => file.endsWith(".svg"));

console.log(svgFiles);

// 或者返回文件名和相对URL的映射
export const svgUrls = svgFiles.reduce((acc, file) => {
    const name = path.basename(file, ".svg");
    acc[name] = `/icons/skill-icons/${file}`;
    return acc;
}, {});
