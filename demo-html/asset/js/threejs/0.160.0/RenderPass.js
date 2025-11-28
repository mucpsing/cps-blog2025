/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2025-11-28 16:55:01
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2025-11-28 17:02:31
 * @FilePath: \cps-blog\demo-html\asset\js\threejs\0.160.0\RenderPass.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * Bundled by jsDelivr using Rollup v2.79.2 and Terser v5.39.0.
 * Original file: /npm/three@0.160.0/examples/jsm/postprocessing/RenderPass.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
import { OrthographicCamera as e, BufferGeometry as r, Float32BufferAttribute as l, Color as t } from "/asset/js/threejs/0.160.0/three.js";
class s {
    constructor() {
        (this.isPass = !0), (this.enabled = !0), (this.needsSwap = !0), (this.clear = !1), (this.renderToScreen = !1);
    }
    setSize() {}
    render() {
        console.error("THREE.Pass: .render() must be implemented in derived pass.");
    }
    dispose() {}
}
new e(-1, 1, 1, -1, 0, 1);
new (class extends r {
    constructor() {
        super(), this.setAttribute("position", new l([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3)), this.setAttribute("uv", new l([0, 2, 0, 0, 2, 0], 2));
    }
})();
class a extends s {
    constructor(e, r, l = null, s = null, a = null) {
        super(),
            (this.scene = e),
            (this.camera = r),
            (this.overrideMaterial = l),
            (this.clearColor = s),
            (this.clearAlpha = a),
            (this.clear = !0),
            (this.clearDepth = !1),
            (this.needsSwap = !1),
            (this._oldClearColor = new t());
    }
    render(e, r, l) {
        const t = e.autoClear;
        let s, a;
        (e.autoClear = !1),
            null !== this.overrideMaterial && ((a = this.scene.overrideMaterial), (this.scene.overrideMaterial = this.overrideMaterial)),
            null !== this.clearColor && (e.getClearColor(this._oldClearColor), e.setClearColor(this.clearColor)),
            null !== this.clearAlpha && ((s = e.getClearAlpha()), e.setClearAlpha(this.clearAlpha)),
            1 == this.clearDepth && e.clearDepth(),
            e.setRenderTarget(this.renderToScreen ? null : l),
            !0 === this.clear && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil),
            e.render(this.scene, this.camera),
            null !== this.clearColor && e.setClearColor(this._oldClearColor),
            null !== this.clearAlpha && e.setClearAlpha(s),
            null !== this.overrideMaterial && (this.scene.overrideMaterial = a),
            (e.autoClear = t);
    }
}
export { a as RenderPass };
export default null;
//# sourceMappingURL=/sm/484789c67f4c0c1773c9776abf68a9fe4292181889dff30c8931e2f39ca2038c.map
