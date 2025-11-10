/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2025-11-10 15:22:12
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2025-11-10 17:24:09
 * @FilePath: \cps-blog\demo-html\asset\js\[youtube]gsap配合clip-path文字过渡特效.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
document.addEventListener("DOMContentLoaded", () => {
  console.log("init");
});

const sideTL = gsap.timeline();
const maskTL = gsap.timeline();
const mainTL = gsap.timeline();

mainTL.add(sideTL).add(maskTL, 1.5);

sideTL
  .to("#bar", {
    duration: 1,
    y: 225,
    scaleY: 1,
    ease: "back.out",
  })

  .to("#slidebar", {
    duration: 1.5,
    delay: 0.5,
    x: 600,
    ease: "back.inOut(0.8)",
  })

  .to("#slidebar", {
    duration: 1.5,
    delay: 0.5,
    x: 0,
    ease: "back.inOut(0.8)",
  })

  .to("#slidebar", {
    duration: 1.5,
    delay: 0.5,
    x: 600,
    ease: "back.inOut(0.8)",
  })

  .to("#bar", {
    duration: 1,
    y: 500,
    scaleY: 0.1,
    ease: "back.out",
  });

maskTL.to("#textone", {
  duration: 1.5,
  ease: "back.inOut(0.8)",
  clipPath: "polygon(0% 0%, 91% 0%, 81% 100%, 0% 100%)",
  onComplete: () => {
    gsap.set("#texttwo", { opacity: 1 });
  },
});

maskTL.to("#textone", {
  duration: 1.5,
  ease: "back.inOut(0.8)",
  clipPath: "polygon(0% 0%, 18% 0%, 8% 100%, 0% 100%)",
  onComplete: () => {
    gsap.to("#textone h1", { opacity: 0 });
  },
});
