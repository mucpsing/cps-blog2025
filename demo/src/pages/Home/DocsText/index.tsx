/*
 * @Author: Capsion 373704015@qq.com
 * @Date: 2025-03-25 20:12:12
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2025-04-27 16:59:55
 * @FilePath: \gsap-lenis-learn\src\components\CapsionText\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState, useEffect, useRef } from "react";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { descriptionText } from "@site/src/store";

gsap.registerPlugin(useGSAP);

const HomeDocsText: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <article className={[className, "text-start max-w-[50vw] leading-[2] text-[.8rem]"].join(" ")}>
      <p>{descriptionText[0]}</p>
    </article>
  );
};

export default HomeDocsText;
