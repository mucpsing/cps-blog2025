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
export class ParticlesAnimation {
    /** 默认配置 */
    defaultConfig = {
        quantity: 30,
        staticity: 50,
        ease: 50,
        particleColor: "255, 255, 255",
        particleSizeRange: { min: 0.1, max: 2 },
        particleAlphaRange: { min: 0.1, max: 0.7 },
        magnetismRange: { min: 0.1, max: 4 },
        movementSpeed: 0.2,
        zIndex: 0,
    };
    /** 当前配置 */
    config;
    /** 容器元素 */
    container;
    /** Canvas元素 */
    canvas = null;
    /** Canvas绘图上下文 */
    ctx = null;
    /** 粒子数组 */
    particles = [];
    /** 鼠标位置 */
    mouse = { x: 0, y: 0 };
    /** 画布尺寸 */
    canvasSize = { w: 0, h: 0 };
    /** 设备像素比 */
    dpr;
    /** 动画帧ID */
    animationId = null;
    /** 是否已初始化 */
    isInitialized = false;
    /** 是否暂停动画 */
    isPaused = false;
    /** 事件监听器引用（用于正确移除） */
    resizeHandler;
    mouseMoveHandler;
    mouseLeaveHandler;
    visibilityChangeHandler;
    /** 防抖定时器ID */
    resizeTimer = null;
    /**
     * 创建粒子动画实例
     * @param container - 容器DOM元素
     * @param config - 粒子动画配置
     * @throws 当容器元素不存在时抛出错误
     */
    constructor(container, config = {}) {
        // 参数验证
        if (!container) {
            throw new Error("容器元素不能为空");
        }
        if (!(container instanceof HTMLElement)) {
            throw new Error("容器必须是有效的HTMLElement");
        }
        this.container = container;
        this.config = { ...this.defaultConfig, ...config };
        this.dpr = window.devicePixelRatio || 1;
        // 绑定事件处理函数（使用箭头函数保持this上下文）
        this.resizeHandler = () => this.handleResize();
        this.mouseMoveHandler = (e) => this.handleMouseMove(e);
        this.mouseLeaveHandler = () => this.handleMouseLeave();
        this.visibilityChangeHandler = () => this.handleVisibilityChange();
        this.validateConfig();
        this.init();
    }
    /**
     * 验证配置参数的有效性
     */
    validateConfig() {
        const { quantity, staticity, ease, movementSpeed, zIndex } = this.config;
        if (quantity <= 0 || quantity > 1000) {
            console.warn("粒子数量应在1-1000之间，使用默认值30");
            this.config.quantity = this.defaultConfig.quantity;
        }
        if (staticity <= 0) {
            console.warn("静态阻力应大于0，使用默认值50");
            this.config.staticity = this.defaultConfig.staticity;
        }
        if (ease <= 0) {
            console.warn("缓动系数应大于0，使用默认值50");
            this.config.ease = this.defaultConfig.ease;
        }
        if (movementSpeed <= 0 || movementSpeed > 5) {
            console.warn("移动速度应在0-5之间，使用默认值0.2");
            this.config.movementSpeed = this.defaultConfig.movementSpeed;
        }
        if (zIndex < 0) {
            console.warn("zIndex不能为负数，使用默认值0");
            this.config.zIndex = this.defaultConfig.zIndex;
        }
    }
    /**
     * 初始化粒子动画
     */
    init() {
        try {
            this.createCanvas();
            this.bindEvents();
            this.initCanvas();
            this.animate();
            this.isInitialized = true;
            console.log("粒子动画初始化成功");
        }
        catch (error) {
            console.error("粒子动画初始化失败:", error);
            this.cleanup();
            throw error;
        }
    }
    /**
     * 创建Canvas元素并设置样式
     */
    createCanvas() {
        this.canvas = document.createElement("canvas");
        // 设置Canvas样式
        this.canvas.style.display = "block";
        this.canvas.style.position = "absolute";
        this.canvas.style.top = "0";
        this.canvas.style.left = "0";
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.canvas.style.zIndex = this.config.zIndex.toString();
        this.canvas.style.pointerEvents = "none"; // 防止Canvas拦截鼠标事件
        this.container.appendChild(this.canvas);
        this.container.style.position = "relative"; // 确保容器有定位上下文
        const context = this.canvas.getContext("2d");
        if (!context) {
            throw new Error("无法获取Canvas 2D上下文，浏览器可能不支持Canvas");
        }
        this.ctx = context;
    }
    /**
     * 绑定事件监听器
     */
    bindEvents() {
        window.addEventListener("resize", this.resizeHandler);
        this.container.addEventListener("mousemove", this.mouseMoveHandler);
        this.container.addEventListener("mouseleave", this.mouseLeaveHandler);
        document.addEventListener("visibilitychange", this.visibilityChangeHandler);
    }
    /**
     * 移除事件监听器
     */
    unbindEvents() {
        window.removeEventListener("resize", this.resizeHandler);
        this.container.removeEventListener("mousemove", this.mouseMoveHandler);
        this.container.removeEventListener("mouseleave", this.mouseLeaveHandler);
        document.removeEventListener("visibilitychange", this.visibilityChangeHandler);
    }
    /**
     * 窗口大小改变处理（防抖）
     */
    handleResize() {
        // 防抖处理，避免频繁重绘
        if (this.resizeTimer !== null) {
            window.clearTimeout(this.resizeTimer);
        }
        this.resizeTimer = window.setTimeout(() => {
            this.initCanvas();
            this.resizeTimer = null;
        }, 150);
    }
    /**
     * 鼠标移动处理
     */
    handleMouseMove(e) {
        if (!this.canvas || this.isPaused)
            return;
        const rect = this.canvas.getBoundingClientRect();
        const { w, h } = this.canvasSize;
        // 计算相对于画布中心的鼠标位置
        const x = e.clientX - rect.left - w / 2;
        const y = e.clientY - rect.top - h / 2;
        // 检查鼠标是否在画布内
        const isInside = x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2;
        if (isInside) {
            this.mouse.x = x;
            this.mouse.y = y;
        }
    }
    /**
     * 鼠标离开容器处理
     */
    handleMouseLeave() {
        this.mouse.x = 0;
        this.mouse.y = 0;
    }
    /**
     * 页面可见性改变处理
     */
    handleVisibilityChange() {
        if (document.hidden) {
            this.pause();
        }
        else {
            this.resume();
        }
    }
    /**
     * 初始化画布
     */
    initCanvas() {
        this.resizeCanvas();
        this.drawParticles();
    }
    /**
     * 调整画布尺寸
     */
    resizeCanvas() {
        if (!this.canvas || !this.ctx)
            return;
        // 保存当前粒子状态（可选：可以清空或保留）
        // this.particles = [];
        // 获取容器尺寸
        this.canvasSize.w = this.container.offsetWidth;
        this.canvasSize.h = this.container.offsetHeight;
        // 确保最小尺寸
        if (this.canvasSize.w === 0 || this.canvasSize.h === 0) {
            console.warn("容器尺寸为0，使用默认尺寸300x150");
            this.canvasSize.w = 300;
            this.canvasSize.h = 150;
        }
        // 设置Canvas尺寸（考虑设备像素比）
        this.canvas.width = this.canvasSize.w * this.dpr;
        this.canvas.height = this.canvasSize.h * this.dpr;
        this.canvas.style.width = `${this.canvasSize.w}px`;
        this.canvas.style.height = `${this.canvasSize.h}px`;
        // 缩放绘图上下文
        this.ctx.scale(this.dpr, this.dpr);
        // 重新创建粒子以适应新尺寸
        this.particles = [];
        this.drawParticles();
    }
    /**
     * 创建单个粒子的参数
     */
    createParticleParams() {
        const { particleSizeRange, particleAlphaRange, magnetismRange, movementSpeed } = this.config;
        return {
            x: Math.floor(Math.random() * this.canvasSize.w),
            y: Math.floor(Math.random() * this.canvasSize.h),
            translateX: 0,
            translateY: 0,
            size: particleSizeRange.min + Math.random() * (particleSizeRange.max - particleSizeRange.min),
            alpha: 0,
            targetAlpha: particleAlphaRange.min + Math.random() * (particleAlphaRange.max - particleAlphaRange.min),
            dx: (Math.random() - 0.5) * movementSpeed,
            dy: (Math.random() - 0.5) * movementSpeed,
            magnetism: magnetismRange.min + Math.random() * (magnetismRange.max - magnetismRange.min),
        };
    }
    /**
     * 绘制单个粒子
     */
    drawParticle(particle, isUpdate = false) {
        if (!this.ctx)
            return;
        const { particleColor } = this.config;
        const { x, y, translateX, translateY, size, alpha } = particle;
        this.ctx.save();
        this.ctx.translate(translateX, translateY);
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, 2 * Math.PI);
        this.ctx.fillStyle = `rgba(${particleColor}, ${alpha})`;
        this.ctx.fill();
        this.ctx.restore();
        // 如果是新粒子，添加到数组
        if (!isUpdate) {
            this.particles.push(particle);
        }
    }
    /**
     * 清空画布
     */
    clearCanvas() {
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvasSize.w, this.canvasSize.h);
        }
    }
    /**
     * 绘制所有粒子
     */
    drawParticles() {
        this.clearCanvas();
        const particleCount = this.config.quantity;
        // 如果粒子数量不足，创建新粒子
        while (this.particles.length < particleCount) {
            const particle = this.createParticleParams();
            this.drawParticle(particle);
        }
        // 如果粒子数量过多，移除多余的粒子
        if (this.particles.length > particleCount) {
            this.particles = this.particles.slice(0, particleCount);
        }
    }
    /**
     * 数值重映射函数
     */
    remapValue(value, inMin, inMax, outMin, outMax) {
        if (inMax === inMin)
            return outMin; // 避免除以零
        const remapped = ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
        return Math.max(remapped, 0); // 确保返回值不小于0
    }
    /**
     * 动画循环
     */
    animate() {
        if (!this.ctx || this.isPaused) {
            // 如果暂停，继续请求下一帧但不执行动画逻辑
            this.animationId = window.requestAnimationFrame(() => this.animate());
            return;
        }
        this.clearCanvas();
        const { staticity, ease } = this.config;
        this.particles.forEach((particle, index) => {
            // 计算粒子到画布四边的距离
            const distancesToEdges = [
                particle.x + particle.translateX - particle.size, // 到左边缘距离
                this.canvasSize.w - particle.x - particle.translateX - particle.size, // 到右边缘距离
                particle.y + particle.translateY - particle.size, // 到上边缘距离
                this.canvasSize.h - particle.y - particle.translateY - particle.size, // 到下边缘距离
            ];
            // 找到最近的边缘距离
            const closestEdgeDistance = Math.min(...distancesToEdges);
            // 重映射距离值到0-1范围（20像素内开始淡出）
            const edgeAlphaFactor = this.remapValue(closestEdgeDistance, 0, 20, 0, 1);
            // 透明度控制：边缘淡出效果
            if (edgeAlphaFactor >= 1) {
                // 远离边缘，正常显示
                particle.alpha = Math.min(particle.alpha + 0.02, particle.targetAlpha);
            }
            else {
                // 靠近边缘，根据距离调整透明度
                particle.alpha = particle.targetAlpha * edgeAlphaFactor;
            }
            // 更新粒子位置
            particle.x += particle.dx;
            particle.y += particle.dy;
            // 磁性吸引效果：粒子向鼠标位置移动
            particle.translateX += (this.mouse.x / (staticity / particle.magnetism) - particle.translateX) / ease;
            particle.translateY += (this.mouse.y / (staticity / particle.magnetism) - particle.translateY) / ease;
            // 检查粒子是否移出画布
            const isOutOfBounds = particle.x < -particle.size ||
                particle.x > this.canvasSize.w + particle.size ||
                particle.y < -particle.size ||
                particle.y > this.canvasSize.h + particle.size;
            if (isOutOfBounds) {
                // 移除移出画布的粒子并创建新粒子
                this.particles.splice(index, 1);
                const newParticle = this.createParticleParams();
                this.drawParticle(newParticle);
            }
            else {
                // 更新现有粒子
                this.drawParticle({
                    ...particle,
                    x: particle.x,
                    y: particle.y,
                    translateX: particle.translateX,
                    translateY: particle.translateY,
                    alpha: particle.alpha,
                }, true);
            }
        });
        // 继续动画循环
        this.animationId = window.requestAnimationFrame(() => this.animate());
    }
    /**
     * 清理资源
     */
    cleanup() {
        // 清除动画帧
        if (this.animationId !== null) {
            window.cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        // 清除防抖定时器
        if (this.resizeTimer !== null) {
            window.clearTimeout(this.resizeTimer);
            this.resizeTimer = null;
        }
        // 移除事件监听器
        this.unbindEvents();
        // 移除Canvas元素
        if (this.canvas && this.container.contains(this.canvas)) {
            this.container.removeChild(this.canvas);
            this.canvas = null;
        }
        this.ctx = null;
        this.particles = [];
        this.isInitialized = false;
        this.isPaused = false;
    }
    // ========== 公共方法 ==========
    /**
     * 更新粒子动画配置
     * @param newConfig - 新的配置对象
     */
    updateConfig(newConfig) {
        if (!this.isInitialized) {
            console.warn("粒子动画未初始化，无法更新配置");
            return;
        }
        this.config = { ...this.config, ...newConfig };
        this.validateConfig();
        this.initCanvas();
    }
    /**
     * 获取当前配置
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * 获取粒子数量
     */
    getParticleCount() {
        return this.particles.length;
    }
    /**
     * 暂停动画
     */
    pause() {
        if (this.isPaused || !this.isInitialized)
            return;
        this.isPaused = true;
        console.log("粒子动画已暂停");
    }
    /**
     * 恢复动画
     */
    resume() {
        if (!this.isPaused || !this.isInitialized)
            return;
        this.isPaused = false;
        console.log("粒子动画已恢复");
    }
    /**
     * 销毁粒子动画实例，释放资源
     */
    destroy() {
        this.cleanup();
        console.log("粒子动画已销毁");
    }
    /**
     * 重新启动粒子动画
     */
    restart() {
        this.destroy();
        this.init();
    }
    /**
     * 检查粒子动画是否正在运行
     */
    isRunning() {
        return this.isInitialized && this.animationId !== null && !this.isPaused;
    }
    /**
     * 检查粒子动画是否已暂停
     */
    isPausedState() {
        return this.isPaused;
    }
    /**
     * 获取Canvas元素（用于外部操作）
     */
    getCanvas() {
        return this.canvas;
    }
}
if (!window.CPS_SCRIPTS)
    window.CPS_SCRIPTS = {};
window.CPS_SCRIPTS.ParticlesAnimation = ParticlesAnimation;
export default ParticlesAnimation;
