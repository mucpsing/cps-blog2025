
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/+esm'
import {Pass} from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/Pass.js/+esm";
import {ShaderPass} from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/ShaderPass.js/+esm";
import {createNoise3D} from "https://cdn.jsdelivr.net/npm/simplex-noise@4.0.3/+esm";
const vert = `
uniform Global{vec2 resolution;float time;float dtRatio;};

varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
`

const frag = `
uniform Global{ vec2 resolution;float time;float dtRatio; };

uniform sampler2D tLogo;
uniform sampler2D tDiffuse;
uniform sampler2D tInfo;
uniform sampler2D tSim;

uniform float uCameraNear;
uniform float uCameraFar;

uniform vec2 uOutlineFade;
uniform float uOutlineThickness;
uniform vec3 uOutlineColor;
uniform float uOutlineScale;

uniform vec3 uInfoRange;
uniform vec3 uDepthRange;
uniform vec3 uNormalRange;
uniform float uSmoothMargin;
uniform float uInfoMinScale;

varying vec2 vUv;

float efit(float x, float a1, float a2, float b1, float b2){ return b1+((x-a1)*(b2-b1))/(a2-a1); }
float fit(float x, float a1, float a2, float b1, float b2){ return clamp(efit(x, a1, a2, b1, b2), min(b1, b2), max(b1, b2)); }
float fit01(float x, float a1, float a2){ return fit(x, 0.0, 1.0, a1, a2); }
float fit10(float x, float a1, float a2){ return fit(x, 1.0, 0.0, a1, a2); }
float fit11(float x, float a1, float a2){ return fit(x, -1.0, 1.0, a1, a2); }
vec3 efit(vec3 x, vec3 a1, vec3 a2, vec3 b1, vec3 b2){ return b1+((x-a1)*(b2-b1))/(a2-a1); }
vec3 fit(vec3 x, vec3 a1, vec3 a2, vec3 b1, vec3 b2){ return clamp(efit(x, a1, a2, b1, b2), min(b1, b2), max(b1, b2)); }
vec3 fit01(vec3 x, vec3 a1, vec3 a2){ return fit(x, vec3(0.0), vec3(1.0), a1, a2); }
vec3 fit10(vec3 x, vec3 a1, vec3 a2){ return fit(x, vec3(1.0), vec3(0.0), a1, a2); }
vec3 fit11(vec3 x, vec3 a1, vec3 a2){ return fit(x, vec3(-1.0), vec3(1.0), a1, a2); }
float getDepth(sampler2D depth, vec2 uv){ return texture(depth, uv).x; }
highp float linearizeDepthLog(highp float depth, highp float near, highp float far){ float d=pow(2.0, depth*log2(far+1.0))-1.0;float a=far/(far-near);float b=far*near/(near-far);return a+b/d; }
highp float perspectiveDepthToViewZ(highp float depth, highp float near, highp float far){ return (near*far)/((far-near)*depth-far); }
highp float orthographicDepthToViewZ(highp float depth, highp float near, highp float far){ return depth*(near-far)-near; }
float viewZToPerspectiveDepth(float viewZ, float near, float far){ return ((near+viewZ)*far)/((far-near)*viewZ); }
float viewZToOrthographicDepth(float viewZ, float near, float far){ return (viewZ+near)/(near-far); }
float getViewZ(float depth, float near, float far){
    float fragCoordZ=depth;
    #ifdef ORTHOGRAPHIC_CAMERA
    return orthographicDepthToViewZ(fragCoordZ, near, far);
    #else
    #ifdef LOGDEPTH
    fragCoordZ=linearizeDepthLog(fragCoordZ, near, far);
    #endif
    return perspectiveDepthToViewZ(fragCoordZ, near, far);
    #endif
}
float getViewZ(sampler2D depth, vec2 uv, float near, float far){ return getViewZ(getDepth(depth, uv), near, far); }
float getLinearDepth(float depth, float near, float far){
    float fragCoordZ=depth;
    #ifdef ORTHOGRAPHIC_CAMERA
    return fragCoordZ;
    #else
    #ifdef LOGDEPTH
    fragCoordZ=linearizeDepthLog(fragCoordZ, near, far);
    #endif
    float viewZ=perspectiveDepthToViewZ(fragCoordZ, near, far);return viewZToOrthographicDepth(viewZ, near, far);
    #endif
}
float getLinearDepth(sampler2D depth, vec2 uv, float near, float far){ return getLinearDepth(getDepth(depth, uv), near, far); }
vec3 getViewPosition(float depth, vec2 uv, float near, float far, mat4 projMat){
    float viewZ=getViewZ(depth, near, far);
    #ifdef LOGDEPTH
    float d=linearizeDepthLog(depth, near, far);
    #else
    float d=depth;
    #endif
    float clipW=projMat[2][3]*viewZ+projMat[3][3];vec4 clipPosition=vec4((vec3(uv, d)-0.5)*2.0, 1.0);clipPosition*=clipW;return (inverse(projMat)*clipPosition).xyz;
}
vec3 getViewPosition(sampler2D depth, vec2 uv, float near, float far, mat4 projMat){ return getViewPosition(getDepth(depth, uv), uv, near, far, projMat); }
vec3 getWorldPosition(float depth, vec2 uv, float near, float far, mat4 projMat, mat4 worldMat){ return (worldMat*vec4(getViewPosition(depth, uv, near, far, projMat), 1.0)).xyz; }
vec3 getWorldPosition(sampler2D depth, vec2 uv, float near, float far, mat4 projMat, mat4 worldMat){ return (worldMat*vec4(getViewPosition(getDepth(depth, uv), uv, near, far, projMat), 1.0)).xyz; }
vec3 getViewNormal(sampler2D depth, vec2 uv, float near, float far, mat4 projMat){ vec2 depthres=vec2(textureSize(depth, 0));ivec2 p=ivec2(uv*depthres);float c0=texelFetch(depth, p, 0).x;float l2=texelFetch(depth, p-ivec2(2, 0), 0).x;float l1=texelFetch(depth, p-ivec2(1, 0), 0).x;float r1=texelFetch(depth, p+ivec2(1, 0), 0).x;float r2=texelFetch(depth, p+ivec2(2, 0), 0).x;float b2=texelFetch(depth, p-ivec2(0, 2), 0).x;float b1=texelFetch(depth, p-ivec2(0, 1), 0).x;float t1=texelFetch(depth, p+ivec2(0, 1), 0).x;float t2=texelFetch(depth, p+ivec2(0, 2), 0).x;float dl=abs((2.0*l1-l2)-c0);float dr=abs((2.0*r1-r2)-c0);float db=abs((2.0*b1-b2)-c0);float dt=abs((2.0*t1-t2)-c0);vec3 ce=getViewPosition(c0, uv, near, far, projMat).xyz;vec3 dpdx=(dl<dr)? ce-getViewPosition(l1, (uv-vec2(1.0/depthres.x, 0.0)), near, far, projMat).xyz:-ce+getViewPosition(r1, (uv+vec2(1.0/depthres.x, 0.0)), near, far, projMat).xyz;vec3 dpdy=(db<dt)? ce-getViewPosition(b1, (uv-vec2(0.0, 1.0/depthres.y)), near, far, projMat).xyz:-ce+getViewPosition(t1, (uv+vec2(0.0, 1.0/depthres.y)), near, far, projMat).xyz;return normalize(cross(dpdx, dpdy)); }
vec3 getWorldNormal(sampler2D depth, vec2 uv, float near, float far, mat4 projMat, mat4 worldMat){ vec2 depthres=vec2(textureSize(depth, 0));ivec2 p=ivec2(uv*depthres);float c0=texelFetch(depth, p, 0).x;float l2=texelFetch(depth, p-ivec2(2, 0), 0).x;float l1=texelFetch(depth, p-ivec2(1, 0), 0).x;float r1=texelFetch(depth, p+ivec2(1, 0), 0).x;float r2=texelFetch(depth, p+ivec2(2, 0), 0).x;float b2=texelFetch(depth, p-ivec2(0, 2), 0).x;float b1=texelFetch(depth, p-ivec2(0, 1), 0).x;float t1=texelFetch(depth, p+ivec2(0, 1), 0).x;float t2=texelFetch(depth, p+ivec2(0, 2), 0).x;float dl=abs((2.0*l1-l2)-c0);float dr=abs((2.0*r1-r2)-c0);float db=abs((2.0*b1-b2)-c0);float dt=abs((2.0*t1-t2)-c0);vec3 ce=getWorldPosition(c0, uv, near, far, projMat, worldMat).xyz;vec3 dpdx=(dl<dr)? ce-getWorldPosition(l1, (uv-vec2(1.0/depthres.x, 0.0)), near, far, projMat, worldMat).xyz:-ce+getWorldPosition(r1, (uv+vec2(1.0/depthres.x, 0.0)), near, far, projMat, worldMat).xyz;vec3 dpdy=(db<dt)? ce-getWorldPosition(b1, (uv-vec2(0.0, 1.0/depthres.y)), near, far, projMat, worldMat).xyz:-ce+getWorldPosition(t1, (uv+vec2(0.0, 1.0/depthres.y)), near, far, projMat, worldMat).xyz;return normalize(cross(dpdx, dpdy)); }
vec2 encodeNormal(vec3 n){ n/=(abs(n.x)+abs(n.y)+abs(n.z));return (n.z>=0.0)? n.xy :(1.0-abs(n.yx))*sign(n.xy); }
vec3 decodeNormal(vec2 f){ vec3 n=vec3(f, 1.0-abs(f.x)-abs(f.y));float t=max(-n.z, 0.0);n.x+=(n.x>0.0)?-t : t;n.y+=(n.y>0.0)?-t : t;return normalize(n); }
vec2 encodeNormalUint8(vec3 n){ return encodeNormal(n)*0.5+0.5; }
vec3 deodeNormalUint8(vec2 n){ return decodeNormal(n*2.0-1.0); }
vec2 encodeNormalSpheremap(vec3 n){ float f=sqrt(8.0*n.z+8.0);return n.xy/f*2.0; }
vec3 decodeNormalSpheremap(vec2 n){ vec4 nn=vec4(n.xy, 1.0, -1.0);float l=dot(nn.xyz, -nn.xyw);nn.z=l;nn.xy*=sqrt(l);return nn.xyz*2.0+vec3(0.0, 0.0, -1.0); }
vec2 encodeNormalSpheremapUint8(vec3 n){ return encodeNormalSpheremap(n)*0.5+0.5; }
vec3 deodeNormalSimpleUint8(vec2 n){ return decodeNormalSpheremap(n*2.0-1.0); }
float outline(sampler2D tColor, sampler2D tInfo, vec2 uv, float outlineWidth, float scale, vec3 idRange, vec3 depthRange, vec3 normalRange, float rangeSmoothMargin, float idMinScale, vec2 distanceFadeRange){ vec2 offset=1.0/vec2(textureSize(tInfo, 0))*outlineWidth*scale;float contributions[5];float faceIds[5];float distances[5];vec3 normals[5];vec4 n=texture(tInfo, uv+offset*vec2(0, 0));contributions[0]=n.a;distances[0]=1.0-n.r;normals[0]=decodeNormalSpheremap(n.gb);faceIds[0]=texture(tColor, uv+offset*vec2(0, 0)).a;n=texture(tInfo, uv+offset*vec2(-1, 0));contributions[1]=n.a;distances[1]=1.0-n.r;normals[1]=decodeNormalSpheremap(n.gb);faceIds[1]=texture(tColor, uv+offset*vec2(-1, 0)).a;n=texture(tInfo, uv+offset*vec2(1, 0));contributions[2]=n.a;distances[2]=1.0-n.r;normals[2]=decodeNormalSpheremap(n.gb);faceIds[2]=texture(tColor, uv+offset*vec2(1, 0)).a;n=texture(tInfo, uv+offset*vec2(0, -1));contributions[3]=n.a;distances[3]=1.0-n.r;normals[3]=decodeNormalSpheremap(n.gb);faceIds[3]=texture(tColor, uv+offset*vec2(0, -1)).a;n=texture(tInfo, uv+offset*vec2(0, 1));contributions[4]=n.a;distances[4]=1.0-n.r;normals[4]=decodeNormalSpheremap(n.gb);faceIds[4]=texture(tColor, uv+offset*vec2(0, 1)).a;float centerId=faceIds[0];float centerDistance=distances[0];float centerContribution=contributions[0];vec3 centerNormal=normals[0];vec2 idVariation=vec2((faceIds[1]-centerId)-(faceIds[2]-centerId), (faceIds[3]-centerId)-(faceIds[4]-centerId));vec2 distanceVariation=vec2((distances[1]-centerDistance)-(distances[2]-centerDistance), (distances[3]-centerDistance)-(distances[4]-centerDistance));vec2 normalVariation=vec2(distance(normals[1], centerNormal)-distance(normals[2], centerNormal), distance(normals[3], centerNormal)-distance(normals[4], centerNormal));float idVariationTotal=sqrt((idVariation.x*idVariation.x)+(idVariation.y*idVariation.y));float distanceVariationTotal=sqrt((distanceVariation.x*distanceVariation.x)+(distanceVariation.y*distanceVariation.y));float normalVariationTotal=sqrt((normalVariation.x*normalVariation.x)+(normalVariation.y*normalVariation.y));float idContribution=fit(fit(idVariationTotal, idRange.x, idRange.y, 0.0, 1.0), idRange.z, idRange.z+rangeSmoothMargin, 0.0, 1.0);idContribution=mix(idContribution*idMinScale, idContribution, clamp(scale, 0.0, 1.0));float normalContribution=fit(fit(normalVariationTotal, normalRange.x, normalRange.y, 0.0, 1.0), normalRange.z, normalRange.z+rangeSmoothMargin, 0.0, 1.0);float depthLimit=depthRange.z+1.0-centerNormal.z;float depthContribution=fit(fit(distanceVariationTotal, depthRange.x, depthRange.y, 0.0, 1.0), depthLimit, depthLimit+rangeSmoothMargin, 0.0, 1.0);float minDistance=centerDistance;float minContrib=centerContribution;
    #pragma unroll_loop_start
    for (int i=1;i<5;i++){ if (distances[i]<minDistance){ minDistance=distances[i];minContrib=contributions[i]; } }
    #pragma unroll_loop_end
    if (minDistance<centerDistance){ if (minContrib>centerContribution)centerContribution=max(centerContribution, ceil(minContrib)); else centerContribution=min(centerContribution, floor(minContrib)); }centerContribution*=fit(-getViewZ(minDistance, uCameraNear, uCameraFar), distanceFadeRange.x, distanceFadeRange.y, 1.0, 0.0);return clamp(idContribution+normalContribution+depthContribution, 0.0, 1.0)*centerContribution;
}
float aastep(float threshold, float value){ float afwidth=length(vec2(dFdx(value), dFdy(value)))*0.70710678118654757;return smoothstep(threshold-afwidth, threshold+afwidth, value); }

uniform sampler2D tNoise;

uniform sampler2D tTransition;
uniform vec3 uBgColor;
uniform float uProgress1;
uniform float uProgress2;
uniform float uProgress3;
uniform float uProgress4;

mat2 rotateAngle(float a) {
    float s = sin(a);
    float c = cos(a);
    mat2 m = mat2(c, s, -s, c);
    return m;
}

vec3 hash32(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yxz+33.33);
    return fract((p3.xxy+p3.yzz)*p3.zyx);
}

void main() {
    vec2 uv = vUv;
    float aspect = resolution.x / resolution.y;

    // get scene color
    vec4 scene = texture2D(tDiffuse, uv);
    vec3 sceneColor = scene.rgb;

    // compensate outline with resolution
    float resScale = min(1.0, resolution.y / 1300.0) * uOutlineScale;

    float outlineValue = outline(tDiffuse, tInfo, vUv, uOutlineThickness, resScale, uInfoRange, uDepthRange, uNormalRange, uSmoothMargin, uInfoMinScale, uOutlineFade);
    sceneColor = mix(sceneColor, uOutlineColor, outlineValue);

    vec2 screenUv = gl_FragCoord.xy / resolution.xy;
    screenUv.x *= aspect;
    uv -= 0.5;
    uv.x *= aspect;
    uv *= 2.2;
    uv += 0.5;

    // add some noise distortion to text uvs
    vec2 noiseUv = screenUv * 3.5;
    float steppedTime = floor(time * 6.0) * 3.14159 * 0.2;
    noiseUv = rotateAngle(steppedTime) * noiseUv;
    vec2 n0 = texture2D(tNoise, noiseUv).rg;
    uv += n0 * 0.0035;

    // text
    float logo = texture2D(tLogo, uv).r;
    logo = aastep(0.5, logo);

    // begin transition
    vec2 transitionUv = vUv;

    // adjust transition uvs for mobile
    if (resolution.y > resolution.x) {
        transitionUv -= 0.5;
        transitionUv *= resolution / max(resolution.x, resolution.y);
        transitionUv += 0.5;
    }

    float transitionNoise = texture2D(tTransition, transitionUv).r;
    vec3 sceneSansText = sceneColor;
    vec3 outlineColor = mix(uBgColor, uOutlineColor, outlineValue);

    // superimpose text
    vec3 finalColor = mix(sceneColor, vec3(1.0), logo);

    // apply final scene color
    sceneColor = finalColor;

    // overwrite final scene color for intro transition
    if (uProgress4 < 1.0) {
        // transition phase 1
        float progress1 = uProgress1;
        sceneColor = mix(uBgColor, vec3(1.0), step(progress1, transitionNoise));

        // transition phase 2
        float progress2 = uProgress2;
        sceneColor = mix(outlineColor, sceneColor, step(progress2, transitionNoise));

        // transition phase 3
        float progress3 = uProgress3;
        sceneColor = mix(sceneSansText, sceneColor, step(progress3, transitionNoise));

        // transition phase 4
        float progress4 = uProgress4;
        sceneColor = mix(finalColor, sceneColor, step(progress4, transitionNoise));
    }

    // film grain
    vec3 noise = hash32(uv * 100.0 + steppedTime);
    noise *= 2.0;
    noise -= 1.0;
    sceneColor += noise * 0.075;

    // fluid debug
    // gl_FragColor = vec4(vec3(texture(tSim, vUv).rgb), 1.0);

    // outline debug
    // gl_FragColor = vec4(vec3(outlineValue), 1.0); // debug

    gl_FragColor = vec4(sceneColor, 1.0);
}
`


