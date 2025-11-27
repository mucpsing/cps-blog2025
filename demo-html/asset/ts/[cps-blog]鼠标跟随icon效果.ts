function extendArray<T>(length: number, arr: T[]): T[] {
    if (length <= 0 || arr.length === 0) {
        return [];
    }
    if (arr.length >= length) {
        return arr.slice(0, length);
    }
    const repeatTimes = Math.ceil(length / arr.length);
    const repeated = Array(repeatTimes).fill(arr).flat();
    return repeated.slice(0, length);
}
/**
 * @description: 在元素生成时添加一个滞后偏移量，使元素在生成时不会立即出现在屏幕上
 * @param {string} direction
 */
const calculateOffset = (direction: directionT) => {
    const baseOffset = 80;
    const baseRotate = 140;
    const baseRotate2 = -500;

    // 查找表：定义各方向对应的 x, y 偏移倍数和旋转符号
    // 部分方向偏移后效果不好，这里注销掉
    const mapping: { [key: string]: { x: number; y: number; r: number } } = {
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

const calculateDistance = (p1: Point, p2: Point): { distance: number; direction: directionT } => {
    // 如果两个点相同，返回 null， top和bottom不执行任何偏移
    if (p1.x === p2.x && p1.y === p2.y) return { distance: 0, direction: "top" };

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

export const Utils = {
    extendArray,
    calculateOffset,
    calculateDistance,
};

declare global {
    interface Window {
        recordedPoints: Point[];
        CustomEase: any;
        gsap: any;
    }
}

const DIRECTIONS = ["right", "rightTop", "top", "leftTop", "left", "leftBottom", "bottom", "rightBottom"] as const;

export type directionT = (typeof DIRECTIONS)[number];

export interface Point {
    x: number;
    y: number;
    dir?: string;
}

export interface MouseTrackerConfig {
    threshold?: number; // 间隔：每到累计到一个间隔阈值，则记录坐标
    count?: number; // 数量：创建多少个icon
    parentId?: string; // 父容器：指定一个容器挂载到里面，默认挂载在body，但是会让视口高度被撑开，
    DEBUG?: boolean;
    size?: number; // 大小：指定图标大小，默认25px
    iconPath?: string; // icon的路径，必须指定 `/icons/skill-icons/${iconPath}`;
    iconsList?: string[]; // 图标列表：指定图标列表，不指定则使用默认图标列表["/assets/icons/xxx.svg","/assets/icons/xxx.svg","/assets/icons/xxx.svg"]
}

const gsap = window.gsap;
export class MouseTracker {
    /** 默认配置 */
    private readonly defaultConfig: Required<MouseTrackerConfig> = {
        threshold: 120,
        count: 30,
        parentId: "",
        DEBUG: false,
        iconsList: [],
        size: 25,
        iconPath: "/",
    };

    /** 当前配置 */
    private config: Required<MouseTrackerConfig>;

    /** 容器元素 */
    private parentEl: HTMLElement;
    private pointContainerRangeEL: HTMLElement;

    public lastPoint: Point;
    public distanceTraveled: number = 0;
    public pointCount: number = 0;
    public recordedPoints: Point[] = [];

    private pointPool: HTMLElement[];
    private CustomEase: { c1: any; c2: any } = { c1: null, c2: null };

    constructor(container: HTMLElement, config: MouseTrackerConfig) {
        // 参数验证
        if (!container) {
            throw new Error("容器元素不能为空");
        }

        if (!(container instanceof HTMLElement)) {
            throw new Error("容器必须是有效的HTMLElement");
        }

        // 创建粒子动画
        if (!window.CustomEase) {
            console.error("没有依赖：CustomEase");
            return;
        }
        this.CustomEase.c1 = window.CustomEase.create("c1", "0.475, -0.210, 0.000, 1.240");
        this.CustomEase.c2 = window.CustomEase.create("c2", "0.000, 0.020, 0.000, 1.650");

        this.parentEl = container;
        this.pointContainerRangeEL = document.createElement("div");

        this.config = { ...this.defaultConfig, ...config };

        this.init();
    }

    public init(): this {
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
        iconList.forEach((iconPath) => {
            // console.log(iconPath);

            const eachPointRef = document.createElement("div");
            const eachImgEl = document.createElement("img");
            eachImgEl.src = `/icons/skill-icons/${iconPath}`;
            eachPointRef.appendChild(eachImgEl);

            Object.assign(eachPointRef.style, pointInitStyle);
            this.pointPool.push(eachPointRef);
            this.pointContainerRangeEL.appendChild(eachPointRef);
        });

        this.parentEl.appendChild(this.pointContainerRangeEL);

        return this;
    }

    public distory(): void {
        this.pointContainerRangeEL.remove();
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {string} offseDir 来源的方向
     */
    private createParticleAnimation(x: number, y: number, offseDir: directionT = "top") {
        // 冲元素池中提取一个透明度为0的元素来进行动画
        const availableParticle = this.pointPool.find((el) => el.style.opacity === "0");

        if (!availableParticle) return;

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

    public createIcon(coords: Point) {
        if (!this.lastPoint) return (this.lastPoint = coords);

        const distance = calculateDistance(coords, this.lastPoint);
        this.distanceTraveled += distance.distance;

        if (this.distanceTraveled >= this.config.threshold) {
            this.recordedPoints.push({ ...coords });

            this.distanceTraveled = 0;

            this.pointCount = this.recordedPoints.length;

            this.createParticleAnimation(coords.x, coords.y, distance.direction);
        }

        this.lastPoint = coords;
    }

    // Handle mouse movement
    private handleMouseMove(e: MouseEvent) {
        // const rect = document.body.getBoundingClientRect();
        const rect = this.parentEl.getBoundingClientRect();
        const currentPoint: Point = { x: e.clientX - rect.x, y: e.clientY - rect.y };

        if (!this.lastPoint) return (this.lastPoint = currentPoint);

        const distance = calculateDistance(currentPoint, this.lastPoint);
        this.distanceTraveled += distance.distance;

        if (this.distanceTraveled >= this.config.threshold) {
            this.recordedPoints.push({ ...currentPoint });

            this.distanceTraveled = 0;

            this.pointCount = this.recordedPoints.length;

            this.createParticleAnimation(currentPoint.x, currentPoint.y, distance.direction);
        }

        this.lastPoint = currentPoint;
    }
}
