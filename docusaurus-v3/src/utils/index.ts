export function randomNum(max: number, min: number = 0, u: number = 1): number {
  return (min + Math.floor(Math.random() * (max + 1))) * u;
}

export function randomColor(opacity: number = null): string {
  if (opacity) {
    return `rgba(${randomNum(255)}, ${randomNum(255)}, ${randomNum(255)}, ${opacity})`;
  }
  return `rgb(${randomNum(255)}, ${randomNum(255)}, ${randomNum(255)})`;
}

export function invertColor(color: string): string {
  // RGB 颜色反转
  const rgbRegex = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/;
  const rgbaRegex = /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([0-1]?(?:\.\d+)?)\)$/;
  const hexRegex = /^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/;

  // 如果是 rgb 格式
  if (rgbRegex.test(color)) {
    const [, r, g, b] = color.match(rgbRegex)!.map(Number);
    return `rgb(${255 - r}, ${255 - g}, ${255 - b})`;
  }

  // 如果是 rgba 格式
  if (rgbaRegex.test(color)) {
    const [, r, g, b, a] = color.match(rgbaRegex)!.map((v, i) => (i === 3 ? parseFloat(v) : Number(v)));
    // return `rgba(${255 - r}, ${255 - g}, ${255 - b}, ${a})`; // 保持 alpha 不变
    return `rgb(${255 - r}, ${255 - g}, ${255 - b})`; // 去掉 alpha
  }

  // 如果是 hex 格式
  if (hexRegex.test(color)) {
    let hex = color.slice(1); // 去掉 '#' 字符
    // 如果是 3 位格式（#RGB），则转成 6 位格式（#RRGGBB）
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((x) => x + x)
        .join("");
    }

    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    return `#${(255 - r).toString(16).padStart(2, "0")}${(255 - g).toString(16).padStart(2, "0")}${(255 - b).toString(16).padStart(2, "0")}`;
  }

  // 如果是 HSL 格式
  const hslRegex = /^hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)$/;
  if (hslRegex.test(color)) {
    const [, h, s, l] = color.match(hslRegex)!.map(Number);

    // 反转 HSL 的 L（亮度）
    const invertedL = 100 - l;
    return `hsl(${h}, ${s}%, ${invertedL}%)`;
  }

  // 如果是 hsla 格式
  const hslaRegex = /^hsla\((\d+),\s*(\d+)%,\s*(\d+)%\s*,\s*([0-1]?(?:\.\d+)?)\)$/;
  if (hslaRegex.test(color)) {
    const [, h, s, l, a] = color.match(hslaRegex)!.map((v, i) => (i === 3 ? parseFloat(v) : Number(v)));
    // 反转 HSL 的 L（亮度）
    const invertedL = 100 - l;
    return `hsla(${h}, ${s}%, ${invertedL}%, ${a})`;
  }

  // 如果没有匹配到任何已知格式，直接返回原颜色
  return color;
}

/**
 * 更新:root中的CSS自定义属性（变量）
 * @param {Object} variables 包含要修改的变量名和对应值的对象，例如 { '--color-primary': '#f00', '--spacing': '16px' }
 */
export function updateRootVariables(variables: Record<string, string>) {
  const root = document.documentElement;
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}