class AdaptiveDPRController {
    /**
     * 根据实时 FPS 自动调节 WebGL 的设备像素比（DPR）
     * **/
    constructor(target) {
        this.target = target; // 有 setDPRMultiplier 方法的对象（比如渲染器）
        this.startDelay = 2; // 启动前延迟秒数
        this.lowFPSThreshold = 30;
        this.highFPSThreshold = 60;
        this.minDPR = 0.6;
        this.maxDPR = 1;
        this.dprStep = 0.1;
        this.fpsSampleInterval = 4; // 每次采样的间隔秒数
        this.requiredSampleCount = 5; // 最少样本数量
        this.maxAdjustments = 4; // 最多调整次数

        this.samples = [];
        this.lastSampleTime = 0;
        this.currentDPR = 1;
        this.adjustmentCount = 0;
        this.lastAdjustmentDirection = 0; // -1降，1升，0无
        this.startTime = 0;

        this._onFPSUpdate = this._onFPSUpdate.bind(this);
    }

    get hasRun() {
        return this.lastSampleTime !== 0;
    }

    start() {
        this.stop();
        this.startTime = this.target.timeStats.time + this.startDelay;
        this.lastSampleTime = this.startTime;
        this.target.eventManage.on("webgl_average_fps_update", this._onFPSUpdate);
    }

