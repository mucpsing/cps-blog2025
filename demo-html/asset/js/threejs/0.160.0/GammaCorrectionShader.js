/**
 * Bundled by jsDelivr using Rollup v2.79.2 and Terser v5.39.0.
 * Original file: /npm/three@0.160.0/examples/jsm/shaders/GammaCorrectionShader.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
const t={name:"GammaCorrectionShader",uniforms:{tDiffuse:{value:null}},vertexShader:"\n\n\t\tvarying vec2 vUv;\n\n\t\tvoid main() {\n\n\t\t\tvUv = uv;\n\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n\t\t}",fragmentShader:"\n\n\t\tuniform sampler2D tDiffuse;\n\n\t\tvarying vec2 vUv;\n\n\t\tvoid main() {\n\n\t\t\tvec4 tex = texture2D( tDiffuse, vUv );\n\n\t\t\tgl_FragColor = sRGBTransferOETF( tex );\n\n\t\t}"};export{t as GammaCorrectionShader};export default null;
//# sourceMappingURL=/sm/278f9cf7bbf3bf4c6f4eb4c34d30c2d184b8a7344ff92655741ae5803db2e47d.map