import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/+esm'
import {FullScreenQuad} from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/Pass.js/+esm';

class FluidSimCreate {
    constructor(base) {
        this.base = base;
        this.isFluid = !0
        this._linearFilteringSupported = this.base.renderer.webgl.capabilities.floatLinearFiltering
        this._simRes = 128
        this._dyeRes = 256
        this._simTexelSize = 1 / this._simRes
        this._dyeTexelSize = 1 / this._dyeRes
        this._pressureIterations = 2
        this._densityDissipation = 0.88
        this._velocityDissipation = 0.98
        this._pressureDissipation = 0.86
        this._curlStrength = 0
        this._splatRadius = 0.2
        this._splatRadiusVelocity = !1
        this._splatForce = 35
        this._splatMode = 2
        this._borders = !1
        this._mode = 1
        this._aspect = 1
        this._fingers = this.base.inputManager.fingers
        this._enabled = !1
        this.points = Array.from(Array(this._fingers), () => ({
            position: new THREE.Vector2(.5, .5),
            prevPosition: new THREE.Vector2(.5, .5),
            lastUpdate: 0,
            lastSplat: 0,
            velocity: 0
        }))
        this.rc = new THREE.Vector2();
        this._createRTs()
        this._createMaterials()
        this._createScene()
        this.dyeUniform = {value: null}
        this.velUniform = {value: null}
        this.enable()
    }

    swapBuffer(size, format, filter) {
        const n = new THREE.WebGLRenderTarget(size, size, {
            format: format,
            type: THREE.HalfFloatType,
            magFilter: filter,
            minFilter: filter,
            depthBuffer: !1
        })
        const s = n.clone()
        const r = {
            read: n,
            write: s,
            swap: () => {
                const a = r.read;
                r.read = r.write
                r.write = a
            }
        };
        return r
    }

    _createRTs() {
        this._density = this.swapBuffer(this._dyeRes, THREE.RGBAFormat, this._linearFilteringSupported ? THREE.LinearFilter : THREE.NearestFilter)
        this._velocity = this.swapBuffer(this._simRes, THREE.RGBAFormat, this._linearFilteringSupported ? THREE.LinearFilter : THREE.NearestFilter)
        this._pressure = this.swapBuffer(this._simRes, THREE.RGBAFormat, THREE.NearestFilter);
        const options = {
            type: THREE.HalfFloatType,
            magFilter: THREE.NearestFilter,
            minFilter: THREE.NearestFilter,
            depthBuffer: !1
        };
        this._divergence = new THREE.WebGLRenderTarget(this._simRes, this._simRes, options)
        this._curl = new THREE.WebGLRenderTarget(this._simRes, this._simRes, options)
    }

    _createMaterials() {
        const e = this.base.renderer.webgl.capabilities
        const highPrecision = e.getMaxPrecision("highp")
        const mediumPrecision = e.getMaxPrecision("mediump");
        this._materialClear = new THREE.RawShaderMaterial({
            name: "FLUID_CLEAR",
            uniforms: {
                texelSize: {value: new THREE.Vector2},
                uTexture: {value: null},
                value: {value: this._pressureDissipation}
            },
            vertexShader: `
                precision ${highPrecision} float;

                attribute vec3 position;
                attribute vec2 uv;

                varying vec2 vUv;

                void main () {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision ${mediumPrecision} float;
                precision ${mediumPrecision} sampler2D;

                uniform sampler2D uTexture;
                uniform float value;

                varying highp vec2 vUv;

                void main () {
                    gl_FragColor.rgb = value * texture2D(uTexture, vUv).rgb;
                    gl_FragColor.a = 1.0;
                }
            `,
            depthTest: !1,
            depthWrite: !1
        })
        this._materialSplat = new THREE.RawShaderMaterial({
            name: "FLUID_SPLAT",
            uniforms: {
                texelSize: {value: new THREE.Vector2},
                uTarget: {value: null},
                aspectRatio: {value: 1},
                color: {value: new THREE.Vector3},
                point: {value: new THREE.Vector2},
                prevPoint: {value: new THREE.Vector2},
                radius: {value: 1},
                isDye: {value: !1}
            },
            vertexShader: `
                precision ${highPrecision} float;

                attribute vec3 position;
                attribute vec2 uv;

                varying vec2 vUv;

                void main () {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision ${highPrecision} float;
                precision ${highPrecision} sampler2D;

                ${this._splatMode === 1 ? "#define SPLAT_DOT" : ""}

                uniform sampler2D uTarget;
                uniform float aspectRatio;
                uniform vec3 color;
                uniform vec2 point;
                uniform vec2 prevPoint;
                uniform float radius;
                uniform bool isDye;

                varying vec2 vUv;

                float line(vec2 uv, vec2 point1, vec2 point2) {
                    vec2 pa = uv - point1, ba = point2 - point1;
                    pa.x *= aspectRatio;
                    ba.x *= aspectRatio;
                    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
                    return length(pa - ba * h);
                }

                float cubicIn(float t) {
                    return t * t * t;
                }

                void main () {
                    #ifdef SPLAT_DOT
                        vec2 p = vUv - point.xy;
                        p.x *= aspectRatio;
                        vec3 splat = exp(-dot(p, p) / (radius / 50.0)) * color; // vec3 splat = exp(-dot(p, p) / radius) * color;
                    #else
                        vec3 splat =  cubicIn(clamp(1.0 - line(vUv, prevPoint.xy, point.xy) / radius, 0.0, 1.0)) * color;
                    #endif

                    vec3 base = texture2D(uTarget, vUv).xyz;
                    vec3 result = base + splat;
                    if (isDye) result = clamp(result, vec3(0.0), vec3(1.0));

                    gl_FragColor = vec4(result, 1.0);
                }
            `,
            depthTest: !1,
            depthWrite: !1
        })
        this._materialCurl = new THREE.RawShaderMaterial({
            name: "FLUID_CURL",
            uniforms: {
                texelSize: {value: new THREE.Vector2},
                uVelocity: {value: null}
            },
            vertexShader: `
                precision ${highPrecision} float;

                attribute vec3 position;
                attribute vec2 uv;

                uniform vec2 texelSize;

                varying vec2 vL;
                varying vec2 vR;
                varying vec2 vT;
                varying vec2 vB;

                void main () {
                    vL = uv - vec2(texelSize.x, 0.0);
                    vR = uv + vec2(texelSize.x, 0.0);
                    vT = uv + vec2(0.0, texelSize.y);
                    vB = uv - vec2(0.0, texelSize.y);
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision ${mediumPrecision} float;
                precision ${mediumPrecision} sampler2D;

                uniform sampler2D uVelocity;

                varying highp vec2 vL;
                varying highp vec2 vR;
                varying highp vec2 vT;
                varying highp vec2 vB;

                void main () {
                    float L = texture2D(uVelocity, vL).y;
                    float R = texture2D(uVelocity, vR).y;
                    float T = texture2D(uVelocity, vT).x;
                    float B = texture2D(uVelocity, vB).x;
                    float vorticity = R - L - T + B;
                    gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
                }
            `,
            depthTest: !1,
            depthWrite: !1
        })
        this._materialVorticity = new THREE.RawShaderMaterial({
            name: "FLUID_VORTICITY",
            uniforms: {
                texelSize: {value: new THREE.Vector2},
                uVelocity: {value: null},
                uCurl: {value: null},
                curl: {value: this._curlStrength},
                dt: {value: 1 / 60}
            },
            vertexShader: `
                precision ${highPrecision} float;

                attribute vec3 position;
                attribute vec2 uv;

                uniform vec2 texelSize;

                varying vec2 vUv;
                varying vec2 vL;
                varying vec2 vR;
                varying vec2 vT;
                varying vec2 vB;

                void main () {
                    vUv = uv;
                    vL = vUv - vec2(texelSize.x, 0.0);
                    vR = vUv + vec2(texelSize.x, 0.0);
                    vT = vUv + vec2(0.0, texelSize.y);
                    vB = vUv - vec2(0.0, texelSize.y);
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision ${highPrecision} float;
                precision ${highPrecision} sampler2D;

                uniform sampler2D uVelocity;
                uniform sampler2D uCurl;
                uniform float curl;
                uniform float dt;

                varying vec2 vUv;
                varying vec2 vL;
                varying vec2 vR;
                varying vec2 vT;
                varying vec2 vB;

                void main () {
                    float L = texture2D(uCurl, vL).x;
                    float R = texture2D(uCurl, vR).x;
                    float T = texture2D(uCurl, vT).x;
                    float B = texture2D(uCurl, vB).x;
                    float C = texture2D(uCurl, vUv).x;
                    vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
                    force /= length(force) + 0.0001;
                    force *= curl * C;
                    force.y *= -1.0;
                    vec2 vel = texture2D(uVelocity, vUv).xy;
                    gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
                }
            `,
            depthTest: !1,
            depthWrite: !1
        })
        this._materialDivergence = new THREE.RawShaderMaterial({
            name: "FLUID_DIVERGENCE",
            uniforms: {
                texelSize: {value: new THREE.Vector2},
                uVelocity: {value: null}
            },
            vertexShader: `
                precision ${highPrecision} float;

                attribute vec3 position;
                attribute vec2 uv;

                uniform vec2 texelSize;

                varying vec2 vUv;
                varying vec2 vL;
                varying vec2 vR;
                varying vec2 vT;
                varying vec2 vB;

                void main () {
                    vUv = uv;
                    vL = vUv - vec2(texelSize.x, 0.0);
                    vR = vUv + vec2(texelSize.x, 0.0);
                    vT = vUv + vec2(0.0, texelSize.y);
                    vB = vUv - vec2(0.0, texelSize.y);
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision ${mediumPrecision} float;
                precision ${mediumPrecision} sampler2D;
                ${this._borders ? "#define LIMIT_BORDERS" : ""}

                uniform sampler2D uVelocity;

                varying highp vec2 vUv;
                varying highp vec2 vL;
                varying highp vec2 vR;
                varying highp vec2 vT;
                varying highp vec2 vB;

                void main () {
                    float L = texture2D(uVelocity, vL).x;
                    float R = texture2D(uVelocity, vR).x;
                    float T = texture2D(uVelocity, vT).y;
                    float B = texture2D(uVelocity, vB).y;
                    vec2 C = texture2D(uVelocity, vUv).xy;

                    #ifdef LIMIT_BORDERS
                        if (vL.x < 0.0) { L = -C.x; }
                        if (vR.x > 1.0) { R = -C.x; }
                        if (vT.y > 1.0) { T = -C.y; }
                        if (vB.y < 0.0) { B = -C.y; }
                    #endif

                    float div = 0.5 * (R - L + T - B);
                    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
                }
            `,
            depthTest: !1,
            depthWrite: !1
        })
        this._materialPressure = new THREE.RawShaderMaterial({
            name: "FLUID_PRESSURE",
            uniforms: {
                texelSize: {value: new THREE.Vector2},
                uPressure: {value: null},
                uDivergence: {value: null}
            },
            vertexShader: `
                precision ${highPrecision} float;

                attribute vec3 position;
                attribute vec2 uv;

                uniform vec2 texelSize;

                varying vec2 vUv;
                varying vec2 vL;
                varying vec2 vR;
                varying vec2 vT;
                varying vec2 vB;

                void main () {
                    vUv = uv;
                    vL = vUv - vec2(texelSize.x, 0.0);
                    vR = vUv + vec2(texelSize.x, 0.0);
                    vT = vUv + vec2(0.0, texelSize.y);
                    vB = vUv - vec2(0.0, texelSize.y);
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision ${mediumPrecision} float;
                precision ${mediumPrecision} sampler2D;

                uniform sampler2D uPressure;
                uniform sampler2D uDivergence;

                varying highp vec2 vUv;
                varying highp vec2 vL;
                varying highp vec2 vR;
                varying highp vec2 vT;
                varying highp vec2 vB;

                void main () {
                    float L = texture2D(uPressure, vL).x;
                    float R = texture2D(uPressure, vR).x;
                    float T = texture2D(uPressure, vT).x;
                    float B = texture2D(uPressure, vB).x;
                    float C = texture2D(uPressure, vUv).x;
                    float divergence = texture2D(uDivergence, vUv).x;
                    float pressure = (L + R + B + T - divergence) * 0.25;
                    gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
                }
            `,
            depthTest: !1,
            depthWrite: !1
        })
        this._materialGradientSubstract = new THREE.RawShaderMaterial({
            name: "FLUID_GRADIENT_SUBSTRACT",
            uniforms: {
                texelSize: {value: new THREE.Vector2},
                uPressure: {value: null},
                uVelocity: {value: null}
            },
            vertexShader: `
                precision ${highPrecision} float;

                attribute vec3 position;
                attribute vec2 uv;

                uniform vec2 texelSize;

                varying vec2 vUv;
                varying vec2 vL;
                varying vec2 vR;
                varying vec2 vT;
                varying vec2 vB;

                void main () {
                    vUv = uv;
                    vL = vUv - vec2(texelSize.x, 0.0);
                    vR = vUv + vec2(texelSize.x, 0.0);
                    vT = vUv + vec2(0.0, texelSize.y);
                    vB = vUv - vec2(0.0, texelSize.y);
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision ${mediumPrecision} float;
                precision ${mediumPrecision} sampler2D;

                uniform sampler2D uPressure;
                uniform sampler2D uVelocity;

                varying highp vec2 vUv;
                varying highp vec2 vL;
                varying highp vec2 vR;
                varying highp vec2 vT;
                varying highp vec2 vB;

                void main () {
                    float L = texture2D(uPressure, vL).x;
                    float R = texture2D(uPressure, vR).x;
                    float T = texture2D(uPressure, vT).x;
                    float B = texture2D(uPressure, vB).x;
                    vec2 velocity = texture2D(uVelocity, vUv).xy;
                    velocity.xy -= vec2(R - L, T - B);
                    gl_FragColor = vec4(velocity, 0.0, 1.0);
                }
            `,
            depthTest: !1,
            depthWrite: !1
        })
        this._materialAdvection = new THREE.RawShaderMaterial({
            name: "FLUID_ADVECTION",
            uniforms: {
                texelSize: {value: new THREE.Vector2},
                dyeTexelSize: {value: new THREE.Vector2().setScalar(1 / this._dyeRes)},
                uVelocity: {value: null},
                uSource: {value: null},
                dt: {value: 1 / 60},
                dissipation: {value: 1}
            },
            vertexShader: `
                precision ${highPrecision} float;

                attribute vec3 position;
                attribute vec2 uv;

                varying vec2 vUv;

                void main () {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision ${highPrecision} float;
                precision ${highPrecision} sampler2D;
                ${this._linearFilteringSupported ? "" : "#define MANUAL_FILTERING"}

                uniform sampler2D uVelocity;
                uniform sampler2D uSource;
                uniform vec2 texelSize;
                uniform vec2 dyeTexelSize;
                uniform float dt;
                uniform float dissipation;

                varying vec2 vUv;

                vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
                    vec2 st = uv / tsize - 0.5;
                    vec2 iuv = floor(st);
                    vec2 fuv = fract(st);
                    vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
                    vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
                    vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
                    vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
                    return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
                }

                void main () {
                    vec4 result;

                    #ifdef MANUAL_FILTERING
                        vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
                        result = bilerp(uSource, coord, dyeTexelSize);
                    #else
                        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
                        result = texture2D(uSource, coord);
                    #endif

                    gl_FragColor.rgb = result.rgb * dissipation;
                    gl_FragColor.a = 1.0;
                }
            `,
            depthTest: !1,
            depthWrite: !1
        })
    }