    stop() {
        this.samples.length = 0;
        this.target.eventManage.off("webgl_average_fps_update", this._onFPSUpdate);
    }

    _onFPSUpdate(fps) {
        if (this.target.timeStats.time < this.startTime) return;

        this.samples.push(fps);

        const timeSinceLastSample = this.target.timeStats.time - this.lastSampleTime;
        if (timeSinceLastSample >= this.fpsSampleInterval && this.samples.length >= this.requiredSampleCount) {
            const averageFPS = this.samples.reduce((sum, f) => sum + f, 0) / this.samples.length;

            if (averageFPS < this.lowFPSThreshold && this.currentDPR > this.minDPR) {
                this.currentDPR = Math.max(this.minDPR, this.currentDPR - this.dprStep);
                this.target.initDPRMultiplier(this.currentDPR);
                if (this.lastAdjustmentDirection === 1) this.adjustmentCount++;
                this.lastAdjustmentDirection = -1;
            } else if (averageFPS >= this.highFPSThreshold && this.currentDPR < this.maxDPR) {
                this.currentDPR = Math.min(this.maxDPR, this.currentDPR + this.dprStep);
                this.target.initDPRMultiplier(this.currentDPR);
                if (this.lastAdjustmentDirection === -1) this.adjustmentCount++;
                this.lastAdjustmentDirection = 1;
            }

            this.samples.length = 0;
            this.lastSampleTime = this.target.timeStats.time;

            if (this.adjustmentCount >= this.maxAdjustments) {
                console.warn("Adaptive DPR stopped.");
                this.stop();
            }
        }
    }
}

