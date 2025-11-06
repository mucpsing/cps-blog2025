/*
 * @Author: Capsion 373704015@qq.com
 * @Date: 2025-05-06 21:50:39
 * @LastEditors: Capsion 373704015@qq.com
 * @LastEditTime: 2025-05-06 21:59:31
 * @FilePath: \gsap-lenis-learn\src\components\Iconfont\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { useEffect } from "react";

import "./iconfont.css";

interface IconfontProps {
  iconName: string;
  className?: string;
  iconPrefix?: string;
  [restProps: string]: any;
}

declare global {
  interface Window {
    CPS_ICONFONT_INIT: boolean;
  }
}

export function createIconfontScriptsToDOM(src: string = "") {
  if (window.CPS_ICONFONT_INIT) return;

  const ICONFIGT_SRC = src || "//at.alicdn.com/t/c/font_3959151_f86s1etjfv.js";
  const scriptElem = document.createElement("script");
  scriptElem.src = ICONFIGT_SRC;
  document.body.appendChild(scriptElem);
  window.CPS_ICONFONT_INIT = true;
}

export default function Iconfont({ iconName, className = "", iconPrefix = "", ...restProps }: IconfontProps) {
  useEffect(() => createIconfontScriptsToDOM(), []);

  return (
    <svg className={[className, "iconfontDefault"].join(" ")} aria-hidden="true" {...restProps}>
      <use xlinkHref={`#${iconPrefix}${iconName}`} />
    </svg>
  );
}
