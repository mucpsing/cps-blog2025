"use strict";
/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2025-11-28 08:49:58
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2025-11-28 10:29:37
 * @FilePath: \cps-blog\demo-html\asset\ts\[cps-blog]鼠标跟随icon效果.ts
 * @Description: 这是一个根据坐标来快速生成指定元素的组件
 * @example:
 * <script type="module">
 *     import { MouseTracker } from "/asset/js/esm/[cps-blog]鼠标跟随icon效果.js";
 *     gsap.registerPlugin(CustomEase);
 *
 *     console.log(CPS_SCRIPTS);
 *
 *     const mouseTracker = new MouseTracker(document.body, {
 *         threshold: 120,
 *         count: 30,
 *         parentId: "",
 *         DEBUG: false,
 *         iconsList: CPS_SCRIPTS.skillIcons,
 *         size: 26,
 *         iconPath: "/asset/icons/skill-icons/",
 *     });
 *
 *     mouseTracker.addTrackerToMouse();
 * </script>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MouseTracker = exports.Utils = void 0;
function extendArray(length, arr) {
    if (length <= 0 || arr.length === 0) {
        return [];
    }
    if (arr.length >= length) {
        return arr.slice(0, length);
    }
    const repeatTimes = Math.ceil(length / arr.length);
    // const repeated = Array(repeatTimes).fill(arr).flat();
    const repeated = [].concat(...Array(repeatTimes).fill(arr));
    return repeated.slice(0, length);
}
/**
 * @description: 在元素生成时添加一个滞后偏移量，使元素在生成时不会立即出现在屏幕上
 * @param {string} direction
 */
const calculateOffset = (direction) => {
    const baseOffset = 80;
    const baseRotate = 140;
    const baseRotate2 = -500;
    // 查找表：定义各方向对应的 x, y 偏移倍数和旋转符号
    // 部分方向偏移后效果不好，这里注销掉
    const mapping = {
        left: { x: -1, y: 0, r: -1 },
        // leftBottom: { x: -1, y: 1, r: -1 },
        leftTop: { x: -1, y: -1, r: -1 },
        right: { x: 1, y: 0, r: 1 },
        rightTop: { x: 1, y: 1, r: 1 },
        // rightBottom: { x: 1, y: 1, r: 1 },
    };
    // 获取指定方向的倍数，若无则使用默认值（即偏移量 0，旋转保持原值）
    const { x, y, r } = mapping[direction] || { x: 0, y: 0, r: 1 };
    return {
        offsetX: x * baseOffset,
        offsetY: y * baseOffset,
        rotate1: r * baseRotate,
        rotate2: r * baseRotate2,
    };
};
const calculateDistance = (p1, p2) => {
    // 如果两个点相同，返回 null， top和bottom不执行任何偏移
    if (p1.x === p2.x && p1.y === p2.y)
        return { distance: 0, direction: "top" };
    // 计算差值（方向应为 p1 指向 p2）
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    // 计算欧几里得距离
    const distance = Math.sqrt(dx * dx + dy * dy);
    // 计算角度（弧度转为角度，并转换为 0° - 360° 范围内）
    const thetaRad = Math.atan2(dy, dx);
    const thetaDeg = ((thetaRad * 180) / Math.PI + 360) % 360;
    // 定义八个方向的查找表
    const directions = DIRECTIONS || ["right", "rightTop", "top", "leftTop", "left", "leftBottom", "bottom", "rightBottom"];
    // 将角度加 22.5° 后，分成 45° 的区间，得到方向索引
    const index = Math.floor((thetaDeg + 22.5) / 45) % 8;
    const direction = directions[index];
    return { distance, direction };
};
exports.Utils = {
    extendArray,
    calculateOffset,
    calculateDistance,
};
const DIRECTIONS = ["right", "rightTop", "top", "leftTop", "left", "leftBottom", "bottom", "rightBottom"];
/**
 * @description:
 * @example:
 *
 *import { MouseTracker } from "/asset/js/esm/[cps-blog]鼠标跟随icon效果.js";
 *gsap.registerPlugin(CustomEase);
 
 *console.log(CPS_SCRIPTS);
 
 *const mouseTracker = new MouseTracker(document.body, {
 *    threshold: 120,
 *    count: 30,
 *    parentId: "",
 *    DEBUG: false,
 *    iconsList: CPS_SCRIPTS.skillIcons,
 *    size: 26,
 *    iconPath: "/asset/icons/skill-icons/",
 *});
 
 *mouseTracker.addTrackerToMouse();
 *
 */