class TimeStats {
    /**
     * 时间管理器
     * **/
    constructor() {
        this.TARGET_FPS = 60;
        this.BLEND_DURATION_SECONDS = 0.2;
        this.BLEND_FRAME_COUNT = this.TARGET_FPS * this.BLEND_DURATION_SECONDS;
        this.fpsSmoothingRatio = this.TARGET_FPS / this.BLEND_FRAME_COUNT;
        this.internalTime = 0;         // 当前时间（ms）
        this.frameDelta = 16;          // 帧间隔（ms）
        this.frameCount = 0;           // 当前帧编号
        this.smoothedFPS = 60;         // 平滑平均帧率
        this.recordedMaxFPS = 0;       // 最大帧率（记录用途）
    }

    get time() {
        return this.internalTime;
    }

    get delta() {
        return this.frameDelta;
    }

    get frame() {
        return this.frameCount;
    }

    get averageFPS() {
        return this.smoothedFPS;
    }

    get maxFPS() {
        return this.recordedMaxFPS;
    }

    get ratio() {
        // 返回当前帧时间占理想帧时间的比例（比如掉帧时就会 >1）
        return Math.min(this.fpsSmoothingRatio, this.frameDelta / (1000 / this.TARGET_FPS));
    }
}

class Utils {
    TWO_PI = Math.PI * 2
    HALF_PI = Math.PI * .5

    constructor(base) {
        this.base = base;
        this.timeStats = this.base.timeStats;
        this.math = THREE.MathUtils
        this.DEG2RAD = this.math.DEG2RAD
        this.RAD2DEG = this.math.RAD2DEG
        this.xm = this.base.gsap.parseEase();
    }

    degrees(i) {
        return this.math.radToDeg(i)
    }

    radians(i) {
        return this.math.degToRad(i)
    }

    clamp(i, e = 0, t = 1) {
        return this.math.clamp(i, e, t)
    }

    lerp(i, e, t) {
        return this.math.lerp(i, e, t)
    }

    mix(i, e, t) {
        return this.lerp(i, e, t)
    }

    deltaRatio() {
        return this.timeStats.ratio
    }

    lerpCoefFPS(i) {
        return this.damp(i, this.timeStats.ratio)
    }

    lerpFPS(i, e, t) {
        return this.lerp(i, e, this.lerpCoefFPS(t))
    }

    lerpFPSLimited(i, e, t, n = 1 / 0) {
        const s = this.lerpFPS(i, e, t), r = n * this.timeStats.ratio, a = this.clamp(s - i, -r, r);
        return i + a
    }

    damp(i, e) {
        return 1 - Math.exp(Math.log(1 - i) * e)
    }

    frictionFPS(i) {
        return this.friction(i, this.timeStats.ratio)
    }

    friction(i, e) {
        return Math.exp(Math.log(i) * e)
    }

    efit(i, e, t, n, s) {
        return this.math.mapLinear(i, e, t, n, s)
    }

    fit(i, e, t, n, s) {
        return this.efit(this.clamp(i, Math.min(e, t), Math.max(e, t)), e, t, n, s)
    }

    fit01(i, e, t) {
        return this.fit(i, 0, 1, e, t)
    }

    fit10(i, e, t) {
        return this.fit(i, 1, 0, e, t)
    }

    fit11(i, e, t) {
        return this.fit(i, -1, 1, e, t)
    }

    step(i, e) {
        return e < i ? 0 : 1
    }

    linearstep(i, e, t) {
        return this.clamp((t - i) / (e - i), 0, 1)
    }

    smoothstep(i, e, t) {
        return this.math.smoothstep(t, i, e)
    }

    smootherstep(i, e, t) {
        return this.math.smootherstep(t, i, e)
    }

    parabola(i, e) {
        return Math.pow(4 * i * (1 - i), e)
    }

    pcurve(i, e, t) {
        return Math.pow(e + t, e + t) / (Math.pow(e, e) * Math.pow(t, t)) * Math.pow(i, e) * Math.pow(1 - i, t)
    }

    ease(i, e = "linear") {
        return (this.xm[e] || this.xm.none)(i)
    }

    round(i, e = 0) {
        const t = Math.pow(10, e);
        return Math.round(i * t) / t
    }

    isPowerOfTwo(i) {
        return this.math.isPowerOfTwo(i)
    }

    ceilPowerOfTwo(i) {
        return this.math.ceilPowerOfTwo(i)
    }

    floorPowerOfTwo(i) {
        return this.math.floorPowerOfTwo(i)
    }

    makeAnglePositive(i) {
        const e = i % this.TWO_PI;
        return e < 0 ? this.TWO_PI + e : e
    }

    getShortestRotationAngle(i, e) {
        const t = this.makeAnglePositive(i);
        let n = this.makeAnglePositive(e);
        return Math.abs(n - t) > Math.PI && (n > t ? n -= this.TWO_PI : n += this.TWO_PI), i + n - t
    }

    latLonTo3D(i, e, t) {
        const n = this.HALF_PI - this.radians(i), s = this.radians(e);
        return {x: t * Math.sin(n) * Math.sin(s), y: t * Math.cos(n), z: t * Math.sin(n) * Math.cos(s)}
    }

    uid() {
        return this.math.generateUUID()
    }
}

class TouchTracker {
    constructor(base, fingerIndex = 0) {
        this.base = base.base;
        // 基本属性
        this.finger = fingerIndex; // 手指编号
        this.touchID = false;
        this.eventID = this.finger === 0 ? "touch" : `touch${fingerIndex + 1}`;
        this.currentInput = this.finger === 0 ? "mouse" : "touch";
        this.button = 0;
        this.touching = false;

        // 位置/位移向量
        this.position = new THREE.Vector2(this.base.screen.w * 0.5, this.base.screen.h * 0.5);      // 像素坐标
        this.position01 = new THREE.Vector2(0.5, 0.5); // 标准化 0~1
        this.position11 = new THREE.Vector2();        // 标准化 -1~1

        this.delta = new THREE.Vector2();      // 每帧的位移差值
        this.delta11 = new THREE.Vector2();    // 标准化差值

        this.dragged = new THREE.Vector2();    // 累计拖动量
        this.dragged11 = new THREE.Vector2();  // 累计标准化拖动量

        this.velocity = new THREE.Vector2();        // 当前移动速度（平滑值）
        this.swipeVelocity = new THREE.Vector2();  // 释放时的滑动速度

        // 前一帧位置缓存（做 delta 用）
        this.prevPixel = new THREE.Vector2();
        this.prev01 = new THREE.Vector2();

        this.dragOriginPixel = new THREE.Vector2();
        this.dragOrigin01 = new THREE.Vector2();

        this.lastTouchTime = 0;

        this._updateVelocity.bind(this)

        // 启动更新监听
        this.base.eventManage.on("webgl_prerender", this._updateVelocity.bind(this));
    }

