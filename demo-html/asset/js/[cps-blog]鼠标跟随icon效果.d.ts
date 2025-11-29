declare function extendArray<T>(length: number, arr: T[]): T[];
export declare const Utils: {
    extendArray: typeof extendArray;
    calculateOffset: (direction: directionT) => {
        offsetX: number;
        offsetY: number;
        rotate1: number;
        rotate2: number;
    };
    calculateDistance: (p1: Point, p2: Point) => {
        distance: number;
        direction: directionT;
    };
};
declare global {
    interface Window {
        recordedPoints: Point[];
        CustomEase: any;
        gsap: any;
    }
}
declare const DIRECTIONS: readonly ["right", "rightTop", "top", "leftTop", "left", "leftBottom", "bottom", "rightBottom"];
export type directionT = (typeof DIRECTIONS)[number];
export interface Point {
    x: number;
    y: number;
    dir?: string;
}
export interface MouseTrackerConfig {
    triggerDistance?: number;
    count?: number;
    parentId?: string;
    DEBUG?: boolean;
    size?: number;
    iconPath?: string;
    iconsList?: string[];
}
/**
 * @description:
 * @example:
 *
 *import { MouseTracker } from "/asset/js/esm/[cps-blog]鼠标跟随icon效果.js";
 *gsap.registerPlugin(CustomEase);
 
 *console.log(CPS_SCRIPTS);
 
 *const mouseTracker = new MouseTracker(document.body, {
 *    triggerDistance: 120,
 *    count: 30,
 *    parentId: "",
 *    DEBUG: false,
 *    iconsList: CPS_SCRIPTS.skillIcons,
 *    size: 26,
 *    iconPath: "/asset/icons/skill-icons/",
 *});
 
 *mouseTracker.triggerOnMouseMove();
 *
 */
export declare class MouseTracker {
    /** 默认配置 */
    private readonly defaultConfig;
    /** 当前配置 */
    private config;
    /** 容器元素 */
    private parentEl;
    private pointContainerRangeEL;
    private eventDistoryMethodList;
    lastPoint: Point;
    distanceTraveled: number;
    pointCount: number;
    recordedPoints: Point[];
    private pointPool;
    private CustomEase;
    constructor(container: HTMLElement, config: MouseTrackerConfig);
    init(): this;
    distory(): void;
    /**
     * @param {number} x
     * @param {number} y
     * @param {string} offseDir 来源的方向
     */
    private createParticleAnimation;
    triggerOnMouseMove(): void;
    triggerOnTouch(): void;
    createIcon(coords: Point): Point;
}
export {};
