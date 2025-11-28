/**
 * Bundled by jsDelivr using Rollup v2.79.2 and Terser v5.39.0.
 * Original file: /npm/three@0.160.0/examples/jsm/postprocessing/OutputPass.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
import {
    OrthographicCamera as t,
    BufferGeometry as e,
    Float32BufferAttribute as n,
    Mesh as i,
    UniformsUtils as r,
    RawShaderMaterial as s,
    ColorManagement as a,
    SRGBTransfer as o,
    LinearToneMapping as l,
    ReinhardToneMapping as p,
    CineonToneMapping as g,
    ACESFilmicToneMapping as u,
    AgXToneMapping as d,
} from "/asset/js/threejs/0.160.0/three.js";
class h {
    constructor() {
        (this.isPass = !0), (this.enabled = !0), (this.needsSwap = !0), (this.clear = !1), (this.renderToScreen = !1);
    }
    setSize() {}
    render() {
        console.error("THREE.Pass: .render() must be implemented in derived pass.");
    }
    dispose() {}
}
const _ = new t(-1, 1, 1, -1, 0, 1);
const m = new (class extends e {
    constructor() {
        super(), this.setAttribute("position", new n([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3)), this.setAttribute("uv", new n([0, 2, 0, 0, 2, 0], 2));
    }
})();
class f {
    constructor(t) {
        this._mesh = new i(m, t);
    }
    dispose() {
        this._mesh.geometry.dispose();
    }
    render(t) {
        t.render(this._mesh, _);
    }
    get material() {
        return this._mesh.material;
    }
    set material(t) {
        this._mesh.material = t;
    }
}
const c = {
    name: "OutputShader",
    uniforms: { tDiffuse: { value: null }, toneMappingExposure: { value: 1 } },
    vertexShader:
        "\n\t\tprecision highp float;\n\n\t\tuniform mat4 modelViewMatrix;\n\t\tuniform mat4 projectionMatrix;\n\n\t\tattribute vec3 position;\n\t\tattribute vec2 uv;\n\n\t\tvarying vec2 vUv;\n\n\t\tvoid main() {\n\n\t\t\tvUv = uv;\n\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n\t\t}",
    fragmentShader:
        "\n\t\n\t\tprecision highp float;\n\n\t\tuniform sampler2D tDiffuse;\n\n\t\t#include <tonemapping_pars_fragment>\n\t\t#include <colorspace_pars_fragment>\n\n\t\tvarying vec2 vUv;\n\n\t\tvoid main() {\n\n\t\t\tgl_FragColor = texture2D( tDiffuse, vUv );\n\n\t\t\t// tone mapping\n\n\t\t\t#ifdef LINEAR_TONE_MAPPING\n\n\t\t\t\tgl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );\n\n\t\t\t#elif defined( REINHARD_TONE_MAPPING )\n\n\t\t\t\tgl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );\n\n\t\t\t#elif defined( CINEON_TONE_MAPPING )\n\n\t\t\t\tgl_FragColor.rgb = OptimizedCineonToneMapping( gl_FragColor.rgb );\n\n\t\t\t#elif defined( ACES_FILMIC_TONE_MAPPING )\n\n\t\t\t\tgl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );\n\n\t\t\t#elif defined( AGX_TONE_MAPPING )\n\n\t\t\t\tgl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );\n\n\t\t\t#endif\n\n\t\t\t// color space\n\n\t\t\t#ifdef SRGB_TRANSFER\n\n\t\t\t\tgl_FragColor = sRGBTransferOETF( gl_FragColor );\n\n\t\t\t#endif\n\n\t\t}",
};
class M extends h {
    constructor() {
        super();
        const t = c;
        (this.uniforms = r.clone(t.uniforms)),
            (this.material = new s({ name: t.name, uniforms: this.uniforms, vertexShader: t.vertexShader, fragmentShader: t.fragmentShader })),
            (this.fsQuad = new f(this.material)),
            (this._outputColorSpace = null),
            (this._toneMapping = null);
    }
    render(t, e, n) {
        (this.uniforms.tDiffuse.value = n.texture),
            (this.uniforms.toneMappingExposure.value = t.toneMappingExposure),
            (this._outputColorSpace === t.outputColorSpace && this._toneMapping === t.toneMapping) ||
                ((this._outputColorSpace = t.outputColorSpace),
                (this._toneMapping = t.toneMapping),
                (this.material.defines = {}),
                a.getTransfer(this._outputColorSpace) === o && (this.material.defines.SRGB_TRANSFER = ""),
                this._toneMapping === l
                    ? (this.material.defines.LINEAR_TONE_MAPPING = "")
                    : this._toneMapping === p
                    ? (this.material.defines.REINHARD_TONE_MAPPING = "")
                    : this._toneMapping === g
                    ? (this.material.defines.CINEON_TONE_MAPPING = "")
                    : this._toneMapping === u
                    ? (this.material.defines.ACES_FILMIC_TONE_MAPPING = "")
                    : this._toneMapping === d && (this.material.defines.AGX_TONE_MAPPING = ""),
                (this.material.needsUpdate = !0)),
            !0 === this.renderToScreen
                ? (t.setRenderTarget(null), this.fsQuad.render(t))
                : (t.setRenderTarget(e), this.clear && t.clear(t.autoClearColor, t.autoClearDepth, t.autoClearStencil), this.fsQuad.render(t));
    }
    dispose() {
        this.material.dispose(), this.fsQuad.dispose();
    }
}
export { M as OutputPass };
export default null;
//# sourceMappingURL=/sm/4f729fd1e075486479050cdfb4e1772deb74dbc7d6ccf5de4e9c7875f0518c3f.map