    // ========= pointer 事件钩子 =========

    onTouchStart(event) {
        this.touching = true;
        this.lastTouchTime = this.base.timeStats.time;

        this._updatePosition(event);   // 更新位置
        this._storeLastPosition();     // 记录前一帧位置
        this._storeDragOrigin();       // 初始化拖动起点
        this._updateDrag();            // 重置拖动量

        this.base.eventManage.emit(`${this.eventID}_start`, this);
    }

    onTouchMove(event) {
        this._updatePosition(event);
        this._updateDelta();
        this.base.eventManage.emit(`${this.eventID}_move`, this);

        if (this.touching) {
            this._updateDrag();
            this.base.eventManage.emit(`${this.eventID}_drag`, this);
        }
    }

    onTouchEnd(event) {
        this._updatePosition(event);
        this._updateDelta();
        this._updateDrag();

        const wasTouching = this.touching;
        this.touching = false;

        if (!wasTouching) return;

        const dt = Math.max(0.001, this.base.timeStats.time - this.lastTouchTime);
        this.swipeVelocity.copy(this.dragged).divideScalar(dt);

        this.base.eventManage.emit(`${this.eventID}_end`, this);

        // 判断是否是点击事件（拖动距离 + 时间都很短）
        if (this.dragged.length() < 15 && dt < 0.5 && event.type !== "pointerout") {
            this.base.eventManage.emit(`${this.eventID}_click`, this);
        }
    }

    dispose() {
        this.base.eventManage.off("webgl_prerender", this._updateVelocity, this);
    }

    // ========= 私有更新逻辑 =========

    _updatePosition(e) {
        const x = e.offsetX;
        const y = e.offsetY;

        this.position.set(x, y);
        this.position01.set(x / this.base.screen.w, 1 - y / this.base.screen.h);
        this.position11.copy(this.position01).multiplyScalar(2).subScalar(1);

        this.currentInput = e.pointerType === "mouse" ? "mouse" : "touch";
        this.button = e.button;
    }

    _storeLastPosition() {
        this.prevPixel.copy(this.position);
        this.prev01.copy(this.position01);
    }

    _updateDelta() {
        this.delta.copy(this.position).sub(this.prevPixel);
        this.delta11.copy(this.position01).sub(this.prev01);
        this._storeLastPosition();

        const scaledDelta = this.delta11.clone().multiplyScalar(2);
        this.velocity.add(scaledDelta);
    }

    _storeDragOrigin() {
        this.dragOriginPixel.copy(this.position);
        this.dragOrigin01.copy(this.position01);
    }

    _updateDrag() {
        this.dragged.copy(this.position).sub(this.dragOriginPixel);
        this.dragged11.copy(this.position01).sub(this.dragOrigin01);
    }

    _updateVelocity() {
        const friction = this.base.utils.frictionFPS(0.95); // 每帧阻力因子
        this.velocity.multiplyScalar(friction);
        this.velocity.clampScalar(-1, 1);

        if (this.velocity.length() < 0.001) {
            this.velocity.setScalar(0);
        }
    }
}

class InputManager {
    constructor(base) {
        this.base = base;
        // 私有触摸列表（如 TouchTracker 实例）
        this.trackers = [];
        this.targetElement = null;
        this.isCanvas = true;

        // 是否允许原生 touchstart 默认行为
        this.allowTouchStart = false;

        // 绑定事件方法，确保 this 正确
        this.handleTouchStart = this._onPointerDown.bind(this);
        this.handleTouchMove = this._onPointerMove.bind(this);
        this.handleTouchEnd = this._onPointerUp.bind(this);
        this.handlePreventTouchStart = this._preventTouchStart.bind(this);
        this.handlePreventDefault = this._preventDefault.bind(this);

        this.init({element: this.base.target, fingers: 1})
    }

    /**
     * 获取第 n 个 Tracker
     */
    get(index) {
        return this.trackers[index];
    }

    /**
     * 获取所有处于 active 状态的触点
     */
    getActive() {
        return this.trackers.filter(t => t.touching);
    }

    /**
     * 初始化输入系统
     * @param {*} options
     *  - element: 监听目标 DOM（默认是 window）
     *  - fingers: 支持的手指数（默认 2）
     *  - contextMenu: 是否允许右键菜单（默认 false = 禁止）
     */
    init({element = window, fingers = 2, contextMenu = false} = {}) {
        this.targetElement = element;
        this.isCanvas = element instanceof HTMLCanvasElement;

        // 创建 n 个触点追踪器
        for (let i = 0; i < fingers; i++) {
            this.trackers.push(new TouchTracker(this, i));
        }

        // 设置样式（禁用选择/滚动）
        element.style.touchAction = "none";
        if (this.isCanvas) {
            element.style.userSelect = "none";
        }

        // 监听 pointer 事件（鼠标 / 手指）
        element.addEventListener("pointerdown", this.handleTouchStart);
        element.addEventListener("pointermove", this.handleTouchMove);
        element.addEventListener("pointerup", this.handleTouchEnd);
        element.addEventListener("pointerout", this.handleTouchEnd);
        element.addEventListener("pointercancel", this.handleTouchEnd);

        // 禁止右键菜单
        if (!contextMenu) {
            element.addEventListener("contextmenu", this.handlePreventDefault);
        }

        // 禁止滚动行为（iOS需要）
        element.addEventListener("touchstart", this.handlePreventTouchStart, {passive: false});
        document.addEventListener("dblclick", this.handlePreventDefault);
    }

    /**
     * 清理事件与资源
     */
    dispose() {
        const el = this.targetElement;
        el.removeEventListener("pointerdown", this.handleTouchStart);
        el.removeEventListener("pointermove", this.handleTouchMove);
        el.removeEventListener("pointerup", this.handleTouchEnd);
        el.removeEventListener("pointerout", this.handleTouchEnd);
        el.removeEventListener("pointercancel", this.handleTouchEnd);
        el.removeEventListener("contextmenu", this.handlePreventDefault);
        el.removeEventListener("touchstart", this.handlePreventTouchStart);
        document.removeEventListener("dblclick", this.handlePreventDefault);

        this.trackers.forEach(t => t.dispose());
        this.trackers.length = 0;

        this.targetElement = null;
        this.isCanvas = true;
    }

    // ========== 内部事件逻辑 ==========

    /**
     * 查找未绑定 touchID 的 Tracker（新触摸）
     */
    _findUnusedTracker() {
        return this.trackers.find(t => t.touchID === false);
    }

