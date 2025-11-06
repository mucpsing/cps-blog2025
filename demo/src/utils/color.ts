export function hexToRgba(hex: string, alpha: number = 1): string {
  // 去除十六进制字符串开头的 # 符号
  const trimmedHex = hex.replace(/^#/, "");

  // 检查处理后的长度是否为3或6，否则抛出错误
  if (![3, 6].includes(trimmedHex.length)) {
    throw new Error("无效的十六进制颜色格式，应为3或6位字符。");
  }

  let fullHex = trimmedHex;
  // 将3位格式扩展为6位格式（例如：'fff' → 'ffffff'）
  if (trimmedHex.length === 3) {
    fullHex = trimmedHex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  // 解析RGB各分量
  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);

  // 检查解析结果是否为有效数字
  if ([r, g, b].some((val) => isNaN(val))) {
    throw new Error("十六进制包含非法字符。");
  }

  // 验证透明度范围
  if (alpha < 0 || alpha > 1) {
    throw new Error("透明度值需在0到1之间。");
  }

  // 返回RGBA格式字符串
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
