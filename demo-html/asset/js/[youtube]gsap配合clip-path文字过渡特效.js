/*
 * @Author: Capsion 373704015@qq.com
 * @Date: 2025-11-10 21:58:29
 * @LastEditors: Capsion 373704015@qq.com
 * @LastEditTime: 2025-11-10 23:19:31
 * @FilePath: \cps-blog2025\demo-html\asset\js\[youtube]gsap配合clip-path文字过渡特效.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const sideTL = gsap.timeline();
const maskTL = gsap.timeline();
const mainTL = gsap.timeline({
    repeat: -1,
    onRepeat: () => {
        console.log("onRepeat");
        gsap.set("#texttwo", { opacity: 0 });
        gsap.set("#bar", { scaleY: 0.1 });
        gsap.set("#textone h1", { opacity: 1 });
    },
});

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

maskTL
    .to("#textone", {
        duration: 1.5,
        ease: "back.inOut(0.8)",
        clipPath: "polygon(0% 0%, 91% 0%, 81% 100%, 0% 100%)",
        onComplete: () => {
            gsap.set("#texttwo", { opacity: 1 });
        },
    })

    .to("#textone", {
        duration: 1.5,
        delay: 0.5,
        ease: "back.inOut(0.8)",
        clipPath: "polygon(0% 0%, 18% 0%, 8% 100%, 0% 100%)",
        onComplete: () => {
            gsap.to("#textone h1", { opacity: 0 });
        },
    })

    .to("#textone", {
        duration: 1.5,
        delay: 0.5,
        ease: "back.inOut(0.8)",
        clipPath: "polygon(0% 0%, 91% 0%, 81% 100%, 0% 100%)",
    });

gsap.set("#texttwo", { opacity: 0 });
gsap.set("#bar", { scaleY: 0.1 });