    /**
     * 查找当前触摸的 Tracker（通过 pointerId）
     */
    _findTrackerByID(id) {
        return this.trackers.find(t => t.touchID === id);
    }

    /**
     * pointerdown 处理器
     */
    _onPointerDown(e) {
        const tracker = this._findUnusedTracker();
        if (tracker) {
            // 捕获输入焦点（避免被其他元素干扰）
            if (this.isCanvas && this.getActive().length === 0) {
                this.targetElement.setPointerCapture(e.pointerId);
            }

            tracker.touchID = e.pointerId;
            tracker.onTouchStart(e);
        }
    }

    /**
     * pointermove 处理器
     */
    _onPointerMove(e) {
        const tracker = this._findTrackerByID(e.pointerId);

        if (tracker) {
            tracker.onTouchMove(e);
        } else if (e.pointerType === "mouse" && this.getActive().length === 0) {
            // 鼠标状态无 active tracker 时直接用第一个
            this.trackers[0].onTouchMove(e);
        }
    }

    /**
     * pointerup / cancel / out 处理器
     */
    _onPointerUp(e) {
        const tracker = this._findTrackerByID(e.pointerId);
        if (tracker) {
            tracker.onTouchEnd(e);
            tracker.touchID = false;

            // 释放 pointer capture
            if (this.isCanvas && this.getActive().length === 0) {
                this.targetElement.releasePointerCapture(e.pointerId);
            }
        }
    }

    /**
     * 阻止默认 touchstart（如 iOS 双指缩放）
     */
    _preventTouchStart(e) {
        if (!this.allowTouchStart) {
            e.preventDefault();
        }
    }

    /**
     * 阻止默认行为（如右键菜单）
     */
    _preventDefault(e) {
        e.preventDefault();
    }
}

class RenderCreate {

    /**
     * 渲染器
     * **/
    webgl
    domElement
    info
    clearColor = new THREE.Color("#000000")
    clearAlpha = 1

    constructor({shadowMap = true, shadowMapType = THREE.PCFSoftShadowMap} = {}) {
        this.webgl = new THREE.WebGLRenderer({alpha: !1, antialias: !1, stencil: !1, depth: !1})
        this.webgl.setClearColor(this.clearColor, this.clearAlpha)
        if (shadowMap) {
            this.webgl.shadowMap.enabled = !0
            if (shadowMapType) this.webgl.shadowMap.type = shadowMapType
        }
        this.info = this.webgl.info
        this.webgl.debug.checkShaderErrors = !1
        this.webgl.capabilities.floatLinearFiltering = this.webgl.extensions.has("OES_texture_float_linear")
        this.webgl.capabilities.floatRenderTarget = this.checkFloatRenderTarget()
    }

    checkFloatRenderTarget() {
        const renderTarget = new THREE.WebGLRenderTarget(1, 1, {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            type: THREE.FloatType
        })
        const scene = new THREE.Scene
        const material = new THREE.ShaderMaterial({
            vertexShader: " void main() { gl_Position = vec4(position, 1.0); } ",
            fragmentShader: " void main() { gl_FragColor.rgb = vec3(0.0, 1.0 / 10.0, 1.0 / 20.0); gl_FragColor.a = 1.0; } "
        });
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
        geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2));
        scene.add(new THREE.Mesh(geometry, material));
        const getRenderTarget = this.webgl.getRenderTarget()
        this.webgl.setRenderTarget(renderTarget)
        this.webgl.render(scene, new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1));
        const array = new Float32Array(4);
        this.webgl.readRenderTargetPixels(renderTarget, 0, 0, 1, 1, array)
        this.webgl.setRenderTarget(getRenderTarget)
        renderTarget.dispose()
        material.dispose()
        return !(array[0] !== 0 || array[1] < .1 || array[2] < .05 || array[3] < 1)
    }

    dispose() {
        this.webgl.dispose()
        this.webgl = null
        this.domElement = null
        this.info = null
    }
}

class customCamera extends THREE.PerspectiveCamera {
    constructor(base) {
        super(45, base.screen.w / base.screen.h, 0.1, 1e3);
        this.base = base;
        this.isBaseCamera = true;
        this._sizing = 1;                       // 尺寸来源
        this._size = new THREE.Vector2(base.screen.w, base.screen.h);   // 当前尺寸
        this._firstUpdate = true;
        this._prevSize = this._size.clone();

        // 状态缓存（防止冗余更新）
        this._prevPosition = new THREE.Vector3();
        this._prevTarget = new THREE.Vector3();
        this._prevUp = new THREE.Vector3();

        // 补充旋转与位置偏移控制（球坐标）
        this._additionalSphericalPosition = new THREE.Spherical(); // theta/phi for position
        this._additionalSphericalTarget = new THREE.Spherical();   // theta/phi for target
        this._additionalRotationUp = 0;

        // 摄像目标和方向
        this.target = new THREE.Vector3();
        this.basePosition = new THREE.Vector3(0, 0, 6);  // 初始相机位置
        this.baseTarget = new THREE.Vector3();           // 初始看向目标
        this.baseUp = new THREE.Vector3(0, 1, 0);         // 初始 up 向量

        // 位移控制参数（用于跟随或拖拽）
        this.displacement = {
            position: new THREE.Vector2(),  // 鼠标拖动造成的位置偏移
            target: new THREE.Vector2(),    // 鼠标拖动造成的目标偏移
            rotation: 0         // 旋转偏移
        };

        // 平滑系数
        this.lerpPosition = 0.035;
        this.lerpTarget = 0.035;
        this.lerpRotation = 0.035;

        // 抖动参数
        this.shake = new THREE.Vector3();              // xyz 分量控制 shake 影响程度
        this.shakeSpeed = new THREE.Vector3(1, 1, 1);  // 每个 shake 分量的噪声速度

        // 交互控制参数
        this.touchAmount = 1;
        this.resetOnTouch = true;

        this.Tn = new THREE.Vector3()
        this.er = new THREE.Vector3()
        this.Gu = new THREE.Vector3()
        this.As = new THREE.Vector3()
        this.Em = new THREE.Vector2()
        this.XI = new THREE.Matrix4()
        const noise = createNoise3D(Math.random);
        this.Du = {sineNoise1: noise};
    }

