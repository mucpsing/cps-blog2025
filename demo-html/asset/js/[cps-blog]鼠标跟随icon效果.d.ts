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
    threshold?: number;
    count?: number;
    parentId?: string;
    DEBUG?: boolean;
    size?: number;
    iconPath?: string;
    iconsList?: string[];
}
export declare class MouseTracker {
    /** 默认配置 */
    private readonly defaultConfig;
    /** 当前配置 */
    private config;
    /** 容器元素 */
    private parentEl;
    private pointContainerRangeEL;
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
    createIcon(coords: Point): Point;
    private handleMouseMove;
}
export {};
