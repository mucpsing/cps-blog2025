/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2025-03-04 08:47:28
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2025-11-06 08:33:22
 * @FilePath: \cps-blog-docusaurus-v3\src\pages\Home\Skill.tsx
 * @Description:
 */
import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DEFAULT_SUB_COLOR, DEFAULT_MAIN_COLOR } from "@site/src/store";

const SkillComponents = ({ colorIndex: number }) => {
  // useEffect(() => {
  //   gsap.registerPlugin(useGSAP, ScrollTrigger);
  // });

  return (
    <div>
      <div className="flex-row h-full flex-nowrap">
        {DEFAULT_MAIN_COLOR.map((color, key) => {
          return (
            <div key={key} className="w-screen h-full" style={{ backgroundColor: color }}>
              {key}
            </div>
          );
        })}
      </div>

      <div></div>
    </div>
  );
};
export default SkillComponents;