    // 更新相机的实际位置、目标、up，并计算 quaternion
    _update() {
        if (this._firstUpdate) this._firstUpdate = false;

        const isTouchReleased = this.resetOnTouch && this.base.inputManager.get(0).currentInput === "touch" && !this.base.inputManager.get(0).touching;

        const interactionFactor = isTouchReleased ? 0.5 : 1;

        const xInput = this.base.utils.fit(isTouchReleased ? 0 : this.base.inputManager.get(0).position11.x, -1, 1, -Math.PI * .5, Math.PI * .5) * this.touchAmount;
        const yInput = this.base.utils.fit(isTouchReleased ? 0 : this.base.inputManager.get(0).position11.y, 1, -1, -Math.PI * .5, Math.PI * .5) * this.touchAmount;

        // 方向向量构造
        this.Tn.subVectors(this.basePosition, this.baseTarget);
        if (this.Tn.lengthSq() === 0) this.Tn.z = 1;
        this.Tn.normalize();

        this.er.crossVectors(this.baseUp, this.Tn);
        if (this.er.lengthSq() === 0) {
            Math.abs(this.baseUp.z) === 1 ? this.Tn.x += 1e-4 : this.Tn.z += 1e-4;
            this.Tn.normalize();
            this.er.crossVectors(this.baseUp, this.Tn);
        }
        this.er.normalize();

        this.Gu.crossVectors(this.Tn, this.er);

        // === 位置更新 ===
        if (this.displacement.position.equals(this.Em)) {
            this.position.copy(this.basePosition);
            this._additionalSphericalPosition.set(1, 0, 0);
        } else {
            this._additionalSphericalPosition.theta = this.base.utils.lerpFPS(this._additionalSphericalPosition.theta, xInput * this.displacement.position.x, this.lerpPosition * interactionFactor);
            this._additionalSphericalPosition.phi = this.base.utils.lerpFPS(this._additionalSphericalPosition.phi, yInput * this.displacement.position.y, this.lerpPosition * interactionFactor);

            this.As.subVectors(this.basePosition, this.baseTarget);
            this.As.applyAxisAngle(this.er, this._additionalSphericalPosition.phi).applyAxisAngle(this.Gu, this._additionalSphericalPosition.theta);
            this.position.copy(this.baseTarget).add(this.As);
        }

        // === 目标更新 ===
        if (this.displacement.target.equals(this.Em) && this.shake.x === 0 && this.shake.y === 0) {
            this.target.copy(this.baseTarget);
            this._additionalSphericalTarget.set(1, 0, 0);
        } else {
            this._additionalSphericalTarget.theta = this.base.utils.lerpFPS(this._additionalSphericalTarget.theta, xInput * this.displacement.target.x, this.lerpTarget * interactionFactor);
            this._additionalSphericalTarget.phi = this.base.utils.lerpFPS(this._additionalSphericalTarget.phi, yInput * this.displacement.target.y, this.lerpTarget * interactionFactor);

            const shakeX = this.shake.x === 0 ? 0 : this.Du.sineNoise1(12.23, 3.44, -3.234 + this.base.timeStats.time * this.shakeSpeed.x) * this.shake.x * this.touchAmount;
            const shakeY = this.shake.y === 0 ? 0 : this.Du.sineNoise1(-2.45, 4.789, 7.343 + this.base.timeStats.time * this.shakeSpeed.y) * this.shake.y * this.touchAmount;

            this.As.subVectors(this.baseTarget, this.basePosition);
            this.As.applyAxisAngle(this.er, this._additionalSphericalTarget.phi + shakeY)
                .applyAxisAngle(this.Gu, this._additionalSphericalTarget.theta + shakeX);

            this.target.copy(this.basePosition).add(this.As);
        }

        // === up向量更新（用于相机 roll 旋转）===
        if (this.displacement.rotation === 0 && this.shake.z === 0) {
            this.up.copy(this.baseUp);
            this._additionalRotationUp = 0;
        } else {
            this._additionalRotationUp = this.base.utils.lerpFPS(this._additionalRotationUp, this.base.inputManager.get(0).velocity.x * this.displacement.rotation * this.touchAmount, this.lerpRotation * interactionFactor);

            const shakeZ = this.shake.z === 0 ? 0 : this.Du.sineNoise1(23.434, -1.565, 8.454 + this.base.timeStats.time * this.shakeSpeed.z) * this.shake.z * this.touchAmount;

            this.As.subVectors(this.position, this.target).normalize();
            this.up.copy(this.baseUp).applyAxisAngle(this.As, this._additionalRotationUp + shakeZ);
        }

        // === 如果任意状态变化，更新方向四元数 ===
        if (
            !this.position.equals(this._prevPosition) ||
            !this.target.equals(this._prevTarget) ||
            !this.up.equals(this._prevUp)
        ) {
            this._prevPosition.copy(this.position);
            this._prevTarget.copy(this.target);
            this._prevUp.copy(this.up);
            this.quaternion.setFromRotationMatrix(this.XI.lookAt(this.position, this.target, this.up));
        }
    }

    // 根据屏幕 / 自定义尺寸更新投影矩阵
    _resize() {
        if (this._sizing === 1) {
            this._size.set(this.base.screen.w, this.base.screen.h);
        }

        if (!this._prevSize.equals(this._size)) {
            this._prevSize.copy(this._size);

            if (this.isPerspectiveCamera) {
                this.aspect = this._size.x / this._size.y;
            } else {
                const halfW = this._size.x * 0.5;
                const halfH = this._size.y * 0.5;
                this.left = -halfW;
                this.right = halfW;
                this.top = halfH;
                this.bottom = -halfH;
            }

            this.updateProjectionMatrix();
        }
    }

    // 设置自定义尺寸而非屏幕尺寸
    setCustomSize(width, height) {
        this._sizing = 2;
        this._size.set(width, height);
    }
}

class customScene extends THREE.Scene {
    /**
     * 自定义场景类
     * **/
    constructor(base) {
        super();
        this.base = base;
        this.camera = this.base.camera || new customCamera(this.base);
        // 相机不自动更新矩阵，场景更新它
        this.camera.matrixWorldAutoUpdate = false;
        // 是否启用自动更新
        this.matrixAutoUpdate = false;
        this.matrixWorldAutoUpdate = true;
        // 前置回调（渲染前）
        this.beforeRenderCbs = [];
        // 用于资源预上传的纹理集合
        this._textures = new Set();
        // 可选的上传用的 RT
        this.customUploadRT = null;
    }

    /**
     * 覆写矩阵更新逻辑，同时更新相机逻辑
     */
    updateMatrixWorld(force) {
        super.updateMatrixWorld(force);
        this.camera._resize?.();
        this.camera._update?.();
        this.camera.updateMatrixWorld();
        this.beforeRenderCbs.forEach(cb => cb());
    }

