/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2025-02-10 14:58:40
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2025-02-20 15:16:07
 * @FilePath: \cps-blog-docusaurus-v3\src\components\FallingItemsList.ts
 * @Description: 这是一个随机网格下落的动态效果生成组件
 * @comeform: https://github.com/chokcoco/iCSS/issues/235
 * @example: <ul id="yourElementId"></ul>
 */

function randomNum(max: number, min: number = 0, u: number = 1): number {
  return (min + Math.floor(Math.random() * (max + 1))) * u;
}

function randomColor(opacity: number = null): string {
  if (opacity) {
    return `rgba(${randomNum(255)}, ${randomNum(255)}, ${randomNum(255)}, ${opacity})`;
  }
  return `rgb(${randomNum(255)}, ${randomNum(255)}, ${randomNum(255)})`;
}

function main(elementId: string, count: number = 51): void {
  const container = document.getElementById(elementId);
  if (!container) return;

  container.style.display = "flex";
  container.style.gap = "4px";
  container.style.flexDirection = "row";
  container.style.flexWrap = "wrap";
  container.style.justifyContent = "center";
  container.style.width = "660px";
  container.style.height = "420px";

  // Clear existing items
  container.innerHTML = "";

  // Generate 'count' list items with random styles
  for (let i = 0; i < count; i++) {
    const li = document.createElement("li");
    li.style.flexShrink = "0";
    li.style.height = "30px";
    li.style.borderRadius = "30px";
    li.style.width = `${randomNum(110, 90)}px`;
    li.style.backgroundColor = randomColor();
    li.style.transition = "opacity 0.3s"; // Added transition for opacity

    container.appendChild(li);
  }

  // Apply hover effect
  container.addEventListener("mouseover", () => {
    const listItems = container.querySelectorAll("li");
    listItems.forEach((li, index) => {
      // Set opacity to 0
      li.style.opacity = "0";

      // Set animation delay and keyframes
      const animationDelay = `${50 * (count - index) + (Math.random() * 150 - Math.random() * 300)}ms`;
      li.style.animation = `falldown 0.3s cubic-bezier(.44, .02, .65, 1.3) ${animationDelay} forwards`;
    });
  });

  // Define keyframes for the "falldown" animation
  const styleSheet = document.styleSheets[0] as CSSStyleSheet;
  const falldownKeyframes = `
        @keyframes falldown {
            0% {
                transform: translateY(-180px) scaleX(.1) scaleY(.3);
                opacity: 1;
            }
            20% {
                transform: translateY(-200px) scaleX(.6) scaleY(.3);
            }
            75% {
                transform: translateY(0) scaleX(.6) scaleY(.3);
            }
            100% {
                transform: translateY(0) scaleX(1) scaleY(1);
                opacity: 1;
            }
        }
    `;
  styleSheet.insertRule(falldownKeyframes, styleSheet.cssRules.length);
}

export default main;
