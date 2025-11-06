gsap.registerPlugin(ScrollTrigger);

window.addEventListener("load", () => {
  const sections = gsap.utils.toArray("#my-component .step-base");
  const container = document.querySelector("#my-component");

  // 设置容器宽度（横向滚动总宽）
  const totalWidth = container.scrollWidth;
  gsap.set(container, { height: "100vh" }); // 可选，让组件区域撑满屏幕

  // 创建水平滚动动画
  const horizontalScroll = gsap.to(sections, {
    xPercent: -100 * (sections.length - 1),
    ease: "none",
    scrollTrigger: {
      trigger: container,
      start: "top center",
      end: () => `+=${container.scrollWidth}`, // 滚动距离与宽度对应
      pin: true, // 固定住容器
      scrub: 1, // 平滑滚动
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });
});
