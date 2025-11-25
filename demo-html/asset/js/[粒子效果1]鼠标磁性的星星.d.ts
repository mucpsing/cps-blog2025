/**
 * 数值范围配置接口
 */
interface RangeConfig {
    min: number;
    max: number;
}
/**
 * 粒子动画配置接口
 */
interface ParticlesConfig {
    quantity?: number;
    staticity?: number;
    ease?: number;
    particleColor?: string;
    particleSizeRange?: RangeConfig;
    particleAlphaRange?: RangeConfig;
    magnetismRange?: RangeConfig;
    movementSpeed?: number;
    zIndex?: number;
}
/**
 * 粒子动画类
 * 实现基于Canvas的交互式粒子动画效果，粒子会跟随鼠标产生磁性吸引效果
 *
 * @example
 * ```typescript
 * const container = document.getElementById('particles') as HTMLDivElement;
 * const particles = new ParticlesAnimation(container, {
 *   quantity: 50,
 *   staticity: 30,
 *   particleColor: '100, 200, 255'
 * });
 * ```
 */
export declare class ParticlesAnimation {
    /** 默认配置 */
    private readonly defaultConfig;
    /** 当前配置 */
    private config;
    /** 容器元素 */
    private container;
    /** Canvas元素 */
    private canvas;
    /** Canvas绘图上下文 */
    private ctx;
    /** 粒子数组 */
    private particles;
    /** 鼠标位置 */
    private mouse;
    /** 画布尺寸 */
    private canvasSize;
    /** 设备像素比 */
    private dpr;
    /** 动画帧ID */
    private animationId;
    /** 是否已初始化 */
    private isInitialized;
    /** 是否暂停动画 */
    private isPaused;
    /** 事件监听器引用（用于正确移除） */
    private resizeHandler;
    private mouseMoveHandler;
    private mouseLeaveHandler;
    private visibilityChangeHandler;
    /** 防抖定时器ID */
    private resizeTimer;
    /**
     * 创建粒子动画实例
     * @param container - 容器DOM元素
     * @param config - 粒子动画配置
     * @throws 当容器元素不存在时抛出错误
     */
    constructor(container: HTMLElement, config?: ParticlesConfig);
    /**
     * 验证配置参数的有效性
     */
    private validateConfig;
    /**
     * 初始化粒子动画
     */
    private init;
    /**
     * 创建Canvas元素并设置样式
     */
    private createCanvas;
    /**
     * 绑定事件监听器
     */
    private bindEvents;
    /**
     * 移除事件监听器
     */
    private unbindEvents;
    /**
     * 窗口大小改变处理（防抖）
     */
    private handleResize;
    /**
     * 鼠标移动处理
     */
    private handleMouseMove;
    /**
     * 鼠标离开容器处理
     */
    private handleMouseLeave;
    /**
     * 页面可见性改变处理
     */
    private handleVisibilityChange;
    /**
     * 初始化画布
     */
    private initCanvas;
    /**
     * 调整画布尺寸
     */
    private resizeCanvas;
    /**
     * 创建单个粒子的参数
     */
    private createParticleParams;
    /**
     * 绘制单个粒子
     */
    private drawParticle;
    /**
     * 清空画布
     */
    private clearCanvas;
    /**
     * 绘制所有粒子
     */
    private drawParticles;
    /**
     * 数值重映射函数
     */
    private remapValue;
    /**
     * 动画循环
     */
    private animate;
    /**
     * 清理资源
     */
    private cleanup;
    /**
     * 更新粒子动画配置
     * @param newConfig - 新的配置对象
     */
    updateConfig(newConfig: ParticlesConfig): void;
    /**
     * 获取当前配置
     */
    getConfig(): Required<ParticlesConfig>;
    /**
     * 获取粒子数量
     */
    getParticleCount(): number;
    /**
     * 暂停动画
     */
    pause(): void;
    /**
     * 恢复动画
     */
    resume(): void;
    /**
     * 销毁粒子动画实例，释放资源
     */
    destroy(): void;
    /**
     * 重新启动粒子动画
     */
    restart(): void;
    /**
     * 检查粒子动画是否正在运行
     */
    isRunning(): boolean;
    /**
     * 检查粒子动画是否已暂停
     */
    isPausedState(): boolean;
    /**
     * 获取Canvas元素（用于外部操作）
     */
    getCanvas(): HTMLCanvasElement | null;
}
declare global {
    interface Window {
        CPS_SCRIPTS: any;
    }
}
export default ParticlesAnimation;