    _createScene() {
        this._scene = new THREE.Scene;
        this._camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
        geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2));
        this._mesh = new THREE.Mesh(geometry, this._materialClear)
        this._mesh.frustumCulled = !1
        this._scene.add(this._mesh)
    }

    _update(e) {
        const time = e.data
        if (this._mode === 1) {
            this._aspect = this.base.uniforms.resolution.value.x / this.base.uniforms.resolution.value.y;
        }
        const n = this.base.renderer.webgl.autoClear;
        this.base.renderer.webgl.autoClear = false;
        this.points.forEach(r => {
            if (time - r.lastUpdate < 0.016) return;
            this.rc.subVectors(r.position, r.prevPosition);
            const a = this.rc.length();
            r.velocity += a * 2
            if (a > 0) {
                const l = time - r.lastSplat > 0.15;
                this._mesh.material = this._materialSplat;
                this._materialSplat.uniforms.isDye.value = false;
                this._materialSplat.uniforms.uTarget.value = this._velocity.read.texture;
                this._materialSplat.uniforms.aspectRatio.value = this._aspect;
                this._materialSplat.uniforms.point.value.copy(r.position);
                this._materialSplat.uniforms.prevPoint.value.copy(l ? r.position : r.prevPosition);
                this._materialSplat.uniforms.color.value.set(this.rc.x, this.rc.y, 0).multiplyScalar(this._splatForce).multiplyScalar(l ? 0 : 1);
                this._materialSplat.uniforms.radius.value = this._splatRadius * (this._splatRadiusVelocity ? r.velocity : 1);

                this.base.renderer.webgl.setRenderTarget(this._velocity.write);
                this.base.renderer.webgl.render(this._scene, this._camera);
                this._velocity.swap();

                this._materialSplat.uniforms.isDye.value = true;
                this._materialSplat.uniforms.uTarget.value = this._density.read.texture;
                this._materialSplat.uniforms.color.value.setScalar(1);

                this.base.renderer.webgl.setRenderTarget(this._density.write);
                this.base.renderer.webgl.render(this._scene, this._camera);
                this._density.swap();

                r.lastSplat = e;
            }

            r.lastUpdate = e;
            r.prevPosition.copy(r.position);
            r.velocity *= 0.9;
            r.velocity = Math.min(1, r.velocity);
        });

        const s = this.base.ratio;

        this._mesh.material = this._materialCurl;
        this._materialCurl.uniforms.texelSize.value.setScalar(this._simTexelSize);
        this._materialCurl.uniforms.uVelocity.value = this._velocity.read.texture;

        this.base.renderer.webgl.setRenderTarget(this._curl);
        this.base.renderer.webgl.render(this._scene, this._camera);

        this._mesh.material = this._materialVorticity;
        this._materialVorticity.uniforms.texelSize.value.setScalar(this._simTexelSize);
        this._materialVorticity.uniforms.uVelocity.value = this._velocity.read.texture;
        this._materialVorticity.uniforms.uCurl.value = this._curl.texture;
        this._materialVorticity.uniforms.curl.value = this._curlStrength;
        this._materialVorticity.uniforms.dt.value = s;

        this.base.renderer.webgl.setRenderTarget(this._velocity.write);
        this.base.renderer.webgl.render(this._scene, this._camera);
        this._velocity.swap();

        this._mesh.material = this._materialDivergence;
        this._materialDivergence.uniforms.texelSize.value.setScalar(this._simTexelSize);
        this._materialDivergence.uniforms.uVelocity.value = this._velocity.read.texture;

        this.base.renderer.webgl.setRenderTarget(this._divergence);
        this.base.renderer.webgl.render(this._scene, this._camera);

        this._mesh.material = this._materialClear;
        this._materialClear.uniforms.uTexture.value = this._pressure.read.texture;
        this._materialClear.uniforms.value.value = this.base.utils.frictionFPS(this._pressureDissipation);

        this.base.renderer.webgl.setRenderTarget(this._pressure.write);
        this.base.renderer.webgl.render(this._scene, this._camera);
        this._pressure.swap();

        this._mesh.material = this._materialPressure;
        this._materialPressure.uniforms.texelSize.value.setScalar(this._simTexelSize);
        this._materialPressure.uniforms.uDivergence.value = this._divergence.texture;

        for (let r = 0; r < this._pressureIterations; r++) {
            this._materialPressure.uniforms.uPressure.value = this._pressure.read.texture;
            this.base.renderer.webgl.setRenderTarget(this._pressure.write);
            this.base.renderer.webgl.render(this._scene, this._camera);
            this._pressure.swap();
        }

        this._mesh.material = this._materialGradientSubstract;
        this._materialGradientSubstract.uniforms.texelSize.value.setScalar(this._simTexelSize);
        this._materialGradientSubstract.uniforms.uPressure.value = this._pressure.read.texture;
        this._materialGradientSubstract.uniforms.uVelocity.value = this._velocity.read.texture;

        this.base.renderer.webgl.setRenderTarget(this._velocity.write);
        this.base.renderer.webgl.render(this._scene, this._camera);
        this._velocity.swap();

        this._mesh.material = this._materialAdvection;
        this._materialAdvection.uniforms.texelSize.value.setScalar(this._simTexelSize);
        this._materialAdvection.uniforms.dyeTexelSize.value.setScalar(this._simTexelSize);
        this._materialAdvection.uniforms.uVelocity.value = this._velocity.read.texture;
        this._materialAdvection.uniforms.uSource.value = this._velocity.read.texture;
        this._materialAdvection.uniforms.dt.value = s;
        this._materialAdvection.uniforms.dissipation.value = this.base.utils.frictionFPS(this._velocityDissipation);

        this.base.renderer.webgl.setRenderTarget(this._velocity.write);
        this.base.renderer.webgl.render(this._scene, this._camera);
        this._velocity.swap();

        this._materialAdvection.uniforms.dyeTexelSize.value.setScalar(this._dyeTexelSize);
        this._materialAdvection.uniforms.uVelocity.value = this._velocity.read.texture;
        this._materialAdvection.uniforms.uSource.value = this._density.read.texture;
        this._materialAdvection.uniforms.dissipation.value = this.base.utils.frictionFPS(this._densityDissipation);

        this.base.renderer.webgl.setRenderTarget(this._density.write);
        this.base.renderer.webgl.render(this._scene, this._camera);
        this._density.swap();

        this.base.renderer.webgl.autoClear = n;
        this.dyeUniform.value = this._density.read.texture;
        this.velUniform.value = this._velocity.read.texture;
    }

    _moveFinger(e) {
        this.points[e.data.finger].position.copy(e.data.prevPosition)
    }

    enable() {
        if (!this._enabled) {
            this._enabled = !0
            this.base.eventManage.on("webgl_prerender", this._update.bind(this))
            if (this._mode === 1) {
                for (let e = 0; e < this._fingers; e++) {
                    this.base.eventManage.on(`touch${e === 0 ? "" : e + 1}_start`, this._moveFinger.bind(this))
                    this.base.eventManage.on(`touch${e === 0 ? "" : e + 1}_move`, this._moveFinger.bind(this))
                }
            }
        }
    }

    disable() {
        if (this._enabled) {
            this._enabled = !1
            this.base.eventManage.on("webgl_prerender", this._update.bind(this))
            if (this._mode === 1) {
                for (let e = 0; e < this._fingers; e++) {
                    this.base.eventManage.on(`touch${e === 0 ? "" : e + 1}_start`, this._moveFinger.bind(this))
                    this.base.eventManage.on(`touch${e === 0 ? "" : e + 1}_move`, this._moveFinger.bind(this))
                }
            }
        }
    }


    dispose() {
        this.disable()
        this._materialClear.dispose()
        this._materialSplat.dispose()
        this._materialCurl.dispose()
        this._materialVorticity.dispose()
        this._materialDivergence.dispose()
        this._materialPressure.dispose()
        this._materialGradientSubstract.dispose()
        this._materialAdvection.dispose();
        [this._density, this._velocity, this._pressure].forEach(e => e.read.dispose() && e.write.dispose())
        this._divergence.dispose()
        this._curl.dipose()
    }
}

class FlowerCreate {
    constructor(base, t = {}) {
        this.base = base;
        this.scene = this.base.scene;
        this.baseTime = 0
        this.additionalTime = 0
        this.additionalTimeTarget = 0
        this.additionalHold = 0
        this.additionalHoldTarget = 0
        this.touching = !1
        this.options = {petalCount: 38, ...t}
        this.init()
    }

    init() {
        this.geometry = this.base.petal;
        this.count = this.options.petalCount
        const float32Array = new Float32Array(this.count);
        for (let l = 0; l < this.count; l++) {
            float32Array[l] = Math.random();
        }
        const s = new THREE.InstancedBufferAttribute(float32Array, 1, !1, 1)
        this.geometry.setAttribute("random", s);
        this.material = new THREE.ShaderMaterial({
            uniformsGroups: [this.base.UBO],
            uniforms: {
                uCount: {value: this.count},
                uColor1: {value: new THREE.Color("#d88b3e")},
                uColor2: {value: new THREE.Color("#ddb94c")},
                uOutlineColor: {value: new THREE.Color("#b84a08")},
                tPetal: {value: this.base.petalTexture},
                tNoise: {value: this.base.noiseSimplexLayeredTexture},
                uFlowerTime: {value: 0}
            },
            side: THREE.DoubleSide,
            vertexShader: `
            uniform Global{
    vec2 resolution;
    float time;
    float dtRatio;
};

uniform float uCount;
uniform sampler2D tNoise;
uniform float uFlowerTime;

attribute float random;

varying vec2 vUv;
varying vec2 vHighPrecisionZW;
varying float vRandom;
varying float vProgress;
varying vec3 vNormal;
flat varying float vIndex;

mat2 rotateAngle(float a) {
    float s = sin(a);
    float c = cos(a);
    mat2 m = mat2(c, s, -s, c);
    return m;
}

const float PI = 3.14159;
const float HALF_PI = PI * 0.5;
const float TWO_PI = PI * 2.0;

void main() {
    float index = float(gl_InstanceID);
    vIndex = index;

    vUv = uv;
    vRandom = random;
    vNormal = normalize(normalMatrix * normal);

    float idx = index / uCount;

    vec3 pos = position;
    float t = uFlowerTime * 0.075;

    // progress value from zero to one
    float progress01 = fract(idx + t + 0.5);
    vProgress = progress01;

    // waviness
    pos.x += cos(vUv.y * 8.0 - progress01 * 24.0 + random) * 0.02;

    // offset from exact center
    pos.z += 0.15;

    // scale petal width
    pos.x *= 1.2;

    // scale petal over progress
    float scale = 1.0;
    scale *= abs(progress01 - 0.5) * 2.0;
    scale = 1.0 - pow(scale, 3.0);
    pos *= scale;

    // curl around length axis
    mat2 rot0 = rotateAngle(-(vUv.x - 0.5) * (1.0 - progress01) * 1.5);
    pos.xy = rot0 * pos.xy;

    // unfold
    mat2 rot1 = rotateAngle(progress01 * PI - HALF_PI - vUv.y * 2.0 + 1.7 + sin(progress01 * 16.0 - vUv.y * 3.0 + 0.5) * 0.35 * pow(1.0 - progress01, 2.0));
    pos.yz = rot1 * pos.yz;

    // position in formation
    mat2 rot2 = rotateAngle(index * 4.854 + random * 0.05);
    pos.xz = rot2 * pos.xz;

    // offset in space to reduce intersections
    pos.y -= pow(progress01, 2.0) * 0.5;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    vHighPrecisionZW = gl_Position.zw;
}

            `,
            fragmentShader: `
            layout(location = 1) out highp vec4 gInfo;

uniform Global{
    vec2 resolution;
    float time;
    float dtRatio;
};

float aastep(float threshold, float value){
    float afwidth=length(vec2(dFdx(value), dFdy(value)))*0.70710678118654757;
    return smoothstep(threshold-afwidth, threshold+afwidth, value);
}

vec2 encodeNormal(vec3 n){
    n/=(abs(n.x)+abs(n.y)+abs(n.z));
    return (n.z>=0.0)? n.xy :(1.0-abs(n.yx))*sign(n.xy);
}
vec3 decodeNormal(vec2 f){
    vec3 n=vec3(f, 1.0-abs(f.x)-abs(f.y));
    float t=max(-n.z, 0.0);
    n.x+=(n.x>0.0)?-t : t;
    n.y+=(n.y>0.0)?-t : t;
    return normalize(n);
}
vec2 encodeNormalUint8(vec3 n){
    return encodeNormal(n)*0.5+0.5;
}vec3 deodeNormalUint8(vec2 n){
    return decodeNormal(n*2.0-1.0);
}
vec2 encodeNormalSpheremap(vec3 n){
    float f=sqrt(8.0*n.z+8.0);
    return n.xy/f*2.0;
}
vec3 decodeNormalSpheremap(vec2 n){
    vec4 nn=vec4(n.xy, 1.0, -1.0);
    float l=dot(nn.xyz, -nn.xyw);
    nn.z=l;
    nn.xy*=sqrt(l);
    return nn.xyz*2.0+vec3(0.0, 0.0, -1.0);
}
vec2 encodeNormalSpheremapUint8(vec3 n){
    return encodeNormalSpheremap(n)*0.5+0.5;
}
vec3 deodeNormalSimpleUint8(vec2 n){
    return decodeNormalSpheremap(n*2.0-1.0);
}

uniform sampler2D tPetal;
uniform sampler2D tNoise;

uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uOutlineColor;

varying vec3 vNormal;
varying vec2 vUv;
varying vec2 vHighPrecisionZW;
varying float vRandom;
varying float vProgress;
flat varying float vIndex;

void main() {
    vec2 uv = vUv;
    float steppedTime = floor(time * 6.0);

    // uv displacement
    uv.x += sin(uv.y * 55.0 + steppedTime * 2.0) * 0.0015;

    // break up lines with noise
    float noise = texture2D(tNoise, vUv * 0.75 + vRandom + steppedTime * 0.02).r;
    noise = smoothstep(0.0, 0.1, noise);
    float outlineContribution = noise;

    // color petals based on length and life
    vec3 color = mix(uColor1, uColor2, uv.y);
    float lines = texture2D(tPetal, uv).r;
    lines = aastep(0.5, lines);
    color *= mix(vec3(1.0, 0.0, 0.0), vec3(1.0), 1.0 - vProgress);
    color = mix(uOutlineColor, color, lines);

    gl_FragColor = vec4(color, fract(vIndex * 21.33424));

    vec3 infoNormal = normalize(vNormal) * vec3(gl_FrontFacing ? 1.0 : -1.0);
    gInfo = vec4(1.0 - (0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5), vec3(encodeNormalSpheremap(infoNormal), noise));
}

            `,
        })
        this.mesh = new THREE.Group()
        this.mesh.name = "flower";
        this.instancedMesh = new THREE.InstancedMesh(this.geometry, this.material, this.count)
        this.instancedMesh.rotation.x = 3.14159 * .5 - .5
        this.instancedMesh.rotation.z = 3.14159 * .05
        this.instancedMesh.position.y += .03
        this.instancedMesh.renderOrder = 3
        this.mesh.add(this.instancedMesh);
        this.instancedMesh.updateMatrixWorld();
        this.instancedMesh.matrixAutoUpdate = !1;
        this.instancedMesh.onBeforeRender = () => {
            this.additionalTime = this.base.utils.lerpFPS(this.additionalTime, this.additionalTimeTarget, .035)
            this.baseTime += this.base.timeStats.delta * .001
            this.additionalHoldTarget += this.touching ? this.base.timeStats.delta * .0025 : 0
            this.additionalHold = this.base.utils.lerpFPS(this.additionalHold, this.additionalHoldTarget, .035)
            this.material.uniforms.uFlowerTime.value = this.baseTime + this.additionalTime + this.additionalHold
            this.mesh.rotation.y = -this.scene.camera._additionalSphericalPosition.theta * 7
            this.mesh.rotation.x = this.scene.camera._additionalSphericalPosition.phi * 7
        }
        this.base.eventManage.on("wheel", this.onWheel.bind(this))
        this.base.eventManage.on("touch_drag", this.onTouchDrag.bind(this))
        this.base.eventManage.on("touch_start", this.onTouchStart.bind(this))
        this.base.eventManage.on("touch_end", this.onTouchEnd.bind(this))
        this.scene.add(this.mesh)
    }