    /**
     * 预上传资源（纹理/材质）到 GPU。
     */
    async _upload() {
        // 遍历所有物体做上传准备
        this.traverse(obj => {
            if (obj.material?.isMaterial) {
                // 补全 geometry 的 boundingSphere
                if (obj.frustumCulled && obj.boundingSphere == null) {
                    obj.computeBoundingSphere?.();
                }

                // 收集纹理（uniform 风格或材质属性）
                if (obj.material.uniforms) {
                    Object.entries(obj.material.uniforms).forEach(([key, uniform]) => {
                        const val = uniform.value;
                        if (val?.isTexture && val._loaded) this._textures.add(val);
                    });
                } else {
                    Object.entries(obj.material).forEach(([key, val]) => {
                        if (val?.isTexture && val._loaded) this._textures.add(val);
                    });
                }

                // 记录当前可见性等状态
                obj.__uploadVars = {
                    cull: obj.frustumCulled,
                    visible: obj.visible,
                    materialVisible: obj.material.visible,
                    customDepthMaterialVisible: obj.customDepthMaterial?.visible,
                    customDistanceMaterialVisible: obj.customDistanceMaterial?.visible
                };

                // 暂时强制开启所有物体显示（保证 GPU 编译）
                obj.frustumCulled = false;
                obj.visible = true;
                obj.material.visible = true;
                if (obj.customDepthMaterial) obj.customDepthMaterial.visible = true;
                if (obj.customDistanceMaterial) obj.customDistanceMaterial.visible = true;
            } else if (obj.isLOD) {
                obj.__uploadVars = {autoUpdate: obj.autoUpdate};
                obj.autoUpdate = false;
            }
        });

        const pending = [];

        const Pm = new THREE.WebGLRenderTarget(2, 2, {type: THREE.HalfFloatType})
        Pm.setSize = () => {
        }
        Pm.dispose = () => {
        }

        // 设置渲染目标为上传用的 RT
        this.base.renderer.webgl.setRenderTarget(this.customUploadRT || Pm);

        // 编译场景
        pending.push(this.base.renderer.webgl.compileAsync(this, this.camera));

        // 编译所有纹理
        for (const tex of this._textures) {
            pending.push(tex._loaded.then(() => this.base.renderer.webgl.initTexture(tex)));
        }

        // 等待所有上传完成
        await Promise.all(pending);

        // 再次渲染一次（以确保编译）
        this.base.renderer.webgl.setRenderTarget(this.customUploadRT || Pm);
        this.base.renderer.webgl.render(this, this.camera);

        // 还原所有物体的原始属性
        this.traverse(obj => {
            if (obj.__uploadVars) {
                if (obj.material?.isMaterial) {
                    obj.frustumCulled = obj.__uploadVars.cull;
                    obj.visible = obj.__uploadVars.visible;
                    obj.material.visible = obj.__uploadVars.materialVisible;
                    if (obj.customDepthMaterial) obj.customDepthMaterial.visible = obj.__uploadVars.customDepthMaterialVisible;
                    if (obj.customDistanceMaterial) obj.customDistanceMaterial.visible = obj.__uploadVars.customDistanceMaterialVisible;
                } else if (obj.isLOD) {
                    obj.autoUpdate = obj.__uploadVars.autoUpdate;
                }
                delete obj.__uploadVars;
            }
        });

        // 触发 resolve
        this._isUploaded();
    }

    /**
     * 销毁：释放纹理、RT、几何体、材质、相机等
     */
    dispose() {
        this.camera.dispose?.();
        this.beforeRenderCbs = [];

        this.customUploadRT?.dispose?.();

        this._textures.forEach(tex => tex.dispose?.());
        this._textures.clear();

        this.traverse(obj => {
            obj.geometry?.dispose?.();

            if (obj.material?.isMaterial) {
                if (obj.material.uniforms) {
                    Object.values(obj.material.uniforms).forEach(uniform => {
                        uniform.value?.isTexture && uniform.value.dispose?.();
                    });
                } else {
                    Object.values(obj.material).forEach(val => {
                        val?.isTexture && val.dispose?.();
                    });
                }
                obj.material.dispose?.();
            }

            if (obj !== this) obj.dispose?.();
        });

        this.clear();
    }
}

class MultipleRenderPass extends Pass {
    constructor(base) {
        if (!base.scene) throw new Error("MultipleRenderPass requires a scene.");
        super();
        this.base = base;
        this.scene = this.base.scene;
        this.camera = this.base.scene.camera || this.base.camera;
        this.clearColor = new THREE.Color("#ffffff");
        this.clearAlpha = this.base.renderer.webgl.clearAlpha;
        this.clear = true;
        this.clearDepth = false;
        this.needsSwap = false;
        this._oldClearColor = new THREE.Color();
        // 创建多个渲染目标（比如 color 和 info）
        this.multipleRenderTarget = new THREE.WebGLMultipleRenderTargets(this.base.uniforms.resolution.x, this.base.uniforms.resolution.y, 2, {type: THREE.HalfFloatType});
    }

    render(renderer, writeBuffer, readBuffer) {
        const oldAutoClear = renderer.autoClear;
        renderer.autoClear = false;
        let oldAlpha = null;
        // 设置清除颜色
        if (this.clearColor !== null) {
            renderer.getClearColor(this._oldClearColor);
            renderer.setClearColor(this.clearColor, this.clearAlpha);
        }
        // 设置 alpha（透明度）
        if (this.clearAlpha !== null) {
            oldAlpha = renderer.getClearAlpha();
            renderer.setClearAlpha(this.clearAlpha);
        }
        if (this.clearDepth) renderer.clearDepth();
        // 渲染到多个目标
        renderer.setRenderTarget(this.multipleRenderTarget);
        if (this.clear === true) renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil);
        renderer.render(this.scene, this.camera);
        // 还原原来的 clearColor / alpha
        if (this.clearColor !== null) renderer.setClearColor(this._oldClearColor, 1);
        if (this.clearAlpha !== null) renderer.setClearAlpha(oldAlpha);
        renderer.autoClear = oldAutoClear;
    }

    setSize(width, height) {
        this.multipleRenderTarget.setSize(width, height);
    }

    dispose() {
        this.multipleRenderTarget.dispose();
    }
}

class FinalPass {
    constructor(base) {
        this.base = base;
        this.pass = new ShaderPass(new THREE.ShaderMaterial({
            uniformsGroups: [this.base.UBO],
            uniforms: {
                tLogo: {value: this.base.headLineTexture},
                tNoise: {value: this.base.noiseSimplexLayeredTexture},
                tDiffuse: {value: null},
                tInfo: {value: null},
                tSim: this.base.fluidSim.dyeUniform,
                uBgColor: {value: new THREE.Color("#ffec95")},
                tTransition: {value: this.base.transitionNomipmapsTexture},
                uProgress1: {value: 0},
                uProgress2: {value: 0},
                uProgress3: {value: 0},
                uProgress4: {value: 0},
                uCameraNear: {value: this.base.camera.near, ignore: !0},
                uCameraFar: {value: this.base.camera.far, ignore: !0},
                uOutlineFade: {value: new THREE.Vector2(10, 80)},
                uOutlineThickness: {value: 1},
                uOutlineColor: {value: new THREE.Color("#9f4a16")},
                uInfoRange: {value: new THREE.Vector3(1e-4, 2e-4, .1)},
                uInfoMinScale: {value: .6},
                uDepthRange: {value: new THREE.Vector3(1e-4, .001, .5)},
                uNormalRange: {value: new THREE.Vector3(.4, .5, .3)},
                uOutlineScale: {value: 1},
                uSmoothMargin: {value: .2}
            },
            vertexShader: vert,
            fragmentShader: frag
        }))
    }
}


export {
    AdaptiveDPRController,
    TimeStats,
    Utils,
    TouchTracker,
    InputManager,
    RenderCreate,
    customCamera,
    customScene,
    MultipleRenderPass,
    FinalPass
}
