/**
 * Bundled by jsDelivr using Rollup v2.79.2 and Terser v5.39.0.
 * Original file: /npm/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
import {
    OrthographicCamera as e,
    BufferGeometry as t,
    Float32BufferAttribute as s,
    Mesh as i,
    ShaderMaterial as r,
    UniformsUtils as n,
    Vector2 as h,
    WebGLRenderTarget as a,
    HalfFloatType as o,
    NoBlending as d,
    Clock as f,
} from "/asset/js/threejs/0.160.0/three.js";
const c = {
    name: "CopyShader",
    uniforms: { tDiffuse: { value: null }, opacity: { value: 1 } },
    vertexShader:
        "\n\n\t\tvarying vec2 vUv;\n\n\t\tvoid main() {\n\n\t\t\tvUv = uv;\n\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n\t\t}",
    fragmentShader:
        "\n\n\t\tuniform float opacity;\n\n\t\tuniform sampler2D tDiffuse;\n\n\t\tvarying vec2 vUv;\n\n\t\tvoid main() {\n\n\t\t\tvec4 texel = texture2D( tDiffuse, vUv );\n\t\t\tgl_FragColor = opacity * texel;\n\n\n\t\t}",
};
class l {
    constructor() {
        (this.isPass = !0), (this.enabled = !0), (this.needsSwap = !0), (this.clear = !1), (this.renderToScreen = !1);
    }
    setSize() {}
    render() {
        console.error("THREE.Pass: .render() must be implemented in derived pass.");
    }
    dispose() {}
}
const u = new e(-1, 1, 1, -1, 0, 1);
const p = new (class extends t {
    constructor() {
        super(), this.setAttribute("position", new s([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3)), this.setAttribute("uv", new s([0, 2, 0, 0, 2, 0], 2));
    }
})();
class g {
    constructor(e) {
        this._mesh = new i(p, e);
    }
    dispose() {
        this._mesh.geometry.dispose();
    }
    render(e) {
        e.render(this._mesh, u);
    }
    get material() {
        return this._mesh.material;
    }
    set material(e) {
        this._mesh.material = e;
    }
}
class m extends l {
    constructor(e, t) {
        super(),
            (this.textureID = void 0 !== t ? t : "tDiffuse"),
            e instanceof r
                ? ((this.uniforms = e.uniforms), (this.material = e))
                : e &&
                  ((this.uniforms = n.clone(e.uniforms)),
                  (this.material = new r({
                      name: void 0 !== e.name ? e.name : "unspecified",
                      defines: Object.assign({}, e.defines),
                      uniforms: this.uniforms,
                      vertexShader: e.vertexShader,
                      fragmentShader: e.fragmentShader,
                  }))),
            (this.fsQuad = new g(this.material));
    }
    render(e, t, s) {
        this.uniforms[this.textureID] && (this.uniforms[this.textureID].value = s.texture),
            (this.fsQuad.material = this.material),
            this.renderToScreen
                ? (e.setRenderTarget(null), this.fsQuad.render(e))
                : (e.setRenderTarget(t), this.clear && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil), this.fsQuad.render(e));
    }
    dispose() {
        this.material.dispose(), this.fsQuad.dispose();
    }
}
class _ extends l {
    constructor(e, t) {
        super(), (this.scene = e), (this.camera = t), (this.clear = !0), (this.needsSwap = !1), (this.inverse = !1);
    }
    render(e, t, s) {
        const i = e.getContext(),
            r = e.state;
        let n, h;
        r.buffers.color.setMask(!1),
            r.buffers.depth.setMask(!1),
            r.buffers.color.setLocked(!0),
            r.buffers.depth.setLocked(!0),
            this.inverse ? ((n = 0), (h = 1)) : ((n = 1), (h = 0)),
            r.buffers.stencil.setTest(!0),
            r.buffers.stencil.setOp(i.REPLACE, i.REPLACE, i.REPLACE),
            r.buffers.stencil.setFunc(i.ALWAYS, n, 4294967295),
            r.buffers.stencil.setClear(h),
            r.buffers.stencil.setLocked(!0),
            e.setRenderTarget(s),
            this.clear && e.clear(),
            e.render(this.scene, this.camera),
            e.setRenderTarget(t),
            this.clear && e.clear(),
            e.render(this.scene, this.camera),
            r.buffers.color.setLocked(!1),
            r.buffers.depth.setLocked(!1),
            r.buffers.color.setMask(!0),
            r.buffers.depth.setMask(!0),
            r.buffers.stencil.setLocked(!1),
            r.buffers.stencil.setFunc(i.EQUAL, 1, 4294967295),
            r.buffers.stencil.setOp(i.KEEP, i.KEEP, i.KEEP),
            r.buffers.stencil.setLocked(!0);
    }
}
class x extends l {
    constructor() {
        super(), (this.needsSwap = !1);
    }
    render(e) {
        e.state.buffers.stencil.setLocked(!1), e.state.buffers.stencil.setTest(!1);
    }
}
class w {
    constructor(e, t) {
        if (((this.renderer = e), (this._pixelRatio = e.getPixelRatio()), void 0 === t)) {
            const s = e.getSize(new h());
            (this._width = s.width),
                (this._height = s.height),
                ((t = new a(this._width * this._pixelRatio, this._height * this._pixelRatio, { type: o })).texture.name = "EffectComposer.rt1");
        } else (this._width = t.width), (this._height = t.height);
        (this.renderTarget1 = t),
            (this.renderTarget2 = t.clone()),
            (this.renderTarget2.texture.name = "EffectComposer.rt2"),
            (this.writeBuffer = this.renderTarget1),
            (this.readBuffer = this.renderTarget2),
            (this.renderToScreen = !0),
            (this.passes = []),
            (this.copyPass = new m(c)),
            (this.copyPass.material.blending = d),
            (this.clock = new f());
    }
    swapBuffers() {
        const e = this.readBuffer;
        (this.readBuffer = this.writeBuffer), (this.writeBuffer = e);
    }
    addPass(e) {
        this.passes.push(e), e.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
    }
    insertPass(e, t) {
        this.passes.splice(t, 0, e), e.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
    }
    removePass(e) {
        const t = this.passes.indexOf(e);
        -1 !== t && this.passes.splice(t, 1);
    }
    isLastEnabledPass(e) {
        for (let t = e + 1; t < this.passes.length; t++) if (this.passes[t].enabled) return !1;
        return !0;
    }
    render(e) {
        void 0 === e && (e = this.clock.getDelta());
        const t = this.renderer.getRenderTarget();
        let s = !1;
        for (let t = 0, i = this.passes.length; t < i; t++) {
            const i = this.passes[t];
            if (!1 !== i.enabled) {
                if (
                    ((i.renderToScreen = this.renderToScreen && this.isLastEnabledPass(t)),
                    i.render(this.renderer, this.writeBuffer, this.readBuffer, e, s),
                    i.needsSwap)
                ) {
                    if (s) {
                        const t = this.renderer.getContext(),
                            s = this.renderer.state.buffers.stencil;
                        s.setFunc(t.NOTEQUAL, 1, 4294967295),
                            this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, e),
                            s.setFunc(t.EQUAL, 1, 4294967295);
                    }
                    this.swapBuffers();
                }
                void 0 !== _ && (i instanceof _ ? (s = !0) : i instanceof x && (s = !1));
            }
        }
        this.renderer.setRenderTarget(t);
    }
    reset(e) {
        if (void 0 === e) {
            const t = this.renderer.getSize(new h());
            (this._pixelRatio = this.renderer.getPixelRatio()),
                (this._width = t.width),
                (this._height = t.height),
                (e = this.renderTarget1.clone()).setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
        }
        this.renderTarget1.dispose(),
            this.renderTarget2.dispose(),
            (this.renderTarget1 = e),
            (this.renderTarget2 = e.clone()),
            (this.writeBuffer = this.renderTarget1),
            (this.readBuffer = this.renderTarget2);
    }
    setSize(e, t) {
        (this._width = e), (this._height = t);
        const s = this._width * this._pixelRatio,
            i = this._height * this._pixelRatio;
        this.renderTarget1.setSize(s, i), this.renderTarget2.setSize(s, i);
        for (let e = 0; e < this.passes.length; e++) this.passes[e].setSize(s, i);
    }
    setPixelRatio(e) {
        (this._pixelRatio = e), this.setSize(this._width, this._height);
    }
    dispose() {
        this.renderTarget1.dispose(), this.renderTarget2.dispose(), this.copyPass.dispose();
    }
}
export { w as EffectComposer };
export default null;
//# sourceMappingURL=/sm/31c71b40382bf48abbeb675fe4d3199b9740d0d4bfbd39e2684374ea3b00ba59.map