    onWheel(e) {
        const t = Math.abs(e.delta.y) > Math.abs(e.delta.x) ? e.delta.y : e.delta.x;
        this.additionalTimeTarget += t * 65e-5 * (t < 0 ? 2 : 1)
    }

    onTouchDrag(e) {
        const t = Math.abs(e.delta11.y) > Math.abs(e.delta11.x) ? -e.delta11.y : e.delta11.x;
        this.additionalTimeTarget -= t * 2.5 * (t > 0 ? 1.5 : 1)
        Math.abs(e.dragged.x) + Math.abs(e.dragged.y) > 20 && (this.touching = !1)
    }

    onTouchStart() {
        this.touching = !0
    }

    onTouchEnd() {
        this.touching = !1
    }
}

class CreateLeafMesh extends THREE.InstancedMesh {
    constructor(base) {
        super(base.geometry, base.material, base.options.count)
        this.base = base;
        this.renderer = this.base.base.renderer.webgl;
        this.isParticlesGPU = true
        this.name = "GPU Particles"
        this.particlesCount = base.options.count
        this.frustumCulled = false;
        const s = THREE.FloatType;
        const r = Math.max(2, this.base.base.utils.ceilPowerOfTwo(Math.sqrt(this.particlesCount)));
        this.rt1 = new THREE.WebGLMultipleRenderTargets(r, r, this.base.data.textures || 1, {
            wrapS: THREE.ClampToEdgeWrapping,
            wrapT: THREE.ClampToEdgeWrapping,
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat,
            type: s,
            depthBuffer: !1
        })
        this.rt2 = this.rt1.clone()
        this.rtCurrent = 0
        this.fsQuad = new FullScreenQuad(null)
        if (this.base.data.initialTextures && this.base.data.initialTextures.length > 0) {
            const uniforms = {};
            this.base.data.initialTextures.forEach((u, d) => {
                uniforms[`tTexture${d + 1}`] = {value: u}
            });
            const material = new THREE.ShaderMaterial({
                uniforms,
                vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
                `,
                fragmentShader: `
                varying vec2 vUv;
                #define outTex1 pc_fragColor
                uniform sampler2D tTexture1;
                layout(location = 1) out highp vec4 outTex2;
                uniform sampler2D tTexture2;
                void main() {
                    outTex1 = texture2D(tTexture1, vUv);
                    outTex2 = texture2D(tTexture2, vUv);
                }
                `
            })
            this.fsQuad.material = material;
            const c = this.renderer.autoClear
            const h = this.renderer.getRenderTarget();
            this.renderer.autoClear = !1
            this.renderer.setRenderTarget(this.rt1)
            this.fsQuad.render(this.renderer)
            this.renderer.setRenderTarget(this.rt2)
            this.fsQuad.render(this.renderer)
            this.renderer.autoClear = c
            this.renderer.setRenderTarget(h)
            material.dispose()
        }
        this.computationMaterial = this.base.data.material
        this.fsQuad.material = this.computationMaterial
        this.base.data.afterCompute && (this.afterCompute = this.base.data.afterCompute)
        this.base.data.autoCompute !== !1 && (this.onBeforeRender = this.compute.bind(this))
    }

    compute(renderer, scene, camera) {
        const r = this.computationMaterial.uniforms.uModelMatrix;
        const a = this.computationMaterial.uniforms.uViewMatrix;
        const o = this.computationMaterial.uniforms.uProjMatrix;
        r && r.value.copy(this.matrixWorld);
        a && a.value.copy(camera.matrixWorldInverse);
        o && o.value.copy(camera.projectionMatrix);
        const l = this.rtCurrent === 0 ? this.rt1 : this.rt2;
        const c = this.rtCurrent === 0 ? this.rt2 : this.rt1;
        this.rtCurrent = (this.rtCurrent + 1) % 2;
        for (let f = 0; f < c.texture.length; f++) {
            const A = this.computationMaterial.uniforms[`tTexture${f + 1}`];
            A && (A.value = c.texture[f])
        }
        const h = renderer.autoClear;
        renderer.autoClear = !1;
        const u = renderer.getRenderTarget();
        renderer.setRenderTarget(l)
        renderer.getClearColor(new THREE.Color);
        const d = renderer.getClearAlpha();
        renderer.setClearColor(new THREE.Color('#000000'), 0)
        renderer.clear(!0, !1, !1)
        this.fsQuad.render(renderer)
        renderer.autoClear = h
        renderer.setRenderTarget(u)
        renderer.setClearColor(new THREE.Color, d);
        for (let f = 0; f < l.texture.length; f++) {
            const A = this.material.uniforms[`tTexture${f + 1}`];
            A && (A.value = l.texture[f]);
            const g = this.material.uniforms[`tTexture${f + 1}Prev`];
            g && (g.value = c.texture[f])
        }
        this.afterCompute && this.afterCompute(renderer, scene, camera)
    }

    dispose() {
        let t;
        this.fsQuad.dispose();
        this.computationMaterial.dispose();
        this.rt1.dispose();
        this.rt2.dispose();
        (t = super.dispose) == null || t.call(this)
    }
}

 class LeavesCreate {
    constructor(base, t = {}) {
        this.base = base;
        this.options = {count: 140, ...t}
        this.init()
    }

    init() {
        const t = this.options.count
        const n = Math.max(2, this.base.utils.ceilPowerOfTwo(Math.sqrt(t)))
        const s = new Float32Array(n * n * 4);
        for (let o = 0; o < t; o++) {
            s[o * 4 + 0] = Math.random() * 32 - 16
            s[o * 4 + 1] = Math.random() * 12 - 6
            s[o * 4 + 2] = -2 - Math.random() * 6
            s[o * 4 + 3] = Math.random();
        }
        this.dataTextureR = new THREE.DataTexture(s, n, n, THREE.RGBAFormat, THREE.FloatType);
        this.dataTextureR.needsUpdate = !0;
        this.dataTextureA = new THREE.DataTexture(new Float32Array(n * n * 4), n, n, THREE.RGBAFormat, THREE.FloatType);
        this.dataTextureA.needsUpdate = !0
        this.data = {
            textures: 2,
            initialTextures: [this.dataTextureR, this.dataTextureA],
            material: new THREE.ShaderMaterial({
                uniformsGroups: [this.base.UBO],
                uniforms: {
                    tTexture1: {value: null},
                    tTexture2: {value: null},
                    tVel: this.base.fluidSim.velUniform,
                    uViewMatrix: {value: new THREE.Matrix4},
                    uModelMatrix: {value: new THREE.Matrix4},
                    uProjMatrix: {value: new THREE.Matrix4}
                },
                vertexShader: `
                varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}

                `,
                fragmentShader: `#define outPos pc_fragColor
uniform sampler2D tTexture1;

layout(location = 1) out highp vec4 outVel;
uniform sampler2D tTexture2;

uniform mat4 uProjMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
uniform sampler2D tVel;

varying vec2 vUv;

uniform Global{ vec2 resolution;float time;float dtRatio; };
float treadmill(float p, float margin){ float n=fract((p+margin)/(2.0*margin));return n*2.0*margin-margin; }
vec2 treadmill(vec2 p, vec2 margin){ vec2 n=fract((p+margin)/(2.0*margin));return n*2.0*margin-margin; }
vec3 treadmill(vec3 p, vec3 margin){ vec3 n=fract((p+margin)/(2.0*margin));return n*2.0*margin-margin; }
vec4 treadmill(vec4 p, vec4 margin){ vec4 n=fract((p+margin)/(2.0*margin));return n*2.0*margin-margin; }

void main() {
    ivec2 uv = ivec2(gl_FragCoord.xy);
    vec4 currentPos = texelFetch(tTexture1, uv, 0);
    vec4 currentVel = texelFetch(tTexture2, uv, 0);

    // add some velocity so leaves fall
    currentVel.x += (sin(time * 0.2 + currentPos.w * 15.6547) + sign(currentPos.w - 0.5) * 2.0) * 0.0005 * dtRatio;
    currentVel.y -= 0.0015 * max(0.2, fract(currentPos.w * 31.342)) * dtRatio;
    currentVel.z = 0.0;

    // add fluid sim interaction
    const float pushForce = 0.0035;
    vec4 wPos = uModelMatrix * vec4(currentPos.xyz, 1.0);
    vec4 vPos = uViewMatrix * wPos;
    vec4 posProjected = uProjMatrix * vPos;
    vec2 uvScreen = (posProjected.xy / posProjected.w + 1.0) * 0.5;
    vec2 vel = texture2D(tVel, uvScreen).xy;

    /*
    // since the camera is on -z, there's no need to calculate up and right vectors of camera
    vec3 up = vec3(uViewMatrix[0][1], uViewMatrix[1][1], uViewMatrix[2][1]);
    vec3 right = vec3(uViewMatrix[0][0], uViewMatrix[1][0], uViewMatrix[2][0]);
    vec3 disp = (right * vel.x + up * vel.y);
    */
    currentVel.xy += vel * pushForce * dtRatio;

    // store rotation in alpha
    currentVel.a += length(vel) * pushForce * dtRatio;

    // friction
    currentVel.xyz *= exp2(log2(0.9) * dtRatio);

    // add vel to position
    currentPos.xyz += currentVel.xyz * dtRatio;

    // treadmill position
    currentPos.xy = treadmill(currentPos.xy, vec2(16.0, 6.0));

    outVel = currentVel;
    outPos = currentPos;
}
`
            })
        }
        this.createGeometry();
        this.createMaterial();
        this.createMesh();
    }

    createGeometry() {
        const clone = this.base.leaf.clone();
        this.geometry = new THREE.InstancedBufferGeometry()
        this.geometry.instanceCount = this.options.count;
        clone.index && this.geometry.setIndex(clone.index);
        for (const h in clone.attributes) {
            this.geometry.setAttribute(h, clone.attributes[h])
        }
        const s = []
        const r = []
        const a = Math.max(2, this.base.utils.ceilPowerOfTwo(Math.sqrt(this.options.count)))
        const o = 1 / a * .5;
        for (let c = 0; c < this.options.count; c++) {
            s.push(Math.random(), Math.random(), Math.random(), Math.random());
            const h = c % a / a + o
            const u = Math.floor(c / a) / a + o;
            r.push(h, u)
        }
        this.geometry.setAttribute("rand", new THREE.InstancedBufferAttribute(new Float32Array(s), 4))
        this.geometry.setAttribute("texuv", new THREE.InstancedBufferAttribute(new Float32Array(r), 2))
    }

    createMaterial() {
        this.material = new THREE.ShaderMaterial({
            uniformsGroups: [this.base.UBO],
            uniforms: {
                tTexture1: {value: null},
                tTexture2: {value: this.dataTextureA},
                uCount: {value: this.options.count},
                uColor1: {value: new THREE.Color("#886a3d")},
                uOutlineColor: {value: new THREE.Color("#904619")},
                tPetal: {value: this.base.leafTexture},
                tNoise: {value: this.base.noiseSimplexLayeredTexture}
            },
            vertexShader: `uniform Global{ vec2 resolution;float time;float dtRatio; };

uniform float uCount;

attribute vec4 rand;
attribute vec2 texuv;
uniform sampler2D tTexture1;
uniform sampler2D tTexture2;

varying vec2 vUv;
varying vec2 vHighPrecisionZW;
varying vec3 vNormal;
varying vec4 vRandom;
varying float vProgress;
flat varying float vIndex;

mat2 rotateAngle(float a) {
    float s = sin(a);
    float c = cos(a);
    mat2 m = mat2(c, s, -s, c);
    return m;
}

const float PI = 3.14159;
const float HALF_PI = PI * 0.5;
const float TWO_PI = PI * 2.0;

void main() {
    float index = float(gl_InstanceID);
    vIndex = index;

    vUv = uv;
    vRandom = rand;

    vec3 pos = position;
    pos *= mix(1.2, 1.6, step(rand.x, 0.5));

    // rotation value from fluid sim
    float interactionRotation = texture2D(tTexture2, texuv).a * 5.0;

    // curl upwards
    mat2 rot = rotateAngle(0.25 * sin(uv.y * 3.5 + time + rand.z * 12.0 + rand.y + rand.x + interactionRotation * 3.0) + 0.2 * (1.0 - pow(1.0 - position.z, 2.0)));
    pos.yz = rot * pos.yz;

    // random rotation angle
    mat2 rot0 = rotateAngle(time * mix(0.25, 0.75, rand.z) + rand.z * 3.14 * 2.0);
    mat2 rot1 = rotateAngle((rand.y + rand.z + rand.x) * 3.14 * 2.0 + interactionRotation);
    mat2 rot2 = rotateAngle(rand.x * 3.14 * 2.0);
    pos.xy = rot0 * pos.xy;
    pos.zx = rot1 * pos.zx;
    pos.yz = rot2 * pos.yz;

    vec3 norm = normal;
    norm.xy = rot0 * norm.xy;
    norm.zx = rot1 * norm.zx;
    norm.yz = rot2 * norm.yz;
    vNormal = normalize(normalMatrix * norm);

    vec3 offset = texture2D(tTexture1, texuv).xyz;

    pos += offset;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    vHighPrecisionZW = gl_Position.zw;
}
`,
            fragmentShader: `
            layout(location = 1) out highp vec4 gInfo;

uniform Global{ vec2 resolution;float time;float dtRatio; };
float aastep(float threshold, float value){
    float afwidth=length(vec2(dFdx(value), dFdy(value)))*0.70710678118654757;
    return smoothstep(threshold-afwidth, threshold+afwidth, value);
}
vec2 encodeNormal(vec3 n){ n/=(abs(n.x)+abs(n.y)+abs(n.z));return (n.z>=0.0)? n.xy :(1.0-abs(n.yx))*sign(n.xy); }
vec3 decodeNormal(vec2 f){ vec3 n=vec3(f, 1.0-abs(f.x)-abs(f.y));float t=max(-n.z, 0.0);n.x+=(n.x>0.0)?-t : t;n.y+=(n.y>0.0)?-t : t;return normalize(n); }
vec2 encodeNormalUint8(vec3 n){ return encodeNormal(n)*0.5+0.5; }
vec3 deodeNormalUint8(vec2 n){ return decodeNormal(n*2.0-1.0); }
vec2 encodeNormalSpheremap(vec3 n){ float f=sqrt(8.0*n.z+8.0);return n.xy/f*2.0; }
vec3 decodeNormalSpheremap(vec2 n){ vec4 nn=vec4(n.xy, 1.0, -1.0);float l=dot(nn.xyz, -nn.xyw);nn.z=l;nn.xy*=sqrt(l);return nn.xyz*2.0+vec3(0.0, 0.0, -1.0); }
vec2 encodeNormalSpheremapUint8(vec3 n){ return encodeNormalSpheremap(n)*0.5+0.5; }
vec3 deodeNormalSimpleUint8(vec2 n){ return decodeNormalSpheremap(n*2.0-1.0); }

uniform sampler2D tPetal;
uniform sampler2D tNoise;

uniform vec3 uColor1;
uniform vec3 uOutlineColor;

varying vec3 vNormal;
varying vec2 vUv;
varying vec2 vHighPrecisionZW;
varying vec4 vRandom;
varying float vProgress;
flat varying float vIndex;

void main() {
    vec2 uv = vUv;
    float steppedTime = floor(time * 6.0);

    // uv displacement
    uv.x += sin(uv.y * 25.0 + steppedTime * 2.0) * 0.004;

    // break up outlines
    float noise = texture2D(tNoise, vUv * 0.5 + vRandom.x + steppedTime * 0.02).r;
    noise = smoothstep(0.1, 0.3, noise);
    float outlineContribution = noise;

    // random light/dark color
    vec3 color = uColor1 * mix(1.65, 2.5, step(0.75, vRandom.z));

    // draw inner lines
    float lines = texture2D(tPetal, uv).r;
    lines = aastep(0.5, lines);
    color = mix(uOutlineColor, color, lines);

    gl_FragColor = vec4(color, fract(vIndex * 4.975645));
    gInfo = vec4(1.0 - (0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5), vec3(encodeNormalSpheremap(normalize(vNormal)), noise));
}

            ` ,
            depthTest: !1
        })
    }

    createMesh() {
        this.mesh = new CreateLeafMesh(this);
        this.mesh.name = "leaves"
        this.mesh.renderOrder = 1
        this.mesh.updateMatrixWorld()
        this.mesh.matrixAutoUpdate = !1
        this.base.scene.add(this.mesh);
    }

}

class CreateNeedlesMesh extends THREE.InstancedMesh {
    constructor(base) {
        super(base.geometry, base.material, base.options.count)
        this.base = base;
        this.renderer = this.base.base.renderer.webgl;
        this.isParticlesGPU = true
        this.name = "GPU Particles"
        this.particlesCount = base.options.count
        this.frustumCulled = false;
        const s = THREE.FloatType;
        const r = Math.max(2, this.base.base.utils.ceilPowerOfTwo(Math.sqrt(this.particlesCount)));
        this.rt1 = new THREE.WebGLMultipleRenderTargets(r, r, this.base.data.textures || 1, {
            wrapS: THREE.ClampToEdgeWrapping,
            wrapT: THREE.ClampToEdgeWrapping,
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat,
            type: s,
            depthBuffer: !1
        })
        this.rt2 = this.rt1.clone()
        this.rtCurrent = 0
        this.fsQuad = new FullScreenQuad(null)
        if (this.base.data.initialTextures && this.base.data.initialTextures.length > 0) {
            const uniforms = {};
            this.base.data.initialTextures.forEach((u, d) => {
                uniforms[`tTexture${d + 1}`] = {value: u}
            });
            const material = new THREE.ShaderMaterial({
                uniforms,
                vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
                `,
                fragmentShader: `
                varying vec2 vUv;
                #define outTex1 pc_fragColor
                uniform sampler2D tTexture1;
                layout(location = 1) out highp vec4 outTex2;
                uniform sampler2D tTexture2;
                void main() {
                    outTex1 = texture2D(tTexture1, vUv);
                    outTex2 = texture2D(tTexture2, vUv);
                }
                `
            })
            this.fsQuad.material = material;
            const c = this.renderer.autoClear
            const h = this.renderer.getRenderTarget();
            this.renderer.autoClear = !1
            this.renderer.setRenderTarget(this.rt1)
            this.fsQuad.render(this.renderer)
            this.renderer.setRenderTarget(this.rt2)
            this.fsQuad.render(this.renderer)
            this.renderer.autoClear = c
            this.renderer.setRenderTarget(h)
            material.dispose()
        }
        this.computationMaterial = this.base.data.material
        this.fsQuad.material = this.computationMaterial
        this.base.data.afterCompute && (this.afterCompute = this.base.data.afterCompute)
        this.base.data.autoCompute !== !1 && (this.onBeforeRender = this.compute.bind(this))
    }

    compute(renderer, scene, camera) {
        const r = this.computationMaterial.uniforms.uModelMatrix;
        const a = this.computationMaterial.uniforms.uViewMatrix;
        const o = this.computationMaterial.uniforms.uProjMatrix;
        r && r.value.copy(this.matrixWorld);
        a && a.value.copy(camera.matrixWorldInverse);
        o && o.value.copy(camera.projectionMatrix);
        const l = this.rtCurrent === 0 ? this.rt1 : this.rt2;
        const c = this.rtCurrent === 0 ? this.rt2 : this.rt1;
        this.rtCurrent = (this.rtCurrent + 1) % 2;
        for (let f = 0; f < c.texture.length; f++) {
            const A = this.computationMaterial.uniforms[`tTexture${f + 1}`];
            A && (A.value = c.texture[f])
        }
        const h = renderer.autoClear;
        renderer.autoClear = !1;
        const u = renderer.getRenderTarget();
        renderer.setRenderTarget(l)
        renderer.getClearColor(new THREE.Color);
        const d = renderer.getClearAlpha();
        renderer.setClearColor(new THREE.Color('#000000'), 0)
        renderer.clear(!0, !1, !1)
        this.fsQuad.render(renderer)
        renderer.autoClear = h
        renderer.setRenderTarget(u)
        renderer.setClearColor(new THREE.Color, d);
        for (let f = 0; f < l.texture.length; f++) {
            const A = this.material.uniforms[`tTexture${f + 1}`];
            A && (A.value = l.texture[f]);
            const g = this.material.uniforms[`tTexture${f + 1}Prev`];
            g && (g.value = c.texture[f])
        }
        this.afterCompute && this.afterCompute(renderer, scene, camera)
    }

    dispose() {
        let t;
        this.fsQuad.dispose();
        this.computationMaterial.dispose();
        this.rt1.dispose();
        this.rt2.dispose();
        (t = super.dispose) == null || t.call(this)
    }
}