class MouseTracker {
    constructor(container, config) {
        /** 默认配置 */
        this.defaultConfig = {
            threshold: 120,
            count: 30,
            parentId: "",
            DEBUG: false,
            iconsList: [],
            size: 25,
            iconPath: "/",
        };
        this.eventDistoryMethodList = [];
        this.distanceTraveled = 0;
        this.pointCount = 0;
        this.recordedPoints = [];
        this.pointPool = [];
        this.CustomEase = { c1: null, c2: null };
        // 参数验证
        if (!container) {
            throw new Error("容器元素不能为空");
        }
        if (!(container instanceof HTMLElement)) {
            throw new Error("容器必须是有效的HTMLElement");
        }
        if (!window.gsap) {
            console.error("没有依赖：gsap");
            return;
        }
        // 创建粒子动画
        if (!window.CustomEase) {
            console.error("没有依赖：gsap CustomEase");
            return;
        }
        gsap.registerPlugin(window.CustomEase);
        this.CustomEase.c1 = window.CustomEase.create("c1", "0.475, -0.210, 0.000, 1.240");
        this.CustomEase.c2 = window.CustomEase.create("c2", "0.000, 0.020, 0.000, 1.650");
        this.parentEl = container;
        this.pointContainerRangeEL = document.createElement("div");
        this.config = Object.assign(Object.assign({}, this.defaultConfig), config);
        this.init();
    }
    init() {
        // this.pointContainerRangeEL.id = pointContainerId;
        Object.assign(this.pointContainerRangeEL.style, { position: "absolute", top: 0, left: 0 });
        const pointInitStyle = {
            position: "absolute",
            pointerEvents: "none",
            width: `${this.config.size}px`,
            height: `${this.config.size}px`,
            opacity: "0",
            backgroundColor: this.config.iconsList.length > 0 ? "" : "#ff6b6b",
            zIndex: 30,
        };
        this.pointPool.length = 0;
        const iconList = extendArray(this.config.count, this.config.iconsList);
        iconList.forEach((eachIcon, index) => {
            setTimeout(() => {
                const eachPointRef = document.createElement("div");
                const eachImgEl = document.createElement("img");
                eachImgEl.style.width = "100%";
                eachImgEl.style.height = "100%";
                eachImgEl.src = `${this.config.iconPath}/${eachIcon}`;
                eachPointRef.appendChild(eachImgEl);
                Object.assign(eachPointRef.style, pointInitStyle);
                this.pointPool.push(eachPointRef);
                this.pointContainerRangeEL.appendChild(eachPointRef);
            }, index * 10); // 每10ms加载一个，避免阻塞
        });
        this.parentEl.appendChild(this.pointContainerRangeEL);
        return this;
    }
    distory() {
        this.pointContainerRangeEL.remove();
        this.eventDistoryMethodList.forEach((eachDistoryMethod) => eachDistoryMethod());
        this.eventDistoryMethodList.length = 0;
    }
    /**
     * @param {number} x
     * @param {number} y
     * @param {string} offseDir 来源的方向
     */
    createParticleAnimation(x, y, offseDir = "top") {
        // 冲元素池中提取一个透明度为0的元素来进行动画
        const availableParticle = this.pointPool.find((el) => el.style.opacity === "0");
        if (!availableParticle)
            return;
        const { offsetX, offsetY, rotate1, rotate2 } = calculateOffset(offseDir);
        // 设置元素初始位置
        // 这里嵌套编写目的时为了过度效果更加跟手和丝滑
        gsap.set(availableParticle, {
            x: x + offsetX,
            y: y + offsetY,
            opacity: 0,
            scale: 0.2,
            rotate: rotate1,
            onComplete: () => {
                /* 元素放大，带弹性效果 */
                gsap.to(availableParticle, {
                    opacity: 0.8,
                    scale: 2,
                    duration: 0.9,
                    rotate: 0,
                    ease: "c1",
                    x,
                    y,
                    onComplete: () => {
                        // 元素放大后设置落下效果
                        gsap.to(availableParticle, {
                            y: window.innerHeight + 100,
                            rotate: rotate2,
                            duration: 3,
                            delay: 0.03,
                            ease: "c2",
                            opacity: 0,
                        });
                    },
                });
            },
        });
    }
    addTrackerToMouseMove() {
        const handleMouseMove = (e) => {
            const rect = this.parentEl.getBoundingClientRect();
            const currentPoint = { x: e.clientX - rect.x, y: e.clientY - rect.y };
            this.createIcon(currentPoint);
        };
        window.addEventListener("mousemove", handleMouseMove);
        this.eventDistoryMethodList.push(() => window.removeEventListener("mousemove", handleMouseMove));
    }
    createIcon(coords) {
        if (!this.lastPoint)
            return (this.lastPoint = coords);
        const distance = calculateDistance(coords, this.lastPoint);
        this.distanceTraveled += distance.distance;
        if (this.distanceTraveled >= this.config.threshold) {
            this.recordedPoints.push(Object.assign({}, coords));
            this.distanceTraveled = 0;
            this.pointCount = this.recordedPoints.length;
            this.createParticleAnimation(coords.x, coords.y, distance.direction);
        }
        this.lastPoint = coords;
    }
}
exports.MouseTracker = MouseTracker;
if (!window.CPS_SCRIPTS)
    window.CPS_SCRIPTS = {};
window.CPS_SCRIPTS.MouseTracker = MouseTracker;
const gsap = window.gsap;
