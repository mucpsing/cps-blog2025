/**
 * Bundled by jsDelivr using Rollup v2.79.2 and Terser v5.39.0.
 * Original file: /npm/three@0.160.0/examples/jsm/postprocessing/ShaderPass.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
import {
    OrthographicCamera as e,
    BufferGeometry as s,
    Float32BufferAttribute as t,
    Mesh as r,
    ShaderMaterial as i,
    UniformsUtils as n,
} from "/asset/js/threejs/0.160.0/three.js";
class a {
    constructor() {
        (this.isPass = !0), (this.enabled = !0), (this.needsSwap = !0), (this.clear = !1), (this.renderToScreen = !1);
    }
    setSize() {}
    render() {
        console.error("THREE.Pass: .render() must be implemented in derived pass.");
    }
    dispose() {}
}
const o = new e(-1, 1, 1, -1, 0, 1);
const h = new (class extends s {
    constructor() {
        super(), this.setAttribute("position", new t([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3)), this.setAttribute("uv", new t([0, 2, 0, 0, 2, 0], 2));
    }
})();
class d {
    constructor(e) {
        this._mesh = new r(h, e);
    }
    dispose() {
        this._mesh.geometry.dispose();
    }
    render(e) {
        e.render(this._mesh, o);
    }
    get material() {
        return this._mesh.material;
    }
    set material(e) {
        this._mesh.material = e;
    }
}
class u extends a {
    constructor(e, s) {
        super(),
            (this.textureID = void 0 !== s ? s : "tDiffuse"),
            e instanceof i
                ? ((this.uniforms = e.uniforms), (this.material = e))
                : e &&
                  ((this.uniforms = n.clone(e.uniforms)),
                  (this.material = new i({
                      name: void 0 !== e.name ? e.name : "unspecified",
                      defines: Object.assign({}, e.defines),
                      uniforms: this.uniforms,
                      vertexShader: e.vertexShader,
                      fragmentShader: e.fragmentShader,
                  }))),
            (this.fsQuad = new d(this.material));
    }
    render(e, s, t) {
        this.uniforms[this.textureID] && (this.uniforms[this.textureID].value = t.texture),
            (this.fsQuad.material = this.material),
            this.renderToScreen
                ? (e.setRenderTarget(null), this.fsQuad.render(e))
                : (e.setRenderTarget(s), this.clear && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil), this.fsQuad.render(e));
    }
    dispose() {
        this.material.dispose(), this.fsQuad.dispose();
    }
}
export { u as ShaderPass };
export default null;
//# sourceMappingURL=/sm/6aa144ec88c82ab00688f616eafc20f8ab2c6b3d222113b12e9ab8d59f3913bd.map