class NeedlesCreate {
    constructor(base, t = {}) {
        this.base = base;
        this.options = {count: 20, ...t}
        this.init()
    }

    init() {
        const t = this.options.count;
        const n = Math.max(2, this.base.utils.ceilPowerOfTwo(Math.sqrt(t)))
        const s = new Float32Array(n * n * 4);
        for (let o = 0; o < t; o++) {
            s[o * 4 + 0] = Math.random() * 32 - 16
            s[o * 4 + 1] = Math.random() * 12 - 6
            s[o * 4 + 2] = -4 - Math.random() * 4
            s[o * 4 + 3] = Math.random();
        }
        this.dataTextureR = new THREE.DataTexture(s, n, n, THREE.RGBAFormat, THREE.FloatType);
        this.dataTextureR.needsUpdate = !0;
        this.dataTextureA = new THREE.DataTexture(new Float32Array(n * n * 4), n, n, THREE.RGBAFormat, THREE.FloatType);
        this.dataTextureA.needsUpdate = !0
        this.data = {
            textures: 2,
            initialTextures: [this.dataTextureR, this.dataTextureA],
            material: new THREE.ShaderMaterial({
                uniformsGroups: [this.base.UBO],
                uniforms: {
                    tTexture1: {value: null},
                    tTexture2: {value: null},
                    tVel: this.base.fluidSim.velUniform,
                    uViewMatrix: {value: new THREE.Matrix4},
                    uModelMatrix: {value: new THREE.Matrix4},
                    uProjMatrix: {value: new THREE.Matrix4}
                },
                vertexShader: `varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
`,
                fragmentShader: `
                #define outPos pc_fragColor
uniform sampler2D tTexture1;

layout(location = 1) out highp vec4 outVel;
uniform sampler2D tTexture2;

uniform mat4 uProjMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
uniform sampler2D tVel;

varying vec2 vUv;

uniform Global{ vec2 resolution;float time;float dtRatio; };
float treadmill(float p, float margin){ float n=fract((p+margin)/(2.0*margin));return n*2.0*margin-margin; }
vec2 treadmill(vec2 p, vec2 margin){ vec2 n=fract((p+margin)/(2.0*margin));return n*2.0*margin-margin; }
vec3 treadmill(vec3 p, vec3 margin){ vec3 n=fract((p+margin)/(2.0*margin));return n*2.0*margin-margin; }
vec4 treadmill(vec4 p, vec4 margin){ vec4 n=fract((p+margin)/(2.0*margin));return n*2.0*margin-margin; }

void main() {
    ivec2 uv = ivec2(gl_FragCoord.xy);
    vec4 currentPos = texelFetch(tTexture1, uv, 0);
    vec4 currentVel = texelFetch(tTexture2, uv, 0);

    // add some velocity so leaves fall
    currentVel.x += (sin(time * 0.2 + currentPos.w * 15.6547) + sign(currentPos.w - 0.5) * 2.0) * 0.00075 * dtRatio;
    currentVel.y -= 0.004 * mix(0.5, 0.8, fract(currentPos.w * 31.342)) * dtRatio;
    currentVel.z = 0.0;

    // add fluid sim interaction
    const float pushForce = 0.0035;
    vec4 wPos = uModelMatrix * vec4(currentPos.xyz, 1.0);
    vec4 vPos = uViewMatrix * wPos;
    vec4 posProjected = uProjMatrix * vPos;
    vec2 uvScreen = (posProjected.xy / posProjected.w + 1.0) * 0.5;
    vec2 vel = texture2D(tVel, uvScreen).xy;

    /*
    // since the camera is on -z, there's no need to calculate up and right vectors of camera
    vec3 up = vec3(uViewMatrix[0][1], uViewMatrix[1][1], uViewMatrix[2][1]);
    vec3 right = vec3(uViewMatrix[0][0], uViewMatrix[1][0], uViewMatrix[2][0]);
    vec3 disp = (right * vel.x + up * vel.y);
    */
    currentVel.xy += vel * pushForce * dtRatio;

    // store rotation in alpha
    currentVel.a += length(vel) * pushForce * 1.75 * dtRatio;

    // friction
    currentVel.xyz *= exp2(log2(0.9) * dtRatio);

    // add vel to position
    currentPos.xyz += currentVel.xyz * dtRatio;

    // treadmill position
    currentPos.xy = treadmill(currentPos.xy, vec2(16.0, 6.0));

    outVel = currentVel;
    outPos = currentPos;
}

                `
            })
        }
        this.createGeometry();
        this.createMaterial();
        this.createMesh();
    }

