import * as fs from "fs";

/**
 * @Description - 提取名人名言生成成字符串列表
 *
 * @param {string} filePath  - 名人名言对应的md文件
 *
 * @returns {string[]} - {description}
 *
 */
export function extractTagline(filePath: string) {
  const data = fs.readFileSync(filePath, { encoding: "utf8" });
  const dataList = data.split(/\r\n|\n|\r/gm);

  let talker = "";
  let context = "";
  const taglineList: string[] = [];
  dataList.forEach((eachLine) => {
    if (eachLine.trim().startsWith("### ")) {
      talker = eachLine.replace("### ", "");
    } else if (eachLine.trim().startsWith("- ")) {
      context = eachLine.replace("- ", "");

      if (talker && context) {
        context = `${talker}: ${context}`;
      }

      taglineList.push(context);
    }
  });

  return taglineList;
}

// (async () => {
//   const taglineMdPath = path.resolve("../docs/【07】常识科普/社会真实/名人名言.md");
//   const l = await extractTagline(taglineMdPath);
//   console.log('l: ', l);
// })();
