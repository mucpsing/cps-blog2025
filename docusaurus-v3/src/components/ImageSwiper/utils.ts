export const isSupportWebp = (): boolean => {
  try {
    return document.createElement("canvas").toDataURL("image/webp", 0.5).indexOf("data:image/webp") === 0;
  } catch (err) {
    return false;
  }
};

/**
 * @description: 替换后缀名称未.webp，用来给cdn加速的，但要先确保cdn支持webp
 * @param {string} imgUrl
 * @return {*}
 */
export function imgUrl2Webp(imgUrl: string): string {
  const suffix = `(bmp|jpg|png|tif|gif|pcx|tga|exif|fpx|svg|psd|cdr|pcd|dxf|ufo|eps|ai|raw|WMF|webp|jpeg)`;
  const regular = new RegExp(`\.${suffix}$`);
  try {
    return imgUrl.replace(regular, ".webp");
  } catch (err) {
    return imgUrl;
  }
}

// const test = "https://capsion.top/xxxx/cavd.jpeg";
// console.log(imgUrl2Webp(test));