    createGeometry() {
        const clone = this.base.needle.clone();
        this.geometry = new THREE.InstancedBufferGeometry()
        this.geometry.instanceCount = this.options.count;
        clone.index && this.geometry.setIndex(clone.index);
        for (const h in clone.attributes) {
            this.geometry.setAttribute(h, clone.attributes[h])
        }
        const s = []
        const r = []
        const a = Math.max(2, this.base.utils.ceilPowerOfTwo(Math.sqrt(this.options.count)))
        const o = 1 / a * .5;
        for (let c = 0; c < this.options.count; c++) {
            s.push(Math.random(), Math.random(), Math.random(), Math.random());
            const h = c % a / a + o
            const u = Math.floor(c / a) / a + o;
            r.push(h, u)
        }
        this.geometry.setAttribute("rand", new THREE.InstancedBufferAttribute(new Float32Array(s), 4))
        this.geometry.setAttribute("texuv", new THREE.InstancedBufferAttribute(new Float32Array(r), 2))
    }

    createMaterial() {
        this.material = new THREE.ShaderMaterial({
            uniformsGroups: [this.base.UBO],
            uniforms: {
                tTexture1: {value: null},
                tTexture2: {value: this.dataTextureA},
                uCount: {value: this.options.count},
                uColor1: {value: new THREE.Color("#cda05e")},
                uColor2: {value: new THREE.Color("#ab8349")},
                uOutlineColor: {value: new THREE.Color("#904619")},
                tPetal: {value: this.base.petalTexture},
                tNoise: {value: this.base.noiseSimplexLayeredTexture}
            },
            vertexShader: `
            uniform Global{vec2 resolution;float time;float dtRatio;};

uniform float uCount;

attribute vec4 rand;
attribute vec2 texuv;
uniform sampler2D tTexture1;
uniform sampler2D tTexture2;

varying vec2 vUv;
varying vec2 vHighPrecisionZW;
varying vec3 vNormal;
varying vec4 vRandom;
varying float vProgress;
flat varying float vIndex;

mat2 rotateAngle(float a) {
    float s = sin(a);
    float c = cos(a);
    mat2 m = mat2(c, s, -s, c);
    return m;
}

const float PI = 3.14159;
const float HALF_PI = PI * 0.5;
const float TWO_PI = PI * 2.0;

void main() {
    float index = float(gl_InstanceID);
    vIndex = index;

    vUv = uv;
    vRandom = rand;

    vec3 pos = position;
    pos *= mix(0.85, 1.15, step(rand.x, 0.5));

    // rotation value from fluid sim
    float interactionRotation = texture2D(tTexture2, texuv).a * 5.0;

    // curl upwards
    // mat2 rot = rotateAngle(0.25 * sin(uv.y * 3.5 + time + rand.z * 12.0 + rand.y + rand.x + interactionRotation * 3.0) + 0.2 * (1.0 - pow(1.0 - position.z, 2.0)));
    // pos.yz = rot * pos.yz;

    // random rotation angle
    mat2 rot0 = rotateAngle(time * mix(0.5, 1.25, rand.z) + rand.z * 3.14 * 2.0);
    mat2 rot1 = rotateAngle((rand.y + rand.z + rand.x) * 3.14 * 2.0 + interactionRotation);
    mat2 rot2 = rotateAngle(rand.x * 3.14 * 2.0);
    pos.xy = rot0 * pos.xy;
    pos.zx = rot1 * pos.zx;
    pos.yz = rot2 * pos.yz;

    vec3 norm = normal;
    norm.xy = rot0 * norm.xy;
    norm.zx = rot1 * norm.zx;
    norm.yz = rot2 * norm.yz;
    vNormal = normalize(normalMatrix * norm);

    vec3 offset = texture2D(tTexture1, texuv).xyz;

    pos += offset;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    vHighPrecisionZW = gl_Position.zw;
}

            `,
            fragmentShader: `
            
            layout(location = 1) out highp vec4 gInfo;

uniform Global{ vec2 resolution;float time;float dtRatio; };
float aastep(float threshold, float value){ float afwidth=length(vec2(dFdx(value), dFdy(value)))*0.70710678118654757;return smoothstep(threshold-afwidth, threshold+afwidth, value); }
vec2 encodeNormal(vec3 n){ n/=(abs(n.x)+abs(n.y)+abs(n.z));return (n.z>=0.0)? n.xy :(1.0-abs(n.yx))*sign(n.xy); }
vec3 decodeNormal(vec2 f){ vec3 n=vec3(f, 1.0-abs(f.x)-abs(f.y));float t=max(-n.z, 0.0);n.x+=(n.x>0.0)?-t : t;n.y+=(n.y>0.0)?-t : t;return normalize(n); }
vec2 encodeNormalUint8(vec3 n){ return encodeNormal(n)*0.5+0.5; }
vec3 deodeNormalUint8(vec2 n){ return decodeNormal(n*2.0-1.0); }
vec2 encodeNormalSpheremap(vec3 n){ float f=sqrt(8.0*n.z+8.0);return n.xy/f*2.0; }
vec3 decodeNormalSpheremap(vec2 n){ vec4 nn=vec4(n.xy, 1.0, -1.0);float l=dot(nn.xyz, -nn.xyw);nn.z=l;nn.xy*=sqrt(l);return nn.xyz*2.0+vec3(0.0, 0.0, -1.0); }
vec2 encodeNormalSpheremapUint8(vec3 n){ return encodeNormalSpheremap(n)*0.5+0.5; }
vec3 deodeNormalSimpleUint8(vec2 n){ return decodeNormalSpheremap(n*2.0-1.0); }

uniform sampler2D tPetal;
uniform sampler2D tNoise;

uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uOutlineColor;

varying vec3 vNormal;
varying vec2 vUv;
varying vec2 vHighPrecisionZW;
varying vec4 vRandom;
varying float vProgress;
flat varying float vIndex;

void main() {
    vec2 uv = vUv;
    float steppedTime = floor(time * 6.0);

    // uv displacement
    uv.x += sin(uv.y * 25.0 + steppedTime * 2.0) * 0.004;

    // break up outlines
    float noise = texture2D(tNoise, vUv * 0.5 + vRandom.x + steppedTime * 0.02).r;
    noise = smoothstep(0.1, 0.2, noise);
    float outlineContribution = noise;

    // random light/dark color
    vec3 color = mix(uColor1, uColor2, step(0.75, vRandom.z));

    // draw inner lines
    float lines = texture2D(tPetal, uv).r;
    lines = aastep(0.5, lines);
    color = mix(uOutlineColor, color, lines);

    gl_FragColor = vec4(color, fract(vIndex * 4.975645));
    gInfo = vec4(1.0 - (0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5), vec3(encodeNormalSpheremap(normalize(vNormal)), noise));
}
            
            `,
            depthTest: !1
        })
    }

    createMesh() {
        this.mesh = new CreateNeedlesMesh(this);
        this.mesh.name = "needles"
        this.mesh.renderOrder = 1
        this.mesh.updateMatrixWorld()
        this.mesh.matrixAutoUpdate = !1
        this.mesh.frustumCulled = !1
        this.base.scene.add(this.mesh);
    }
}



class CreateForegroundLeavesMesh extends THREE.InstancedMesh {
    constructor(base) {
        super(base.geometry, base.material, base.options.count)
        this.base = base;
        this.renderer = this.base.base.renderer.webgl;
        this.isParticlesGPU = true
        this.name = "GPU Particles"
        this.particlesCount = base.options.count
        this.frustumCulled = false;
        const s = THREE.FloatType;
        const r = Math.max(2, this.base.base.utils.ceilPowerOfTwo(Math.sqrt(this.particlesCount)));
        this.rt1 = new THREE.WebGLMultipleRenderTargets(r, r, this.base.data.textures || 1, {
            wrapS: THREE.ClampToEdgeWrapping,
            wrapT: THREE.ClampToEdgeWrapping,
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat,
            type: s,
            depthBuffer: !1
        })
        this.rt2 = this.rt1.clone()
        this.rtCurrent = 0
        this.fsQuad = new FullScreenQuad(null)
        if (this.base.data.initialTextures && this.base.data.initialTextures.length > 0) {
            const uniforms = {};
            this.base.data.initialTextures.forEach((u, d) => {
                uniforms[`tTexture${d + 1}`] = {value: u}
            });
            const material = new THREE.ShaderMaterial({
                uniforms,
                vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
                `,
                fragmentShader: `
                varying vec2 vUv;
                #define outTex1 pc_fragColor
                uniform sampler2D tTexture1;
                layout(location = 1) out highp vec4 outTex2;
                uniform sampler2D tTexture2;
                void main() {
                    outTex1 = texture2D(tTexture1, vUv);
                    outTex2 = texture2D(tTexture2, vUv);
                }
                `
            })
            this.fsQuad.material = material;
            const c = this.renderer.autoClear
            const h = this.renderer.getRenderTarget();
            this.renderer.autoClear = !1
            this.renderer.setRenderTarget(this.rt1)
            this.fsQuad.render(this.renderer)
            this.renderer.setRenderTarget(this.rt2)
            this.fsQuad.render(this.renderer)
            this.renderer.autoClear = c
            this.renderer.setRenderTarget(h)
            material.dispose()
        }
        this.computationMaterial = this.base.data.material
        this.fsQuad.material = this.computationMaterial
        this.base.data.afterCompute && (this.afterCompute = this.base.data.afterCompute)
        this.base.data.autoCompute !== !1 && (this.onBeforeRender = this.compute.bind(this))
    }

    compute(renderer, scene, camera) {
        const r = this.computationMaterial.uniforms.uModelMatrix;
        const a = this.computationMaterial.uniforms.uViewMatrix;
        const o = this.computationMaterial.uniforms.uProjMatrix;
        r && r.value.copy(this.matrixWorld);
        a && a.value.copy(camera.matrixWorldInverse);
        o && o.value.copy(camera.projectionMatrix);
        const l = this.rtCurrent === 0 ? this.rt1 : this.rt2;
        const c = this.rtCurrent === 0 ? this.rt2 : this.rt1;
        this.rtCurrent = (this.rtCurrent + 1) % 2;
        for (let f = 0; f < c.texture.length; f++) {
            const A = this.computationMaterial.uniforms[`tTexture${f + 1}`];
            A && (A.value = c.texture[f])
        }
        const h = renderer.autoClear;
        renderer.autoClear = !1;
        const u = renderer.getRenderTarget();
        renderer.setRenderTarget(l)
        renderer.getClearColor(new THREE.Color);
        const d = renderer.getClearAlpha();
        renderer.setClearColor(new THREE.Color('#000000'), 0)
        renderer.clear(!0, !1, !1)
        this.fsQuad.render(renderer)
        renderer.autoClear = h
        renderer.setRenderTarget(u)
        renderer.setClearColor(new THREE.Color, d);
        for (let f = 0; f < l.texture.length; f++) {
            const A = this.material.uniforms[`tTexture${f + 1}`];
            A && (A.value = l.texture[f]);
            const g = this.material.uniforms[`tTexture${f + 1}Prev`];
            g && (g.value = c.texture[f])
        }
        this.afterCompute && this.afterCompute(renderer, scene, camera)
    }

    dispose() {
        let t;
        this.fsQuad.dispose();
        this.computationMaterial.dispose();
        this.rt1.dispose();
        this.rt2.dispose();
        (t = super.dispose) == null || t.call(this)
    }
}

class ForegroundLeavesCreate {
    constructor(base, t = {}) {
        this.base = base;
        this.options = {count: 140, ...t}
        this.init()
    }

    init() {
        const t = this.options.count
        const n = Math.max(2, this.base.utils.ceilPowerOfTwo(Math.sqrt(t)))
        const s = new Float32Array(n * n * 4);
        for (let o = 0; o < t; o++) {
            s[o * 4 + 0] = Math.random() * 10 - 5
            s[o * 4 + 1] = Math.random() * 12 - 6
            s[o * 4 + 2] = .75 + Math.random()
            s[o * 4 + 3] = Math.random();
        }
        this.dataTextureR = new THREE.DataTexture(s, n, n, THREE.RGBAFormat, THREE.FloatType);
        this.dataTextureR.needsUpdate = !0;
        this.dataTextureA = new THREE.DataTexture(new Float32Array(n * n * 4), n, n, THREE.RGBAFormat, THREE.FloatType);
        this.dataTextureA.needsUpdate = !0
        this.data = {
            textures: 2,
            initialTextures: [this.dataTextureR, this.dataTextureA],
            material: new THREE.ShaderMaterial({
                uniformsGroups: [this.base.UBO],
                uniforms: {
                    tTexture1: {value: null},
                    tTexture2: {value: null},
                    tVel: this.base.fluidSim.velUniform,
                    uViewMatrix: {value: new THREE.Matrix4},
                    uModelMatrix: {value: new THREE.Matrix4},
                    uProjMatrix: {value: new THREE.Matrix4}
                },
                vertexShader: `
                varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}

                `,
                fragmentShader: `
                #define outPos pc_fragColor
uniform sampler2D tTexture1;

layout(location = 1) out highp vec4 outVel;
uniform sampler2D tTexture2;

uniform mat4 uProjMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
uniform sampler2D tVel;

varying vec2 vUv;

uniform Global{ vec2 resolution;float time;float dtRatio; };
float treadmill(float p, float margin){ float n=fract((p+margin)/(2.0*margin));return n*2.0*margin-margin; }
vec2 treadmill(vec2 p, vec2 margin){ vec2 n=fract((p+margin)/(2.0*margin));return n*2.0*margin-margin; }
vec3 treadmill(vec3 p, vec3 margin){ vec3 n=fract((p+margin)/(2.0*margin));return n*2.0*margin-margin; }
vec4 treadmill(vec4 p, vec4 margin){ vec4 n=fract((p+margin)/(2.0*margin));return n*2.0*margin-margin; }

void main() {
    ivec2 uv = ivec2(gl_FragCoord.xy);
    vec4 currentPos = texelFetch(tTexture1, uv, 0);
    vec4 currentVel = texelFetch(tTexture2, uv, 0);

    // add some velocity so leaves fall
    currentVel.x += (sin(time * 0.2 + currentPos.w * 12.8947) + sign(currentPos.w - 0.5)) * 0.00025 * dtRatio;
    currentVel.y -= 0.0005 * max(0.2, fract(currentPos.w * 31.342)) * dtRatio;
    currentVel.z = 0.0;

    // add fluid sim interaction
    const float pushForce = 0.001;
    vec4 wPos = uModelMatrix * vec4(currentPos.xyz, 1.0);
    vec4 vPos = uViewMatrix * wPos;
    vec4 posProjected = uProjMatrix * vPos;
    vec2 uvScreen = (posProjected.xy / posProjected.w + 1.0) * 0.5;
    vec2 vel = texture2D(tVel, uvScreen).xy;

    /*
    // since the camera is on -z, there's no need to calculate up and right vectors of camera
    vec3 up = vec3(uViewMatrix[0][1], uViewMatrix[1][1], uViewMatrix[2][1]);
    vec3 right = vec3(uViewMatrix[0][0], uViewMatrix[1][0], uViewMatrix[2][0]);
    vec3 disp = (right * vel.x + up * vel.y);
    */
    currentVel.xy += vel * pushForce * dtRatio;

    // store rotation in alpha
    currentVel.a += length(vel) * pushForce * 3.5 * dtRatio;

    // friction
    currentVel.xyz *= exp2(log2(0.9) * dtRatio);

    // add vel to position
    currentPos.xyz += currentVel.xyz * dtRatio;

    // treadmill position
    currentPos.xy = treadmill(currentPos.xy, vec2(5.0, 6.0));

    outVel = currentVel;
    outPos = currentPos;
}

                `
            })
        }
        this.createGeometry();
        this.createMaterial();
        this.createMesh();
    }

    createGeometry() {
        const clone = this.base.leaf.clone();
        this.geometry = new THREE.InstancedBufferGeometry()
        this.geometry.instanceCount = this.options.count;
        clone.index && this.geometry.setIndex(clone.index);
        for (const h in clone.attributes) {
            this.geometry.setAttribute(h, clone.attributes[h])
        }
        const s = []
        const r = []
        const a = Math.max(2, this.base.utils.ceilPowerOfTwo(Math.sqrt(this.options.count)))
        const o = 1 / a * .5;
        for (let c = 0; c < this.options.count; c++) {
            s.push(Math.random(), Math.random(), Math.random(), Math.random());
            const h = c % a / a + o
            const u = Math.floor(c / a) / a + o;
            r.push(h, u)
        }
        this.geometry.setAttribute("rand", new THREE.InstancedBufferAttribute(new Float32Array(s), 4))
        this.geometry.setAttribute("texuv", new THREE.InstancedBufferAttribute(new Float32Array(r), 2))
    }

    createMaterial() {
        this.material = new THREE.ShaderMaterial({
            uniformsGroups: [this.base.UBO],
            uniforms: {
                tTexture1: {value: null},
                tTexture2: {value: this.dataTextureA},
                uCount: {value: this.options.count},
                uColor1: {value: new THREE.Color("#886a3d")},
                uOutlineColor: {value: new THREE.Color("#904619")},
                tPetal: {value: this.base.leafTexture},
                tNoise: {value: this.base.noiseSimplexLayeredTexture}
            },
            vertexShader: `
            uniform Global{ vec2 resolution;float time;float dtRatio; };

uniform float uCount;

attribute vec4 rand;
attribute vec2 texuv;
uniform sampler2D tTexture1;
uniform sampler2D tTexture2;

varying vec2 vUv;
varying vec2 vHighPrecisionZW;
varying vec3 vNormal;
varying vec4 vRandom;
varying float vProgress;
flat varying float vIndex;

mat2 rotateAngle(float a) {
    float s = sin(a);
    float c = cos(a);
    mat2 m = mat2(c, s, -s, c);
    return m;
}

const float PI = 3.14159;
const float HALF_PI = PI * 0.5;
const float TWO_PI = PI * 2.0;

void main() {
    float index = float(gl_InstanceID);
    vIndex = index;

    vUv = uv;
    vRandom = rand;

    vec3 pos = position;
    pos *= mix(0.3, 0.6, step(rand.x, 0.5));

    // rotation value from fluid sim
    float interactionRotation = texture2D(tTexture2, texuv).a * 5.0;

    // curl upwards
    mat2 rot = rotateAngle(0.25 * sin(uv.y * 3.5 + time + rand.z * 12.0 + rand.y + rand.x + interactionRotation * 3.0) + 0.2 * (1.0 - pow(1.0 - position.z, 2.0)));
    pos.yz = rot * pos.yz;

    // random rotation angle
    mat2 rot0 = rotateAngle(time * mix(0.25, 0.75, rand.z) + rand.z * 3.14 * 2.0);
    mat2 rot1 = rotateAngle((rand.y + rand.z + rand.x) * 3.14 * 2.0 + interactionRotation);
    mat2 rot2 = rotateAngle(rand.x * 3.14 * 2.0);
    pos.xy = rot0 * pos.xy;
    pos.zx = rot1 * pos.zx;
    pos.yz = rot2 * pos.yz;

    vec3 norm = normal;
    norm.xy = rot0 * norm.xy;
    norm.zx = rot1 * norm.zx;
    norm.yz = rot2 * norm.yz;
    vNormal = normalize(normalMatrix * norm);

    vec3 offset = texture2D(tTexture1, texuv).xyz;

    pos += offset;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    vHighPrecisionZW = gl_Position.zw;
}

            `,
            fragmentShader: `
            layout(location = 1) out highp vec4 gInfo;

uniform Global{ vec2 resolution;float time;float dtRatio; };
float aastep(float threshold, float value){ float afwidth=length(vec2(dFdx(value), dFdy(value)))*0.70710678118654757;return smoothstep(threshold-afwidth, threshold+afwidth, value); }
vec2 encodeNormal(vec3 n){ n/=(abs(n.x)+abs(n.y)+abs(n.z));return (n.z>=0.0)? n.xy :(1.0-abs(n.yx))*sign(n.xy); }vec3 decodeNormal(vec2 f){ vec3 n=vec3(f, 1.0-abs(f.x)-abs(f.y));float t=max(-n.z, 0.0);n.x+=(n.x>0.0)?-t : t;n.y+=(n.y>0.0)?-t : t;return normalize(n); }vec2 encodeNormalUint8(vec3 n){ return encodeNormal(n)*0.5+0.5; }vec3 deodeNormalUint8(vec2 n){ return decodeNormal(n*2.0-1.0); }vec2 encodeNormalSpheremap(vec3 n){ float f=sqrt(8.0*n.z+8.0);return n.xy/f*2.0; }vec3 decodeNormalSpheremap(vec2 n){ vec4 nn=vec4(n.xy, 1.0, -1.0);float l=dot(nn.xyz, -nn.xyw);nn.z=l;nn.xy*=sqrt(l);return nn.xyz*2.0+vec3(0.0, 0.0, -1.0); }vec2 encodeNormalSpheremapUint8(vec3 n){ return encodeNormalSpheremap(n)*0.5+0.5; }vec3 deodeNormalSimpleUint8(vec2 n){ return decodeNormalSpheremap(n*2.0-1.0); }

uniform sampler2D tPetal;
uniform sampler2D tNoise;

uniform vec3 uColor1;
uniform vec3 uOutlineColor;

varying vec3 vNormal;
varying vec2 vUv;
varying vec2 vHighPrecisionZW;
varying vec4 vRandom;
varying float vProgress;
flat varying float vIndex;

void main() {
    vec2 uv = vUv;
    float steppedTime = floor(time * 6.0);

    // uv displacement
    uv.x += sin(uv.y * 25.0 + steppedTime * 2.0) * 0.004;

    // break up outlines
    float noise = texture2D(tNoise, vUv * 0.25 + vRandom.x + steppedTime * 0.02).r;
    noise = smoothstep(0.0, 0.1, noise);
    float outlineContribution = noise;

    // random light/dark color
    vec3 color = uColor1 * mix(1.65, 2.5, step(0.75, vRandom.z));

    // draw inner lines
    float lines = texture2D(tPetal, uv).r;
    lines = aastep(0.5, lines);
    color = mix(uOutlineColor, color, lines);

    gl_FragColor = vec4(color, fract(vIndex * 2.865454));

    gInfo = vec4(1.0 - (0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5), vec3(encodeNormalSpheremap(normalize(vNormal)), noise));
}

            `,
            depthTest: !1
        })
    }

    createMesh() {
        this.mesh = new CreateForegroundLeavesMesh(this);
        this.mesh.name = "foreground leaves"
        this.mesh.renderOrder = 4
        this.mesh.updateMatrixWorld()
        this.mesh.matrixAutoUpdate = !1
        this.mesh.frustumCulled = !1
        this.base.scene.add(this.mesh)
    }
}

class BackgroundCreate {
    constructor(base, t = {}) {
        this.base = base;
        this.option = {...t}
        this.init()
    }

    init() {
        const geometry = new THREE.PlaneGeometry(20, 20, 2, 2)
        const material = new THREE.ShaderMaterial({
            uniformsGroups: [this.base.UBO],
            uniforms: {
                uColor1: {value: new THREE.Color("#ffec95")},
                uColor2: {value: new THREE.Color("#ecc168")},
                tNoise: {value: this.base.noiseSimplexLayeredTexture}
            },
            vertexShader: `
            uniform Global{ vec2 resolution;float time;float dtRatio; };
varying vec2 vUv;

void main() {
    vUv = uv;
    vec3 pos = position;

    gl_Position = vec4(pos, 1.0);
}

            `,
            fragmentShader: `
            layout(location = 1) out highp vec4 gInfo;

uniform Global{ vec2 resolution;float time;float dtRatio; };
float aastep(float threshold, float value){ float afwidth=length(vec2(dFdx(value), dFdy(value)))*0.70710678118654757;return smoothstep(threshold-afwidth, threshold+afwidth, value); }

uniform sampler2D tNoise;
uniform vec3 uColor1;
uniform vec3 uColor2;

varying vec2 vUv;

mat2 rotateAngle(float a) {
    float s = sin(a);
    float c = cos(a);
    mat2 m = mat2(c, s, -s, c);
    return m;
}

void main() {
    vec2 screenUv = gl_FragCoord.xy / resolution.xy;
    float aspect = resolution.x / resolution.y;
    screenUv.x *= aspect;

    // animated grunge
    float steppedTime = floor(time * 3.0) * 3.14159 * 1.53;
    screenUv = rotateAngle(steppedTime) * screenUv;
    float n1 = texture2D(tNoise, screenUv * 4.31).r;
    float n2 = texture2D(tNoise, -screenUv * 1.814).r;
    float n3 = texture2D(tNoise, screenUv * 5.714).r;
    float noise = n1 * n2 * n3;
    noise = aastep(0.00015, noise);
    vec3 color = mix(uColor2, uColor1, noise);

    // color = uColor1;

    gl_FragColor = vec4(color, 0.0);
    gInfo = vec4(0.0);
}

            `,
            depthTest: !1,
        })

        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.name = "background"
        this.mesh.renderOrder = 0
        this.mesh.updateMatrixWorld()
        this.mesh.matrixAutoUpdate = !1
        this.base.scene.add(this.mesh)
    }
}

class BorderCreate {
    constructor(base, t = {}) {
        this.base = base;
        this.options = {...t}
        this.init()
    }

    init() {
        const geometry = this.base.border;
        const t = this.base.border.attributes.position.array;
        for (let s = 0; s < t.length; s++) {
            t[s] = Math.round(t[s]);
        }
        const material = new THREE.ShaderMaterial({
            uniformsGroups: [this.base.UBO],
            uniforms: {
                uBorderSizePixels: {value: 64},
                uNotchSizePixels: {value: new THREE.Vector2(384, 103)},
                uColor1: {value: new THREE.Color("#ecc168")},
                uColor2: {value: new THREE.Color("#ffec95")},
                tNoise: {value: this.base.noiseSimplexLayeredTexture},
                uRes: {value: new THREE.Vector2(this.base.screen.width, this.base.screen.height)}
            },
            vertexShader: `
            uniform Global{ vec2 resolution;float time;float dtRatio; };

attribute vec3 inset;
attribute vec3 notch;

uniform float uBorderSizePixels;
uniform vec2 uNotchSizePixels;
uniform vec2 uRes;

varying vec2 vUv;

void main() {
    vUv = uv;
    vec3 pos = position;

    float aspect = uRes.x / uRes.y;
    vec2 borderDir = inset.xy;
    vec2 notchDir = notch.xy;
    borderDir /= uRes;
    notchDir /= uRes;

    // set border width in pixels
    pos.xy += borderDir * uBorderSizePixels;

    // add notch width in pixels
    pos.xy += notchDir * uNotchSizePixels;

    gl_Position = vec4(pos, 1.0);

}

            `,
            fragmentShader: `
            
            layout(location = 1) out highp vec4 gInfo;

uniform Global{ vec2 resolution;float time;float dtRatio; };
float aastep(float threshold, float value){ float afwidth=length(vec2(dFdx(value), dFdy(value)))*0.70710678118654757;return smoothstep(threshold-afwidth, threshold+afwidth, value); }

uniform sampler2D tNoise;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uThickness;

varying vec2 vUv;

mat2 rotateAngle(float a) {
    float s = sin(a);
    float c = cos(a);
    mat2 m = mat2(c, s, -s, c);
    return m;
}

void main() {
    vec2 screenUv = gl_FragCoord.xy / resolution.xy;
    float aspect = resolution.x / resolution.y;
    screenUv.x *= aspect;

    vec2 uv = screenUv;
    vec2 noiseUv = screenUv;

    float steppedTime = floor(time * 3.0) * 3.14159 * 0.2;
    noiseUv = rotateAngle(steppedTime) * noiseUv;

    // distort border slightly with noise
    float n0 = texture2D(tNoise, noiseUv).r;
    float gradient = smoothstep(0.0, 0.2, vUv.x + n0 * 0.1);
    if (gradient < 0.5) {
        discard;
    }

    vec3 color = uColor1;
    gl_FragColor = vec4(color, 0.87946);

    gInfo = vec4(1.0, vec3(0.0, 0.0, 1.0));
}

            `,
            depthTest: !1
        })
        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.name = "border"
        this.mesh.renderOrder = 2
        this.mesh.updateMatrixWorld()
        this.mesh.matrixAutoUpdate = !1
        this.resize({w: this.base.screen.width, h: this.base.screen.height})
        this.base.eventManage.on("resize", this.resize.bind(this))
        this.base.scene.add(this.mesh)

    }

    resize({w, h}) {
        this.mesh.material.uniforms.uRes.value.set(w, h)
    }
}


THREE.PerspectiveCamera.prototype.getViewSize = function (distance, out = new THREE.Vector2()) {
    const fovInRad = this.fov * Math.PI / 180;
    const height = 2 * Math.tan(fovInRad / 2) * distance;
    const width = height * this.aspect;
    out.set(width, height);
    return out;
};

const boundingSphere = new THREE.Sphere();
const boundingBox = new THREE.Box3();
let EventType, PerformanceMode;
// Event enums
EventType = {
    TOUCH_START: 1,
    TOUCH_MOVE: 2,
    TOUCH_END: 3,
    CLICK: 4
};

PerformanceMode = {
    BOUNDING_SPHERE: 1,
    BOUNDING_BOX: 2
};

class MeshInteractor {
    constructor(base, {
        meshes = [],
        camera = null,
        onHover = null,
        onTouch = null,
        onMove = null,
        onDrag = null,
        onClick = null,
        ctx = null,
        performant = false,
        performantMode = "bounding_sphere",
        finger = 0,
        interactWhileTouching = false,
        hoverCursor = false,
        grabCursor = false
    } = {}) {
        if (!camera) throw new Error("mesh interaction needs a camera");
        this.base = base;
        this._meshes = Array.isArray(meshes) ? meshes : [meshes];
        this._camera = camera;

        this._onHover = onHover;
        this._onTouch = onTouch;
        this._onMove = onMove;
        this._onDrag = onDrag;
        this._onClick = onClick;

        this._ctx = ctx;
        this._performant = performant;
        this._performantMode = PerformanceMode[performantMode.toUpperCase()];
        this._finger = finger;

        this._eventsID = this._finger === 0 ? "touch" : `touch${this._finger + 1}`;
        this._interactWhileTouching = interactWhileTouching;

        this._touchPressed = false;
        this._hoverCursor = hoverCursor;
        this._grabCursor = grabCursor && !hoverCursor;

        this._raycaster = new THREE.Raycaster();
        this._enabled = false;

        this.hovering = false;
        this.hoveringElement = -1;
        this.hoveringInstance = -1;

        this.touching = false;
        this.touchingElement = -1;
        this.touchingInstance = -1;

        this.dragging = false;
    }

    _castRay(input, eventType) {
        this._raycaster.setFromCamera(input.position11, this._camera);

        if (!this._performant) {
            const hits = this._raycaster.intersectObjects(this._meshes, false);
            this._checkIntersections(eventType, hits);
            return;
        }

        const hits = [];
        const isSphere = this._performantMode === PerformanceMode.BOUNDING_SPHERE;

        const shape = isSphere ? boundingSphere : boundingBox;
        const shapeType = isSphere ? "Sphere" : "Box";
        const shapeProp = `bounding${shapeType}`;
        const computeMethod = `computeBounding${shapeType}`;
        const intersectMethod = `intersects${shapeType}`;

        for (const mesh of this._meshes) {
            if (!mesh.isMesh && !mesh.isSpecialCaseemptyMesh) continue;
            if (!mesh.layers.test(this._raycaster.layers)) continue;

            const boundSource = mesh[shapeProp] !== undefined ? mesh : mesh.geometry;
            if (boundSource[shapeProp] == null) boundSource[computeMethod]();

            if (this._raycaster.ray[intersectMethod](shape.copy(boundSource[shapeProp]).applyMatrix4(mesh.matrixWorld))) {
                hits.push({object: mesh});
            }
        }

        this._checkIntersections(eventType, hits);
    }

    _performHover(hits = [], type = "hover_out", index = null, instance = -1) {
        this.hovering = type === "hover_in";
        this.hoveringElement = index;
        this.hoveringInstance = instance;

        this._callBack(this._onHover, type, hits);

        if (this._hoverCursor) {
            this.base.base.target.style.cursor = this.hovering ? "pointer" : "";
        }

        if (this._grabCursor && !this.dragging) {
            this.base.base.target.style.cursor = this.hovering ? "grab" : "";
        }
    }

    _performTouch(hits = [], type = "touch_end", index = null, instance = -1) {
        this.touching = type === "touch_start";
        this.touchingElement = index;
        this.touchingInstance = instance;

        this._callBack(this._onTouch, type, hits);

        if (this._grabCursor) {
            const fallback = this.hovering ? "grab" : "";
            this.base.base.target.style.cursor = this.touching ? "grabbing" : fallback;
        }
    }

    _checkIntersections(eventType, hits) {
        const isTouching = eventType === EventType.TOUCH_START || eventType === EventType.TOUCH_MOVE;
        const isClick = eventType === EventType.CLICK;

        if (hits.length > 0) {
            const mesh = hits[0].object;
            const meshIndex = this._meshes.indexOf(mesh);
            const instanceId = typeof hits[0].instanceId === "number" ? hits[0].instanceId : -1;

            if (isTouching) {
                if (this.hovering && (this.hoveringElement !== meshIndex || this.hoveringInstance !== instanceId)) {
                    this._performHover(); // hover_out
                }

                if (!this.hovering && (this._interactWhileTouching || !this._touchPressed)) {
                    this._performHover(hits, "hover_in", meshIndex, instanceId);
                }

                if (eventType === EventType.TOUCH_START) {
                    if (this.touching && (this.touchingElement !== meshIndex || this.touchingInstance !== instanceId)) {
                        this._performTouch();
                    }

                    if (!this.touching && (this._interactWhileTouching || !this._touchPressed)) {
                        this._performTouch(hits, "touch_start", meshIndex, instanceId);
                        this.dragging = true;
                    }
                } else {
                    this._callBack(this._onMove, "move", hits);
                }
            } else if (isClick) {
                this._callBack(this._onClick, "click", hits);
            }
        } else {
            if (this.hovering) this._performHover();
        }

        if (eventType === EventType.TOUCH_END) {
            if (this.hovering && this.base.base.inputManager.get(this._finger).currentInput === "touch") {
                this._performHover();
            }
            if (this.touching) this._performTouch();
            this.dragging = false;
        }

        if (eventType === EventType.TOUCH_MOVE && this.dragging) {
            this._callBack(this._onDrag, "drag", hits);
        }
    }

    _callBack(fn, type, hits) {
        if (!fn) return;
        fn.call(this._ctx, {
            action: type,
            finger: this._finger,
            interactions: hits,
            event: this.base.base.inputManager.get(this._finger)
        });
    }

    _onTouchStart(e) {
        this._castRay(e, EventType.TOUCH_START);
        this._touchPressed = true;
    }

    _onTouchMove(e) {
        this._castRay(e, EventType.TOUCH_MOVE);
    }

    _onTouchEnd(e) {
        this._touchPressed = false;
        this._castRay(e, EventType.TOUCH_END);
    }

    _onTouchClick(e) {
        this._castRay(e, EventType.CLICK);
    }

    enable() {
        if (this._enabled) return;
        this._enabled = true;

        if (this._onTouch || this._onHover || this._onDrag) {
            this.base.base.eventManage.on(`${this._eventsID}_start`, this._onTouchStart.bind(this));
            this.base.base.eventManage.on(`${this._eventsID}_end`, this._onTouchEnd.bind(this));
        }

        if (this._onHover || this._onMove || this._onDrag) {
            this.base.base.eventManage.on(`${this._eventsID}_move`, this._onTouchMove.bind(this));
        }

        if (this._onClick) {
            this.base.base.eventManage.on(`${this._eventsID}_click`, this._onTouchClick.bind(this));
        }

        this._onTouchMove(this.base.base.inputManager.get(this._finger));
    }

    disable() {
        if (!this._enabled) return;
        this._enabled = false;
        this._touchPressed = false;

        this.base.base.eventManage.off(`${this._eventsID}_start`, this._onTouchStart, this);
        this.base.base.eventManage.off(`${this._eventsID}_move`, this._onTouchMove, this);
        this.base.base.eventManage.off(`${this._eventsID}_end`, this._onTouchEnd, this);
        this.base.base.eventManage.off(`${this._eventsID}_click`, this._onTouchClick, this);

        this._checkIntersections(EventType.TOUCH_END, []);
    }

    dispose() {
        this.disable();
    }
}


class NotchCreate {
    constructor(base, t = {}) {
        this.base = base;
        this.imageAspect = 1
        this.options = {...t}
        this.init()
    }

    init() {
        const geometry = new THREE.PlaneGeometry();
        geometry.translate(-.5, .5, 0);
        const material = new THREE.ShaderMaterial({
            uniformsGroups: [this.base.UBO],
            uniforms: {
                uColor1: {value: new THREE.Color("#ecc168")},
                uColor2: {value: new THREE.Color("#9f4a16")},
                tNoise: {value: this.base.noiseSimplexLayeredTexture},
                tMap: {value: this.base.emailTexture}
            },
            depthTest: !1,
            vertexShader: `
            uniform Global{ vec2 resolution;float time;float dtRatio; };

varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

            `,
            fragmentShader: `
            layout(location = 1) out highp vec4 gInfo;

uniform Global{ vec2 resolution;float time;float dtRatio; };
float aastep(float threshold, float value){ float afwidth=length(vec2(dFdx(value), dFdy(value)))*0.70710678118654757;return smoothstep(threshold-afwidth, threshold+afwidth, value); }

uniform sampler2D tNoise;
uniform sampler2D tMap;
uniform vec3 uColor1;
uniform vec3 uColor2;

varying vec2 vUv;

mat2 rotateAngle(float a) {
    float s = sin(a);
    float c = cos(a);
    mat2 m = mat2(c, s, -s, c);
    return m;
}

void main() {
    // distort uvs slightly with noise
    vec2 uv = vUv;
    vec2 noiseUv = vUv * 0.5;
    float steppedTime = floor(time * 3.0) * 3.14159 * 0.2;
    noiseUv = rotateAngle(steppedTime) * noiseUv;
    float n0 = texture2D(tNoise, noiseUv).r;
    uv += n0 * 0.006;

    // scale
    uv -= 0.5;
    uv *= 1.2;
    uv += 0.5;

    // sample text
    float text = texture2D(tMap, uv).r;

    // remove edges so they don't overlap border
    // if (text < 0.6) discard;

    text = aastep(0.7, text);
    vec3 color = mix(uColor1, uColor2, text);

    gl_FragColor = vec4(color, 0.87946);
    gInfo = vec4(1.0, vec3(0.0, 0.0, 1.0));
}

            `
        })
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.renderOrder = 3
        this.base.scene.add(this.mesh)
        this.interaction = new MeshInteractor(this, {
            camera: this.base.scene.camera,
            meshes: [this.mesh],
            hoverCursor: !0,
            onHover: n => {
            },
            onClick: n => {
                window.location.href = "mailto:hi@abeto.co"
            }
        })
        this.imageAspect = material.uniforms.tMap.value.image.width / material.uniforms.tMap.value.image.height
        this.base.scene.beforeRenderCbs.push(this.positionMesh.bind(this))
        this.interaction.enable()
    }

    positionUI({
                   camera = null,
                   mesh = null,
                   x = 0,
                   y = 0,
                   width = 1,
                   height = 1,
                   distance = null,
                   billboardCamera = true
               } = {}) {
        const Bm = new THREE.Vector3();
        const $r = new THREE.Vector2();
        const l = distance || Bm.subVectors(camera.position, camera.target).length();
        camera.getViewSize(l, $r);
        const c = $r.y / this.base.screen.height;
        mesh.scale.set(width * c, height * c, 1);
        const h = x / this.base.screen.width
        const u = y / this.base.screen.height;
        mesh.position.copy(camera.position).add(Bm.set($r.x * -.5 + $r.x * h, $r.y * .5 - $r.y * u, -l).applyQuaternion(camera.quaternion))
        billboardCamera && mesh.quaternion.copy(camera.quaternion)
        mesh.updateMatrixWorld()
    }

    positionMesh() {
        const t = 200 / this.imageAspect
        const n = 11
        const s = 15;
        this.positionUI({
            camera: this.base.scene.camera,
            mesh: this.mesh,
            x: this.base.screen.width - n,
            y: this.base.screen.height - s,
            width: 200,
            height: t
        })
    }
}

class PlaneProjector {
    constructor(base, {camera: e = null, normal: t = new THREE.Vector3(0, 0, -1), constant: n = 0} = {}) {
        this.base = base;
        this.raycaster = new THREE.Raycaster();
        this._camera = e
        this._plane = new THREE.Plane(t, n)
        this.Ai = new THREE.Vector3();
        this.Im = new THREE.Vector3();
    }

    _unproject(e) {
        this.raycaster.setFromCamera(e, this._camera)
        this.raycaster.ray.intersectPlane(this._plane, this.Ai)
        return this.Ai
    }

    getTouchPositionOnPlane(e = 0) {
        return this._unproject(this.base.base.inputManager.get(e).position11)
    }

    getPointPositionOnPlane(e) {
        return this._unproject(e)
    }

    getPointPositionOnScreen(e) {
        this.Ai.copy(e)
        this.Ai.project(this._camera)
        this.Ai.set((this.Ai.x + 1) / 2 * this.base.base.screen.w, -(this.Ai.y - 1) / 2 * this.base.base.screen.h, this.Ai.z)
        return this.Ai
    }

    setPlaneFromPoint(e) {
        this.Ai.copy(this._camera.position).sub(e).normalize()
        this._plane.setFromNormalAndCoplanarPoint(this.Ai, e)
        return this
    }

    setPlaneFromCameraTarget() {
        return this.setPlaneFromPoint(this._camera.target)
    }

    setPlaneFromCameraTargetAndDistance(e) {
        this.Ai.copy(this._camera.position).sub(this._camera.target).normalize()
        this.Im.copy(this.Ai).negate().multiplyScalar(e).add(this._camera.position)
        this._plane.setFromNormalAndCoplanarPoint(this.Ai, this.Im)
        return this
    }

    setPlaneFromDirectionAndPoint(e, t) {
        this.Ai.copy(e).normalize()
        this._plane.setFromNormalAndCoplanarPoint(this.Ai, t)
        return this
    }

    setDefaultPlane() {
        this._plane.normal.set(0, 0, -1)
        this._plane.constant = 0
        return this
    }

    setCamera(e) {
        this._camera = e
        return this
    }

    unprojectFinger(e = 0) {
        return this.setPlaneFromCameraTarget().getTouchPositionOnPlane(e)
    }

    unprojectPoint(e) {
        return this.setPlaneFromCameraTarget().getPointPositionOnPlane(e)
    }

    unprojectDistance(e, t = 0) {
        return this.setPlaneFromCameraTargetAndDistance(e).getTouchPositionOnPlane(t)
    }

    project(e) {
        return this.getPointPositionOnScreen(e)
    }
}

class CustomLineMesh extends THREE.Mesh {
    constructor(base) {
        super(base.geometry, base.material);
        this.base = base;
        this.isMeshLine = !0
        this.linesCount = this.base.count;
        this.name = this.linesCount > 1 ? "Meshlines" : "Meshline"
        this.frustumCulled = !1;
        const renderTargetType = this.base.base.renderer.webgl.capabilities.floatRenderTarget ? THREE.FloatType : THREE.HalfFloatType;
        const size = this.base.base.utils.ceilPowerOfTwo(Math.max(2, this.base.points));
        this.rt1 = new THREE.WebGLMultipleRenderTargets(size, size, this.base.textureData.textures || 1, {
            wrapS: THREE.ClampToEdgeWrapping,
            wrapT: THREE.ClampToEdgeWrapping,
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat,
            type: renderTargetType,
            depthBuffer: !1
        });
        this.rt2 = this.rt1.clone();
        this.rtCurrent = 0;
        this.fsQuad = new FullScreenQuad(null)

        this.computationMaterial = this.base.textureData.material
        this.fsQuad.material = this.computationMaterial

        this.base.textureData.afterCompute && (this.afterCompute = this.base.textureData.afterCompute)
        this.base.textureData.autoCompute !== !1 && (this.onBeforeRender = this.compute.bind(this))
    }

    compute(renderer, scene, camera) {
        const t = this.base.base.renderer.webgl;
        const r = this.computationMaterial.uniforms.uModelMatrix
        const a = this.computationMaterial.uniforms.uViewMatrix
        const o = this.computationMaterial.uniforms.uProjMatrix;
        r && r.value.copy(this.matrixWorld)
        a && a.value.copy(camera.matrixWorldInverse)
        o && o.value.copy(camera.projectionMatrix);
        const l = this.rtCurrent === 0 ? this.rt1 : this.rt2
        const c = this.rtCurrent === 0 ? this.rt2 : this.rt1;
        this.rtCurrent = (this.rtCurrent + 1) % 2;
        for (let f = 0; f < c.texture.length; f++) {
            const A = this.computationMaterial.uniforms[`tTexture${f + 1}`];
            A && (A.value = c.texture[f])
        }
        const h = t.autoClear;
        t.autoClear = !1;
        const u = t.getRenderTarget();
        t.setRenderTarget(l)
        t.getClearColor(new THREE.Color());
        const d = t.getClearAlpha();
        t.setClearColor(new THREE.Color("#000000"), 0)
        t.clear(!0, !1, !1)
        this.fsQuad.render(t)
        t.autoClear = h
        t.setRenderTarget(u)
        t.setClearColor(new THREE.Color(), d);
        for (let f = 0; f < l.texture.length; f++) {
            const A = this.material.uniforms[`tTexture${f + 1}`];
            A && (A.value = l.texture[f]);
            const g = this.material.uniforms[`tTexture${f + 1}Prev`];
            g && (g.value = c.texture[f])
        }
        this.afterCompute && this.afterCompute(renderer, scene, camera)
    }

    dispose() {
        var t;
        this.fsQuad.dispose()
        this.computationMaterial.dispose()
        this.rt1.dispose()
        this.rt2.dispose()
        (t = super.dispose) == null || t.call(this)
    }
}

class LineCreate {
    constructor(base, t = {}) {
        this.base = base;
        this.options = {length: .5, ...t}
        this.count = 1;
        this.points = 16
        this.init()
    }

    init() {
        this.geometry = this.createPolylineGeometry({
            count: this.count,
            points: this.points,
            closed: false
        });
        this.material = new THREE.ShaderMaterial({
            defines: {SHAPE: 0},
            uniformsGroups: [this.base.UBO],
            uniforms: {
                lineWidth: {value: 0.1},
                uColor: {value: new THREE.Color("#ac5c36")},
                tTexture1: {value: null},
                tNoise: {value: this.base.noiseSimplexLayeredTexture}
            },
            vertexShader: `
            attribute float uvy;

uniform Global{vec2 resolution;float time;float dtRatio;};

uniform sampler2D tTexture1;
uniform float lineWidth;

varying vec2 vUv;
varying vec2 vHighPrecisionZW;

float parabola(float x,float k){return pow(4.0*x*(1.0-x),k);}float pcurve(float x,float a,float b){float k=pow(a+b,a+b)/(pow(a,a)*pow(b,b));return k*pow(x,a)*pow(1.0-x,b);}

float when_eq(float x, float y) {
    return 1.0 - abs(sign(x - y));
}

void main() {
    vUv = uv;

    vec3 current = texelFetch(tTexture1, ivec2(position.x, uvy), 0).xyz;
    vec3 previous = texelFetch(tTexture1, ivec2(position.y, uvy), 0).xyz;
    vec3 next = texelFetch(tTexture1, ivec2(position.z, uvy), 0).xyz;

    mat4 projViewModel = projectionMatrix * modelViewMatrix;
    vec4 currentProjected = projViewModel * vec4(current, 1.0);
    vec4 previousProjected = projViewModel * vec4(previous, 1.0);
    vec4 nextProjected = projViewModel * vec4(next, 1.0);

    vec2 aspectVec = vec2(resolution.x / resolution.y, 1.0);

    vec2 currentScreen = currentProjected.xy / currentProjected.w * aspectVec;
    vec2 previousScreen = previousProjected.xy / previousProjected.w * aspectVec;
    vec2 nextScreen = nextProjected.xy / nextProjected.w * aspectVec;

    vec2 dir1 = normalize(currentScreen - previousScreen);
    vec2 dir2 = normalize(nextScreen - currentScreen);
    vec2 dir = normalize(dir1 + dir2);

    dir = mix(dir, dir1, when_eq(position.x, position.z));
    dir = mix(dir, dir2, when_eq(position.x, position.y));

    vec2 normal = vec2(-dir.y, dir.x);
    normal.x /= aspectVec.x;
    float w = lineWidth;

    #if SHAPE == 1
    w *= uv.x;
    #elif SHAPE == 2
    w *= 1.0 - uv.x;
    #elif SHAPE == 3
    w *= parabola(uv.x, 1.0);
    #endif

    normal *= w;
    currentProjected.xy += normal * mix(1.0, -1.0, step(0.5, uv.y));

    gl_Position = currentProjected;
    vHighPrecisionZW = gl_Position.zw;
}

            `,
            fragmentShader: `
            layout(location = 1) out highp vec4 gInfo;

uniform Global{vec2 resolution;float time;float dtRatio;};
uniform vec3 uColor;
uniform sampler2D tNoise;

varying vec2 vUv;
varying vec2 vHighPrecisionZW;

void main() {
    vec3 color = uColor;

    float steppedTime = floor(time * 2.0);
    vec2 screenUV = gl_FragCoord.xy / resolution.xy;
    float noise = texture2D(tNoise, screenUV * 2.0 + steppedTime * 0.02).r * (1.0 - vUv.x);
    if (noise < 0.125) discard;

    gl_FragColor = vec4(color, 0.87946);
    gInfo = vec4(1.0, vec2(0.0), 0.0);
}

            `,
            depthTest: !1
        });
        this.textureData = {
            textures: 1,
            material: new THREE.ShaderMaterial({
                uniformsGroups: [this.base.UBO],
                uniforms: {
                    tTexture1: {value: null},
                    uMousePos: {value: new THREE.Vector3()},
                    uSnap: {value: 0},
                    uViewMatrix: {value: new THREE.Matrix4()},
                    uModelMatrix: {value: new THREE.Matrix4()},
                    uProjMatrix: {value: new THREE.Matrix4()}
                },
                vertexShader: `
                    void main() {
                        gl_Position = vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    #define outPos pc_fragColor

                    uniform sampler2D tTexture1;

                    uniform mat4 uProjMatrix;
                    uniform mat4 uViewMatrix;
                    uniform mat4 uModelMatrix;

                    uniform vec3 uMousePos;
                    uniform int uSnap;

                    uniform Global{vec2 resolution;float time;float dtRatio;};

                    void main() {
                        ivec2 uv = ivec2(gl_FragCoord.xy);
                        vec3 pos = texelFetch(tTexture1, uv, 0).xyz;

                        if (uv.x == 0) {
                            pos = uMousePos;
                        } else {
                            vec3 nextPos = texelFetch(tTexture1, uv - ivec2(1, 0), 0).xyz;
                            pos = mix(pos, nextPos, clamp(dtRatio, 0.0, 1.0));

                            if (uSnap == 1) pos = uMousePos;
                        }

                        outPos = vec4(pos, 1.0);
                    }
                `
            })
        }
        this.mesh = new CustomLineMesh(this);
        this.mesh.name = "line"
        this.mesh.renderOrder = 5
        this.mesh.updateMatrixWorld()
        this.mesh.matrixAutoUpdate = !1;
        const e = new THREE.Vector3()
        const t = new THREE.Vector3()
        let n = 0
        let s = !1;
        this.base.eventManage.once("touch_move", () => {
            s = !0
        })
        this.planeInteraction = new PlaneProjector(this)
        this.base.scene.beforeRenderCbs.push(() => {
            const r = this.mesh.computationMaterial.uniforms.uMousePos.value
            const a = this.planeInteraction.setCamera(this.base.scene.camera).unprojectFinger(0);
            r.lerp(a, this.base.utils.lerpCoefFPS(.3))
            n += t.subVectors(r, e).length()
            n *= this.base.utils.frictionFPS(.8)
            n = this.base.utils.clamp(n, 0, 1)
            e.copy(r)
            this.mesh.material.uniforms.lineWidth.value = 9 / this.base.screen.h * this.base.utils.fit(n, .01, .001, 1, 0)
            if (s) {
                this.mesh.computationMaterial.uniforms.uSnap.value = 1
                r.copy(a)
                s = !1
            } else {
                this.mesh.computationMaterial.uniforms.uSnap.value = 0
            }
        })
        this.base.scene.add(this.mesh)
    }

    createPolylineGeometry({points: pointCount, count: instanceCount, closed: isClosed}) {
        const isInstanced = instanceCount > 1;

        const vertexData = []; // 每个顶点存储：当前点、前一个点、后一个点索引（用于计算线段朝向等）
        for (let i = 0; i < pointCount; i++) {
            let prevIndex, nextIndex;

            if (isClosed) {
                // 闭合：环形处理
                prevIndex = i === 0 ? pointCount - 2 : i - 1;
                nextIndex = i === pointCount - 1 ? 1 : i + 1;
            } else {
                // 非闭合：边界保持静止
                prevIndex = i === 0 ? 0 : i - 1;
                nextIndex = i === pointCount - 1 ? pointCount - 1 : i + 1;
            }

            // 每个点复制两次（上/下边界），用于构造带宽度的线
            vertexData.push(i, prevIndex, nextIndex);
            vertexData.push(i, prevIndex, nextIndex);
        }

        const indexData = [];
        for (let i = 0; i < pointCount - 1; i++) {
            const base = i * 2;
            // 构造两个三角形，组成一个带状面片
            indexData.push(base, base + 1, base + 2);
            indexData.push(base + 2, base + 1, base + 3);
        }

        const uvData = [];
        for (let i = 0; i < pointCount; i++) {
            const u = i / (pointCount - 1);
            uvData.push(u, 0); // 下边界
            uvData.push(u, 1); // 上边界
        }

        const instanceUVY = [];
        if (isInstanced) {
            for (let i = 0; i < instanceCount; i++) instanceUVY.push(i); // 每个实例唯一标识
        } else {
            for (let i = 0; i < pointCount * 2; i++) instanceUVY.push(0); // 非实例：统一标识
        }

        const geometry = new (isInstanced ? THREE.InstancedBufferGeometry : THREE.BufferGeometry)(); // Ph = InstancedBufferGeometry，Gt = BufferGeometry
        if (isInstanced) geometry.instanceCount = instanceCount;

        geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(vertexData), 3)); // 实际是存储点索引信息（逻辑上的 position）
        geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvData), 2));
        geometry.setAttribute("uvy", new (isInstanced ? THREE.InstancedBufferAttribute : THREE.BufferAttribute)(new Float32Array(instanceUVY), 1));
        geometry.setIndex(indexData);

        return geometry;
    }

}


export {FluidSimCreate, FlowerCreate, LeavesCreate, NeedlesCreate, ForegroundLeavesCreate, BackgroundCreate, BorderCreate, NotchCreate, LineCreate}