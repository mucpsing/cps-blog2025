/**
 * Bundled by jsDelivr using Rollup v2.79.2 and Terser v5.39.0.
 * Original file: /npm/three@0.160.0/examples/jsm/loaders/KTX2Loader.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
import {
    RGBAFormat as A,
    RGBA_ASTC_4x4_Format as I,
    RGBA_BPTC_Format as g,
    RGBA_ETC2_EAC_Format as B,
    RGBA_PVRTC_4BPPV1_Format as C,
    RGBA_S3TC_DXT5_Format as t,
    RGB_ETC1_Format as Q,
    RGB_ETC2_Format as E,
    RGB_PVRTC_4BPPV1_Format as i,
    RGB_S3TC_DXT1_Format as e,
    Loader as o,
    FileLoader as r,
    CompressedCubeTexture as n,
    UnsignedByteType as s,
    CompressedArrayTexture as a,
    CompressedTexture as h,
    LinearFilter as f,
    LinearMipmapLinearFilter as w,
    FloatType as D,
    HalfFloatType as c,
    DataTexture as y,
    Data3DTexture as u,
    SRGBColorSpace as G,
    LinearSRGBColorSpace as F,
    DisplayP3ColorSpace as R,
    LinearDisplayP3ColorSpace as S,
    NoColorSpace as p,
    RGFormat as U,
    RedFormat as l,
    RGBA_ASTC_6x6_Format as d,
} from "/asset/js/threejs/0.160.0/three.js";
class L {
    constructor(A = 4) {
        (this.pool = A), (this.queue = []), (this.workers = []), (this.workersResolve = []), (this.workerStatus = 0);
    }
    _initWorker(A) {
        if (!this.workers[A]) {
            const I = this.workerCreator();
            I.addEventListener("message", this._onMessage.bind(this, A)), (this.workers[A] = I);
        }
    }
    _getIdleWorker() {
        for (let A = 0; A < this.pool; A++) if (!(this.workerStatus & (1 << A))) return A;
        return -1;
    }
    _onMessage(A, I) {
        const g = this.workersResolve[A];
        if ((g && g(I), this.queue.length)) {
            const { resolve: I, msg: g, transfer: B } = this.queue.shift();
            (this.workersResolve[A] = I), this.workers[A].postMessage(g, B);
        } else this.workerStatus ^= 1 << A;
    }
    setWorkerCreator(A) {
        this.workerCreator = A;
    }
    setWorkerLimit(A) {
        this.pool = A;
    }
    postMessage(A, I) {
        return new Promise((g) => {
            const B = this._getIdleWorker();
            -1 !== B
                ? (this._initWorker(B), (this.workerStatus |= 1 << B), (this.workersResolve[B] = g), this.workers[B].postMessage(A, I))
                : this.queue.push({ resolve: g, msg: A, transfer: I });
        });
    }
    dispose() {
        this.workers.forEach((A) => A.terminate()),
            (this.workersResolve.length = 0),
            (this.workers.length = 0),
            (this.queue.length = 0),
            (this.workerStatus = 0);
    }
}
var k = "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {},
    N = [],
    M = [],
    J = "undefined" != typeof Uint8Array ? Uint8Array : Array,
    q = !1;
function Y() {
    q = !0;
    for (var A = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", I = 0; I < 64; ++I) (N[I] = A[I]), (M[A.charCodeAt(I)] = I);
    (M["-".charCodeAt(0)] = 62), (M["_".charCodeAt(0)] = 63);
}
function m(A, I, g) {
    for (var B, C, t = [], Q = I; Q < g; Q += 3)
        (B = (A[Q] << 16) + (A[Q + 1] << 8) + A[Q + 2]), t.push(N[((C = B) >> 18) & 63] + N[(C >> 12) & 63] + N[(C >> 6) & 63] + N[63 & C]);
    return t.join("");
}
function H(A) {
    var I;
    q || Y();
    for (var g = A.length, B = g % 3, C = "", t = [], Q = 16383, E = 0, i = g - B; E < i; E += Q) t.push(m(A, E, E + Q > i ? i : E + Q));
    return (
        1 === B
            ? ((I = A[g - 1]), (C += N[I >> 2]), (C += N[(I << 4) & 63]), (C += "=="))
            : 2 === B && ((I = (A[g - 2] << 8) + A[g - 1]), (C += N[I >> 10]), (C += N[(I >> 4) & 63]), (C += N[(I << 2) & 63]), (C += "=")),
        t.push(C),
        t.join("")
    );
}
function _(A, I, g, B, C) {
    var t,
        Q,
        E = 8 * C - B - 1,
        i = (1 << E) - 1,
        e = i >> 1,
        o = -7,
        r = g ? C - 1 : 0,
        n = g ? -1 : 1,
        s = A[I + r];
    for (r += n, t = s & ((1 << -o) - 1), s >>= -o, o += E; o > 0; t = 256 * t + A[I + r], r += n, o -= 8);
    for (Q = t & ((1 << -o) - 1), t >>= -o, o += B; o > 0; Q = 256 * Q + A[I + r], r += n, o -= 8);
    if (0 === t) t = 1 - e;
    else {
        if (t === i) return Q ? NaN : (1 / 0) * (s ? -1 : 1);
        (Q += Math.pow(2, B)), (t -= e);
    }
    return (s ? -1 : 1) * Q * Math.pow(2, t - B);
}
function x(A, I, g, B, C, t) {
    var Q,
        E,
        i,
        e = 8 * t - C - 1,
        o = (1 << e) - 1,
        r = o >> 1,
        n = 23 === C ? Math.pow(2, -24) - Math.pow(2, -77) : 0,
        s = B ? 0 : t - 1,
        a = B ? 1 : -1,
        h = I < 0 || (0 === I && 1 / I < 0) ? 1 : 0;
    for (
        I = Math.abs(I),
            isNaN(I) || I === 1 / 0
                ? ((E = isNaN(I) ? 1 : 0), (Q = o))
                : ((Q = Math.floor(Math.log(I) / Math.LN2)),
                  I * (i = Math.pow(2, -Q)) < 1 && (Q--, (i *= 2)),
                  (I += Q + r >= 1 ? n / i : n * Math.pow(2, 1 - r)) * i >= 2 && (Q++, (i /= 2)),
                  Q + r >= o
                      ? ((E = 0), (Q = o))
                      : Q + r >= 1
                      ? ((E = (I * i - 1) * Math.pow(2, C)), (Q += r))
                      : ((E = I * Math.pow(2, r - 1) * Math.pow(2, C)), (Q = 0)));
        C >= 8;
        A[g + s] = 255 & E, s += a, E /= 256, C -= 8
    );
    for (Q = (Q << C) | E, e += C; e > 0; A[g + s] = 255 & Q, s += a, Q /= 256, e -= 8);
    A[g + s - a] |= 128 * h;
}
var K = {}.toString,
    T =
        Array.isArray ||
        function (A) {
            return "[object Array]" == K.call(A);
        };
function b() {
    return v.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;
}
function P(A, I) {
    if (b() < I) throw new RangeError("Invalid typed array length");
    return v.TYPED_ARRAY_SUPPORT ? ((A = new Uint8Array(I)).__proto__ = v.prototype) : (null === A && (A = new v(I)), (A.length = I)), A;
}
function v(A, I, g) {
    if (!(v.TYPED_ARRAY_SUPPORT || this instanceof v)) return new v(A, I, g);
    if ("number" == typeof A) {
        if ("string" == typeof I) throw new Error("If encoding is specified then the first argument must be a string");
        return X(this, A);
    }
    return O(this, A, I, g);
}
function O(A, I, g, B) {
    if ("number" == typeof I) throw new TypeError('"value" argument must not be a number');
    return "undefined" != typeof ArrayBuffer && I instanceof ArrayBuffer
        ? (function (A, I, g, B) {
              if ((I.byteLength, g < 0 || I.byteLength < g)) throw new RangeError("'offset' is out of bounds");
              if (I.byteLength < g + (B || 0)) throw new RangeError("'length' is out of bounds");
              I = void 0 === g && void 0 === B ? new Uint8Array(I) : void 0 === B ? new Uint8Array(I, g) : new Uint8Array(I, g, B);
              v.TYPED_ARRAY_SUPPORT ? ((A = I).__proto__ = v.prototype) : (A = W(A, I));
              return A;
          })(A, I, g, B)
        : "string" == typeof I
        ? (function (A, I, g) {
              ("string" == typeof g && "" !== g) || (g = "utf8");
              if (!v.isEncoding(g)) throw new TypeError('"encoding" must be a valid string encoding');
              var B = 0 | z(I, g);
              A = P(A, B);
              var C = A.write(I, g);
              C !== B && (A = A.slice(0, C));
              return A;
          })(A, I, g)
        : (function (A, I) {
              if (j(I)) {
                  var g = 0 | Z(I.length);
                  return 0 === (A = P(A, g)).length || I.copy(A, 0, 0, g), A;
              }
              if (I) {
                  if (("undefined" != typeof ArrayBuffer && I.buffer instanceof ArrayBuffer) || "length" in I)
                      return "number" != typeof I.length || (B = I.length) != B ? P(A, 0) : W(A, I);
                  if ("Buffer" === I.type && T(I.data)) return W(A, I.data);
              }
              var B;
              throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
          })(A, I);
}
function V(A) {
    if ("number" != typeof A) throw new TypeError('"size" argument must be a number');
    if (A < 0) throw new RangeError('"size" argument must not be negative');
}
function X(A, I) {
    if ((V(I), (A = P(A, I < 0 ? 0 : 0 | Z(I))), !v.TYPED_ARRAY_SUPPORT)) for (var g = 0; g < I; ++g) A[g] = 0;
    return A;
}
function W(A, I) {
    var g = I.length < 0 ? 0 : 0 | Z(I.length);
    A = P(A, g);
    for (var B = 0; B < g; B += 1) A[B] = 255 & I[B];
    return A;
}
function Z(A) {
    if (A >= b()) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + b().toString(16) + " bytes");
    return 0 | A;
}
function j(A) {
    return !(null == A || !A._isBuffer);
}
function z(A, I) {
    if (j(A)) return A.length;
    if ("undefined" != typeof ArrayBuffer && "function" == typeof ArrayBuffer.isView && (ArrayBuffer.isView(A) || A instanceof ArrayBuffer))
        return A.byteLength;
    "string" != typeof A && (A = "" + A);
    var g = A.length;
    if (0 === g) return 0;
    for (var B = !1; ; )
        switch (I) {
            case "ascii":
            case "latin1":
            case "binary":
                return g;
            case "utf8":
            case "utf-8":
            case void 0:
                return SA(A).length;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
                return 2 * g;
            case "hex":
                return g >>> 1;
            case "base64":
                return pA(A).length;
            default:
                if (B) return SA(A).length;
                (I = ("" + I).toLowerCase()), (B = !0);
        }
}
function $(A, I, g) {
    var B = !1;
    if (((void 0 === I || I < 0) && (I = 0), I > this.length)) return "";
    if (((void 0 === g || g > this.length) && (g = this.length), g <= 0)) return "";
    if ((g >>>= 0) <= (I >>>= 0)) return "";
    for (A || (A = "utf8"); ; )
        switch (A) {
            case "hex":
                return aA(this, I, g);
            case "utf8":
            case "utf-8":
                return oA(this, I, g);
            case "ascii":
                return nA(this, I, g);
            case "latin1":
            case "binary":
                return sA(this, I, g);
            case "base64":
                return eA(this, I, g);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
                return hA(this, I, g);
            default:
                if (B) throw new TypeError("Unknown encoding: " + A);
                (A = (A + "").toLowerCase()), (B = !0);
        }
}
function AA(A, I, g) {
    var B = A[I];
    (A[I] = A[g]), (A[g] = B);
}
function IA(A, I, g, B, C) {
    if (0 === A.length) return -1;
    if (
        ("string" == typeof g ? ((B = g), (g = 0)) : g > 2147483647 ? (g = 2147483647) : g < -2147483648 && (g = -2147483648),
        (g = +g),
        isNaN(g) && (g = C ? 0 : A.length - 1),
        g < 0 && (g = A.length + g),
        g >= A.length)
    ) {
        if (C) return -1;
        g = A.length - 1;
    } else if (g < 0) {
        if (!C) return -1;
        g = 0;
    }
    if (("string" == typeof I && (I = v.from(I, B)), j(I))) return 0 === I.length ? -1 : gA(A, I, g, B, C);
    if ("number" == typeof I)
        return (
            (I &= 255),
            v.TYPED_ARRAY_SUPPORT && "function" == typeof Uint8Array.prototype.indexOf
                ? C
                    ? Uint8Array.prototype.indexOf.call(A, I, g)
                    : Uint8Array.prototype.lastIndexOf.call(A, I, g)
                : gA(A, [I], g, B, C)
        );
    throw new TypeError("val must be string, number or Buffer");
}
function gA(A, I, g, B, C) {
    var t,
        Q = 1,
        E = A.length,
        i = I.length;
    if (void 0 !== B && ("ucs2" === (B = String(B).toLowerCase()) || "ucs-2" === B || "utf16le" === B || "utf-16le" === B)) {
        if (A.length < 2 || I.length < 2) return -1;
        (Q = 2), (E /= 2), (i /= 2), (g /= 2);
    }
    function e(A, I) {
        return 1 === Q ? A[I] : A.readUInt16BE(I * Q);
    }
    if (C) {
        var o = -1;
        for (t = g; t < E; t++)
            if (e(A, t) === e(I, -1 === o ? 0 : t - o)) {
                if ((-1 === o && (o = t), t - o + 1 === i)) return o * Q;
            } else -1 !== o && (t -= t - o), (o = -1);
    } else
        for (g + i > E && (g = E - i), t = g; t >= 0; t--) {
            for (var r = !0, n = 0; n < i; n++)
                if (e(A, t + n) !== e(I, n)) {
                    r = !1;
                    break;
                }
            if (r) return t;
        }
    return -1;
}
function BA(A, I, g, B) {
    g = Number(g) || 0;
    var C = A.length - g;
    B ? (B = Number(B)) > C && (B = C) : (B = C);
    var t = I.length;
    if (t % 2 != 0) throw new TypeError("Invalid hex string");
    B > t / 2 && (B = t / 2);
    for (var Q = 0; Q < B; ++Q) {
        var E = parseInt(I.substr(2 * Q, 2), 16);
        if (isNaN(E)) return Q;
        A[g + Q] = E;
    }
    return Q;
}
function CA(A, I, g, B) {
    return UA(SA(I, A.length - g), A, g, B);
}
function tA(A, I, g, B) {
    return UA(
        (function (A) {
            for (var I = [], g = 0; g < A.length; ++g) I.push(255 & A.charCodeAt(g));
            return I;
        })(I),
        A,
        g,
        B
    );
}
function QA(A, I, g, B) {
    return tA(A, I, g, B);
}
function EA(A, I, g, B) {
    return UA(pA(I), A, g, B);
}
function iA(A, I, g, B) {
    return UA(
        (function (A, I) {
            for (var g, B, C, t = [], Q = 0; Q < A.length && !((I -= 2) < 0); ++Q)
                (B = (g = A.charCodeAt(Q)) >> 8), (C = g % 256), t.push(C), t.push(B);
            return t;
        })(I, A.length - g),
        A,
        g,
        B
    );
}
function eA(A, I, g) {
    return 0 === I && g === A.length ? H(A) : H(A.slice(I, g));
}
function oA(A, I, g) {
    g = Math.min(A.length, g);
    for (var B = [], C = I; C < g; ) {
        var t,
            Q,
            E,
            i,
            e = A[C],
            o = null,
            r = e > 239 ? 4 : e > 223 ? 3 : e > 191 ? 2 : 1;
        if (C + r <= g)
            switch (r) {
                case 1:
                    e < 128 && (o = e);
                    break;
                case 2:
                    128 == (192 & (t = A[C + 1])) && (i = ((31 & e) << 6) | (63 & t)) > 127 && (o = i);
                    break;
                case 3:
                    (t = A[C + 1]),
                        (Q = A[C + 2]),
                        128 == (192 & t) &&
                            128 == (192 & Q) &&
                            (i = ((15 & e) << 12) | ((63 & t) << 6) | (63 & Q)) > 2047 &&
                            (i < 55296 || i > 57343) &&
                            (o = i);
                    break;
                case 4:
                    (t = A[C + 1]),
                        (Q = A[C + 2]),
                        (E = A[C + 3]),
                        128 == (192 & t) &&
                            128 == (192 & Q) &&
                            128 == (192 & E) &&
                            (i = ((15 & e) << 18) | ((63 & t) << 12) | ((63 & Q) << 6) | (63 & E)) > 65535 &&
                            i < 1114112 &&
                            (o = i);
            }
        null === o ? ((o = 65533), (r = 1)) : o > 65535 && ((o -= 65536), B.push(((o >>> 10) & 1023) | 55296), (o = 56320 | (1023 & o))),
            B.push(o),
            (C += r);
    }
    return (function (A) {
        var I = A.length;
        if (I <= rA) return String.fromCharCode.apply(String, A);
        var g = "",
            B = 0;
        for (; B < I; ) g += String.fromCharCode.apply(String, A.slice(B, (B += rA)));
        return g;
    })(B);
}
(v.TYPED_ARRAY_SUPPORT = void 0 === k.TYPED_ARRAY_SUPPORT || k.TYPED_ARRAY_SUPPORT),
    b(),
    (v.poolSize = 8192),
    (v._augment = function (A) {
        return (A.__proto__ = v.prototype), A;
    }),
    (v.from = function (A, I, g) {
        return O(null, A, I, g);
    }),
    v.TYPED_ARRAY_SUPPORT &&
        ((v.prototype.__proto__ = Uint8Array.prototype),
        (v.__proto__ = Uint8Array),
        "undefined" != typeof Symbol && Symbol.species && v[Symbol.species]),
    (v.alloc = function (A, I, g) {
        return (function (A, I, g, B) {
            return V(I), I <= 0 ? P(A, I) : void 0 !== g ? ("string" == typeof B ? P(A, I).fill(g, B) : P(A, I).fill(g)) : P(A, I);
        })(null, A, I, g);
    }),
    (v.allocUnsafe = function (A) {
        return X(null, A);
    }),
    (v.allocUnsafeSlow = function (A) {
        return X(null, A);
    }),
    (v.isBuffer = function (A) {
        return (
            null != A &&
            (!!A._isBuffer ||
                lA(A) ||
                (function (A) {
                    return "function" == typeof A.readFloatLE && "function" == typeof A.slice && lA(A.slice(0, 0));
                })(A))
        );
    }),
    (v.compare = function (A, I) {
        if (!j(A) || !j(I)) throw new TypeError("Arguments must be Buffers");
        if (A === I) return 0;
        for (var g = A.length, B = I.length, C = 0, t = Math.min(g, B); C < t; ++C)
            if (A[C] !== I[C]) {
                (g = A[C]), (B = I[C]);
                break;
            }
        return g < B ? -1 : B < g ? 1 : 0;
    }),
    (v.isEncoding = function (A) {
        switch (String(A).toLowerCase()) {
            case "hex":
            case "utf8":
            case "utf-8":
            case "ascii":
            case "latin1":
            case "binary":
            case "base64":
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
                return !0;
            default:
                return !1;
        }
    }),
    (v.concat = function (A, I) {
        if (!T(A)) throw new TypeError('"list" argument must be an Array of Buffers');
        if (0 === A.length) return v.alloc(0);
        var g;
        if (void 0 === I) for (I = 0, g = 0; g < A.length; ++g) I += A[g].length;
        var B = v.allocUnsafe(I),
            C = 0;
        for (g = 0; g < A.length; ++g) {
            var t = A[g];
            if (!j(t)) throw new TypeError('"list" argument must be an Array of Buffers');
            t.copy(B, C), (C += t.length);
        }
        return B;
    }),
    (v.byteLength = z),
    (v.prototype._isBuffer = !0),
    (v.prototype.swap16 = function () {
        var A = this.length;
        if (A % 2 != 0) throw new RangeError("Buffer size must be a multiple of 16-bits");
        for (var I = 0; I < A; I += 2) AA(this, I, I + 1);
        return this;
    }),
    (v.prototype.swap32 = function () {
        var A = this.length;
        if (A % 4 != 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
        for (var I = 0; I < A; I += 4) AA(this, I, I + 3), AA(this, I + 1, I + 2);
        return this;
    }),
    (v.prototype.swap64 = function () {
        var A = this.length;
        if (A % 8 != 0) throw new RangeError("Buffer size must be a multiple of 64-bits");
        for (var I = 0; I < A; I += 8) AA(this, I, I + 7), AA(this, I + 1, I + 6), AA(this, I + 2, I + 5), AA(this, I + 3, I + 4);
        return this;
    }),
    (v.prototype.toString = function () {
        var A = 0 | this.length;
        return 0 === A ? "" : 0 === arguments.length ? oA(this, 0, A) : $.apply(this, arguments);
    }),
    (v.prototype.equals = function (A) {
        if (!j(A)) throw new TypeError("Argument must be a Buffer");
        return this === A || 0 === v.compare(this, A);
    }),
    (v.prototype.inspect = function () {
        var A = "";
        return (
            this.length > 0 && ((A = this.toString("hex", 0, 50).match(/.{2}/g).join(" ")), this.length > 50 && (A += " ... ")), "<Buffer " + A + ">"
        );
    }),
    (v.prototype.compare = function (A, I, g, B, C) {
        if (!j(A)) throw new TypeError("Argument must be a Buffer");
        if (
            (void 0 === I && (I = 0),
            void 0 === g && (g = A ? A.length : 0),
            void 0 === B && (B = 0),
            void 0 === C && (C = this.length),
            I < 0 || g > A.length || B < 0 || C > this.length)
        )
            throw new RangeError("out of range index");
        if (B >= C && I >= g) return 0;
        if (B >= C) return -1;
        if (I >= g) return 1;
        if (this === A) return 0;
        for (
            var t = (C >>>= 0) - (B >>>= 0), Q = (g >>>= 0) - (I >>>= 0), E = Math.min(t, Q), i = this.slice(B, C), e = A.slice(I, g), o = 0;
            o < E;
            ++o
        )
            if (i[o] !== e[o]) {
                (t = i[o]), (Q = e[o]);
                break;
            }
        return t < Q ? -1 : Q < t ? 1 : 0;
    }),
    (v.prototype.includes = function (A, I, g) {
        return -1 !== this.indexOf(A, I, g);
    }),
    (v.prototype.indexOf = function (A, I, g) {
        return IA(this, A, I, g, !0);
    }),
    (v.prototype.lastIndexOf = function (A, I, g) {
        return IA(this, A, I, g, !1);
    }),
    (v.prototype.write = function (A, I, g, B) {
        if (void 0 === I) (B = "utf8"), (g = this.length), (I = 0);
        else if (void 0 === g && "string" == typeof I) (B = I), (g = this.length), (I = 0);
        else {
            if (!isFinite(I)) throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
            (I |= 0), isFinite(g) ? ((g |= 0), void 0 === B && (B = "utf8")) : ((B = g), (g = void 0));
        }
        var C = this.length - I;
        if (((void 0 === g || g > C) && (g = C), (A.length > 0 && (g < 0 || I < 0)) || I > this.length))
            throw new RangeError("Attempt to write outside buffer bounds");
        B || (B = "utf8");
        for (var t = !1; ; )
            switch (B) {
                case "hex":
                    return BA(this, A, I, g);
                case "utf8":
                case "utf-8":
                    return CA(this, A, I, g);
                case "ascii":
                    return tA(this, A, I, g);
                case "latin1":
                case "binary":
                    return QA(this, A, I, g);
                case "base64":
                    return EA(this, A, I, g);
                case "ucs2":
                case "ucs-2":
                case "utf16le":
                case "utf-16le":
                    return iA(this, A, I, g);
                default:
                    if (t) throw new TypeError("Unknown encoding: " + B);
                    (B = ("" + B).toLowerCase()), (t = !0);
            }
    }),
    (v.prototype.toJSON = function () {
        return { type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0) };
    });
var rA = 4096;
function nA(A, I, g) {
    var B = "";
    g = Math.min(A.length, g);
    for (var C = I; C < g; ++C) B += String.fromCharCode(127 & A[C]);
    return B;
}
function sA(A, I, g) {
    var B = "";
    g = Math.min(A.length, g);
    for (var C = I; C < g; ++C) B += String.fromCharCode(A[C]);
    return B;
}
function aA(A, I, g) {
    var B = A.length;
    (!I || I < 0) && (I = 0), (!g || g < 0 || g > B) && (g = B);
    for (var C = "", t = I; t < g; ++t) C += RA(A[t]);
    return C;
}
function hA(A, I, g) {
    for (var B = A.slice(I, g), C = "", t = 0; t < B.length; t += 2) C += String.fromCharCode(B[t] + 256 * B[t + 1]);
    return C;
}
function fA(A, I, g) {
    if (A % 1 != 0 || A < 0) throw new RangeError("offset is not uint");
    if (A + I > g) throw new RangeError("Trying to access beyond buffer length");
}
function wA(A, I, g, B, C, t) {
    if (!j(A)) throw new TypeError('"buffer" argument must be a Buffer instance');
    if (I > C || I < t) throw new RangeError('"value" argument is out of bounds');
    if (g + B > A.length) throw new RangeError("Index out of range");
}
function DA(A, I, g, B) {
    I < 0 && (I = 65535 + I + 1);
    for (var C = 0, t = Math.min(A.length - g, 2); C < t; ++C) A[g + C] = (I & (255 << (8 * (B ? C : 1 - C)))) >>> (8 * (B ? C : 1 - C));
}
function cA(A, I, g, B) {
    I < 0 && (I = 4294967295 + I + 1);
    for (var C = 0, t = Math.min(A.length - g, 4); C < t; ++C) A[g + C] = (I >>> (8 * (B ? C : 3 - C))) & 255;
}
function yA(A, I, g, B, C, t) {
    if (g + B > A.length) throw new RangeError("Index out of range");
    if (g < 0) throw new RangeError("Index out of range");
}
function uA(A, I, g, B, C) {
    return C || yA(A, 0, g, 4), x(A, I, g, B, 23, 4), g + 4;
}
function GA(A, I, g, B, C) {
    return C || yA(A, 0, g, 8), x(A, I, g, B, 52, 8), g + 8;
}
(v.prototype.slice = function (A, I) {
    var g,
        B = this.length;
    if (
        ((A = ~~A) < 0 ? (A += B) < 0 && (A = 0) : A > B && (A = B),
        (I = void 0 === I ? B : ~~I) < 0 ? (I += B) < 0 && (I = 0) : I > B && (I = B),
        I < A && (I = A),
        v.TYPED_ARRAY_SUPPORT)
    )
        (g = this.subarray(A, I)).__proto__ = v.prototype;
    else {
        var C = I - A;
        g = new v(C, void 0);
        for (var t = 0; t < C; ++t) g[t] = this[t + A];
    }
    return g;
}),
    (v.prototype.readUIntLE = function (A, I, g) {
        (A |= 0), (I |= 0), g || fA(A, I, this.length);
        for (var B = this[A], C = 1, t = 0; ++t < I && (C *= 256); ) B += this[A + t] * C;
        return B;
    }),
    (v.prototype.readUIntBE = function (A, I, g) {
        (A |= 0), (I |= 0), g || fA(A, I, this.length);
        for (var B = this[A + --I], C = 1; I > 0 && (C *= 256); ) B += this[A + --I] * C;
        return B;
    }),
    (v.prototype.readUInt8 = function (A, I) {
        return I || fA(A, 1, this.length), this[A];
    }),
    (v.prototype.readUInt16LE = function (A, I) {
        return I || fA(A, 2, this.length), this[A] | (this[A + 1] << 8);
    }),
    (v.prototype.readUInt16BE = function (A, I) {
        return I || fA(A, 2, this.length), (this[A] << 8) | this[A + 1];
    }),
    (v.prototype.readUInt32LE = function (A, I) {
        return I || fA(A, 4, this.length), (this[A] | (this[A + 1] << 8) | (this[A + 2] << 16)) + 16777216 * this[A + 3];
    }),
    (v.prototype.readUInt32BE = function (A, I) {
        return I || fA(A, 4, this.length), 16777216 * this[A] + ((this[A + 1] << 16) | (this[A + 2] << 8) | this[A + 3]);
    }),
    (v.prototype.readIntLE = function (A, I, g) {
        (A |= 0), (I |= 0), g || fA(A, I, this.length);
        for (var B = this[A], C = 1, t = 0; ++t < I && (C *= 256); ) B += this[A + t] * C;
        return B >= (C *= 128) && (B -= Math.pow(2, 8 * I)), B;
    }),
    (v.prototype.readIntBE = function (A, I, g) {
        (A |= 0), (I |= 0), g || fA(A, I, this.length);
        for (var B = I, C = 1, t = this[A + --B]; B > 0 && (C *= 256); ) t += this[A + --B] * C;
        return t >= (C *= 128) && (t -= Math.pow(2, 8 * I)), t;
    }),
    (v.prototype.readInt8 = function (A, I) {
        return I || fA(A, 1, this.length), 128 & this[A] ? -1 * (255 - this[A] + 1) : this[A];
    }),
    (v.prototype.readInt16LE = function (A, I) {
        I || fA(A, 2, this.length);
        var g = this[A] | (this[A + 1] << 8);
        return 32768 & g ? 4294901760 | g : g;
    }),
    (v.prototype.readInt16BE = function (A, I) {
        I || fA(A, 2, this.length);
        var g = this[A + 1] | (this[A] << 8);
        return 32768 & g ? 4294901760 | g : g;
    }),
    (v.prototype.readInt32LE = function (A, I) {
        return I || fA(A, 4, this.length), this[A] | (this[A + 1] << 8) | (this[A + 2] << 16) | (this[A + 3] << 24);
    }),
    (v.prototype.readInt32BE = function (A, I) {
        return I || fA(A, 4, this.length), (this[A] << 24) | (this[A + 1] << 16) | (this[A + 2] << 8) | this[A + 3];
    }),
    (v.prototype.readFloatLE = function (A, I) {
        return I || fA(A, 4, this.length), _(this, A, !0, 23, 4);
    }),
    (v.prototype.readFloatBE = function (A, I) {
        return I || fA(A, 4, this.length), _(this, A, !1, 23, 4);
    }),
    (v.prototype.readDoubleLE = function (A, I) {
        return I || fA(A, 8, this.length), _(this, A, !0, 52, 8);
    }),
    (v.prototype.readDoubleBE = function (A, I) {
        return I || fA(A, 8, this.length), _(this, A, !1, 52, 8);
    }),
    (v.prototype.writeUIntLE = function (A, I, g, B) {
        ((A = +A), (I |= 0), (g |= 0), B) || wA(this, A, I, g, Math.pow(2, 8 * g) - 1, 0);
        var C = 1,
            t = 0;
        for (this[I] = 255 & A; ++t < g && (C *= 256); ) this[I + t] = (A / C) & 255;
        return I + g;
    }),
    (v.prototype.writeUIntBE = function (A, I, g, B) {
        ((A = +A), (I |= 0), (g |= 0), B) || wA(this, A, I, g, Math.pow(2, 8 * g) - 1, 0);
        var C = g - 1,
            t = 1;
        for (this[I + C] = 255 & A; --C >= 0 && (t *= 256); ) this[I + C] = (A / t) & 255;
        return I + g;
    }),
    (v.prototype.writeUInt8 = function (A, I, g) {
        return (A = +A), (I |= 0), g || wA(this, A, I, 1, 255, 0), v.TYPED_ARRAY_SUPPORT || (A = Math.floor(A)), (this[I] = 255 & A), I + 1;
    }),
    (v.prototype.writeUInt16LE = function (A, I, g) {
        return (
            (A = +A),
            (I |= 0),
            g || wA(this, A, I, 2, 65535, 0),
            v.TYPED_ARRAY_SUPPORT ? ((this[I] = 255 & A), (this[I + 1] = A >>> 8)) : DA(this, A, I, !0),
            I + 2
        );
    }),
    (v.prototype.writeUInt16BE = function (A, I, g) {
        return (
            (A = +A),
            (I |= 0),
            g || wA(this, A, I, 2, 65535, 0),
            v.TYPED_ARRAY_SUPPORT ? ((this[I] = A >>> 8), (this[I + 1] = 255 & A)) : DA(this, A, I, !1),
            I + 2
        );
    }),
    (v.prototype.writeUInt32LE = function (A, I, g) {
        return (
            (A = +A),
            (I |= 0),
            g || wA(this, A, I, 4, 4294967295, 0),
            v.TYPED_ARRAY_SUPPORT
                ? ((this[I + 3] = A >>> 24), (this[I + 2] = A >>> 16), (this[I + 1] = A >>> 8), (this[I] = 255 & A))
                : cA(this, A, I, !0),
            I + 4
        );
    }),
    (v.prototype.writeUInt32BE = function (A, I, g) {
        return (
            (A = +A),
            (I |= 0),
            g || wA(this, A, I, 4, 4294967295, 0),
            v.TYPED_ARRAY_SUPPORT
                ? ((this[I] = A >>> 24), (this[I + 1] = A >>> 16), (this[I + 2] = A >>> 8), (this[I + 3] = 255 & A))
                : cA(this, A, I, !1),
            I + 4
        );
    }),
    (v.prototype.writeIntLE = function (A, I, g, B) {
        if (((A = +A), (I |= 0), !B)) {
            var C = Math.pow(2, 8 * g - 1);
            wA(this, A, I, g, C - 1, -C);
        }
        var t = 0,
            Q = 1,
            E = 0;
        for (this[I] = 255 & A; ++t < g && (Q *= 256); )
            A < 0 && 0 === E && 0 !== this[I + t - 1] && (E = 1), (this[I + t] = (((A / Q) | 0) - E) & 255);
        return I + g;
    }),
    (v.prototype.writeIntBE = function (A, I, g, B) {
        if (((A = +A), (I |= 0), !B)) {
            var C = Math.pow(2, 8 * g - 1);
            wA(this, A, I, g, C - 1, -C);
        }
        var t = g - 1,
            Q = 1,
            E = 0;
        for (this[I + t] = 255 & A; --t >= 0 && (Q *= 256); )
            A < 0 && 0 === E && 0 !== this[I + t + 1] && (E = 1), (this[I + t] = (((A / Q) | 0) - E) & 255);
        return I + g;
    }),
    (v.prototype.writeInt8 = function (A, I, g) {
        return (
            (A = +A),
            (I |= 0),
            g || wA(this, A, I, 1, 127, -128),
            v.TYPED_ARRAY_SUPPORT || (A = Math.floor(A)),
            A < 0 && (A = 255 + A + 1),
            (this[I] = 255 & A),
            I + 1
        );
    }),
    (v.prototype.writeInt16LE = function (A, I, g) {
        return (
            (A = +A),
            (I |= 0),
            g || wA(this, A, I, 2, 32767, -32768),
            v.TYPED_ARRAY_SUPPORT ? ((this[I] = 255 & A), (this[I + 1] = A >>> 8)) : DA(this, A, I, !0),
            I + 2
        );
    }),
    (v.prototype.writeInt16BE = function (A, I, g) {
        return (
            (A = +A),
            (I |= 0),
            g || wA(this, A, I, 2, 32767, -32768),
            v.TYPED_ARRAY_SUPPORT ? ((this[I] = A >>> 8), (this[I + 1] = 255 & A)) : DA(this, A, I, !1),
            I + 2
        );
    }),
    (v.prototype.writeInt32LE = function (A, I, g) {
        return (
            (A = +A),
            (I |= 0),
            g || wA(this, A, I, 4, 2147483647, -2147483648),
            v.TYPED_ARRAY_SUPPORT
                ? ((this[I] = 255 & A), (this[I + 1] = A >>> 8), (this[I + 2] = A >>> 16), (this[I + 3] = A >>> 24))
                : cA(this, A, I, !0),
            I + 4
        );
    }),
    (v.prototype.writeInt32BE = function (A, I, g) {
        return (
            (A = +A),
            (I |= 0),
            g || wA(this, A, I, 4, 2147483647, -2147483648),
            A < 0 && (A = 4294967295 + A + 1),
            v.TYPED_ARRAY_SUPPORT
                ? ((this[I] = A >>> 24), (this[I + 1] = A >>> 16), (this[I + 2] = A >>> 8), (this[I + 3] = 255 & A))
                : cA(this, A, I, !1),
            I + 4
        );
    }),
    (v.prototype.writeFloatLE = function (A, I, g) {
        return uA(this, A, I, !0, g);
    }),
    (v.prototype.writeFloatBE = function (A, I, g) {
        return uA(this, A, I, !1, g);
    }),
    (v.prototype.writeDoubleLE = function (A, I, g) {
        return GA(this, A, I, !0, g);
    }),
    (v.prototype.writeDoubleBE = function (A, I, g) {
        return GA(this, A, I, !1, g);
    }),
    (v.prototype.copy = function (A, I, g, B) {
        if ((g || (g = 0), B || 0 === B || (B = this.length), I >= A.length && (I = A.length), I || (I = 0), B > 0 && B < g && (B = g), B === g))
            return 0;
        if (0 === A.length || 0 === this.length) return 0;
        if (I < 0) throw new RangeError("targetStart out of bounds");
        if (g < 0 || g >= this.length) throw new RangeError("sourceStart out of bounds");
        if (B < 0) throw new RangeError("sourceEnd out of bounds");
        B > this.length && (B = this.length), A.length - I < B - g && (B = A.length - I + g);
        var C,
            t = B - g;
        if (this === A && g < I && I < B) for (C = t - 1; C >= 0; --C) A[C + I] = this[C + g];
        else if (t < 1e3 || !v.TYPED_ARRAY_SUPPORT) for (C = 0; C < t; ++C) A[C + I] = this[C + g];
        else Uint8Array.prototype.set.call(A, this.subarray(g, g + t), I);
        return t;
    }),
    (v.prototype.fill = function (A, I, g, B) {
        if ("string" == typeof A) {
            if (
                ("string" == typeof I ? ((B = I), (I = 0), (g = this.length)) : "string" == typeof g && ((B = g), (g = this.length)), 1 === A.length)
            ) {
                var C = A.charCodeAt(0);
                C < 256 && (A = C);
            }
            if (void 0 !== B && "string" != typeof B) throw new TypeError("encoding must be a string");
            if ("string" == typeof B && !v.isEncoding(B)) throw new TypeError("Unknown encoding: " + B);
        } else "number" == typeof A && (A &= 255);
        if (I < 0 || this.length < I || this.length < g) throw new RangeError("Out of range index");
        if (g <= I) return this;
        var t;
        if (((I >>>= 0), (g = void 0 === g ? this.length : g >>> 0), A || (A = 0), "number" == typeof A)) for (t = I; t < g; ++t) this[t] = A;
        else {
            var Q = j(A) ? A : SA(new v(A, B).toString()),
                E = Q.length;
            for (t = 0; t < g - I; ++t) this[t + I] = Q[t % E];
        }
        return this;
    });
var FA = /[^+\/0-9A-Za-z-_]/g;
function RA(A) {
    return A < 16 ? "0" + A.toString(16) : A.toString(16);
}
function SA(A, I) {
    var g;
    I = I || 1 / 0;
    for (var B = A.length, C = null, t = [], Q = 0; Q < B; ++Q) {
        if ((g = A.charCodeAt(Q)) > 55295 && g < 57344) {
            if (!C) {
                if (g > 56319) {
                    (I -= 3) > -1 && t.push(239, 191, 189);
                    continue;
                }
                if (Q + 1 === B) {
                    (I -= 3) > -1 && t.push(239, 191, 189);
                    continue;
                }
                C = g;
                continue;
            }
            if (g < 56320) {
                (I -= 3) > -1 && t.push(239, 191, 189), (C = g);
                continue;
            }
            g = 65536 + (((C - 55296) << 10) | (g - 56320));
        } else C && (I -= 3) > -1 && t.push(239, 191, 189);
        if (((C = null), g < 128)) {
            if ((I -= 1) < 0) break;
            t.push(g);
        } else if (g < 2048) {
            if ((I -= 2) < 0) break;
            t.push((g >> 6) | 192, (63 & g) | 128);
        } else if (g < 65536) {
            if ((I -= 3) < 0) break;
            t.push((g >> 12) | 224, ((g >> 6) & 63) | 128, (63 & g) | 128);
        } else {
            if (!(g < 1114112)) throw new Error("Invalid code point");
            if ((I -= 4) < 0) break;
            t.push((g >> 18) | 240, ((g >> 12) & 63) | 128, ((g >> 6) & 63) | 128, (63 & g) | 128);
        }
    }
    return t;
}
function pA(A) {
    return (function (A) {
        var I, g, B, C, t, Q;
        q || Y();
        var E = A.length;
        if (E % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
        (t = "=" === A[E - 2] ? 2 : "=" === A[E - 1] ? 1 : 0), (Q = new J((3 * E) / 4 - t)), (B = t > 0 ? E - 4 : E);
        var i = 0;
        for (I = 0, g = 0; I < B; I += 4, g += 3)
            (C = (M[A.charCodeAt(I)] << 18) | (M[A.charCodeAt(I + 1)] << 12) | (M[A.charCodeAt(I + 2)] << 6) | M[A.charCodeAt(I + 3)]),
                (Q[i++] = (C >> 16) & 255),
                (Q[i++] = (C >> 8) & 255),
                (Q[i++] = 255 & C);
        return (
            2 === t
                ? ((C = (M[A.charCodeAt(I)] << 2) | (M[A.charCodeAt(I + 1)] >> 4)), (Q[i++] = 255 & C))
                : 1 === t &&
                  ((C = (M[A.charCodeAt(I)] << 10) | (M[A.charCodeAt(I + 1)] << 4) | (M[A.charCodeAt(I + 2)] >> 2)),
                  (Q[i++] = (C >> 8) & 255),
                  (Q[i++] = 255 & C)),
            Q
        );
    })(
        (function (A) {
            if (
                (A = (function (A) {
                    return A.trim ? A.trim() : A.replace(/^\s+|\s+$/g, "");
                })(A).replace(FA, "")).length < 2
            )
                return "";
            for (; A.length % 4 != 0; ) A += "=";
            return A;
        })(A)
    );
}
function UA(A, I, g, B) {
    for (var C = 0; C < B && !(C + g >= I.length || C >= A.length); ++C) I[C + g] = A[C];
    return C;
}
function lA(A) {
    return !!A.constructor && "function" == typeof A.constructor.isBuffer && A.constructor.isBuffer(A);
}
const dA = 9,
    LA = 15,
    kA = 16,
    NA = 22,
    MA = 37,
    JA = 43,
    qA = 76,
    YA = 83,
    mA = 97,
    HA = 100,
    _A = 103,
    xA = 109,
    KA = 165,
    TA = 166;
class bA {
    constructor() {
        (this.vkFormat = 0),
            (this.typeSize = 1),
            (this.pixelWidth = 0),
            (this.pixelHeight = 0),
            (this.pixelDepth = 0),
            (this.layerCount = 0),
            (this.faceCount = 1),
            (this.supercompressionScheme = 0),
            (this.levels = []),
            (this.dataFormatDescriptor = [
                {
                    vendorId: 0,
                    descriptorType: 0,
                    descriptorBlockSize: 0,
                    versionNumber: 2,
                    colorModel: 0,
                    colorPrimaries: 1,
                    transferFunction: 2,
                    flags: 0,
                    texelBlockDimension: [0, 0, 0, 0],
                    bytesPlane: [0, 0, 0, 0, 0, 0, 0, 0],
                    samples: [],
                },
            ]),
            (this.keyValue = {}),
            (this.globalData = null);
    }
}
class PA {
    constructor(A, I, g, B) {
        (this._dataView = new DataView(A.buffer, A.byteOffset + I, g)), (this._littleEndian = B), (this._offset = 0);
    }
    _nextUint8() {
        const A = this._dataView.getUint8(this._offset);
        return (this._offset += 1), A;
    }
    _nextUint16() {
        const A = this._dataView.getUint16(this._offset, this._littleEndian);
        return (this._offset += 2), A;
    }
    _nextUint32() {
        const A = this._dataView.getUint32(this._offset, this._littleEndian);
        return (this._offset += 4), A;
    }
    _nextUint64() {
        const A =
            this._dataView.getUint32(this._offset, this._littleEndian) + 2 ** 32 * this._dataView.getUint32(this._offset + 4, this._littleEndian);
        return (this._offset += 8), A;
    }
    _nextInt32() {
        const A = this._dataView.getInt32(this._offset, this._littleEndian);
        return (this._offset += 4), A;
    }
    _skip(A) {
        return (this._offset += A), this;
    }
    _scan(A, I = 0) {
        const g = this._offset;
        let B = 0;
        for (; this._dataView.getUint8(this._offset) !== I && B < A; ) B++, this._offset++;
        return B < A && this._offset++, new Uint8Array(this._dataView.buffer, this._dataView.byteOffset + g, B);
    }
}
const vA = [171, 75, 84, 88, 32, 50, 48, 187, 13, 10, 26, 10];
function OA(A) {
    return "undefined" != typeof TextDecoder ? new TextDecoder().decode(A) : v.from(A).toString("utf8");
}
let VA, XA, WA;
const ZA = {
    env: {
        emscripten_notify_memory_growth: function (A) {
            WA = new Uint8Array(XA.exports.memory.buffer);
        },
    },
};
class jA {
    init() {
        return (
            VA ||
            ((VA =
                "undefined" != typeof fetch
                    ? fetch("data:application/wasm;base64," + zA)
                          .then((A) => A.arrayBuffer())
                          .then((A) => WebAssembly.instantiate(A, ZA))
                          .then(this._init)
                    : WebAssembly.instantiate(v.from(zA, "base64"), ZA).then(this._init)),
            VA)
        );
    }
    _init(A) {
        (XA = A.instance), ZA.env.emscripten_notify_memory_growth(0);
    }
    decode(A, I = 0) {
        if (!XA) throw new Error("ZSTDDecoder: Await .init() before decoding.");
        const g = A.byteLength,
            B = XA.exports.malloc(g);
        WA.set(A, B), (I = I || Number(XA.exports.ZSTD_findDecompressedSize(B, g)));
        const C = XA.exports.malloc(I),
            t = XA.exports.ZSTD_decompress(C, I, B, g),
            Q = WA.slice(C, C + t);
        return XA.exports.free(B), XA.exports.free(C), Q;
    }
}
const zA =
        "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IAMNACAEQQNxBEADQCACRQ0FIAAgAkF/aiICaiIDIAEgAmotAAA6AAAgA0EDcQ0ACwsgAkEDTQ0AA0AgACACQXxqIgJqIAEgAmooAgA2AgAgAkEDSw0ACwsgAkUNAgNAIAAgAkF/aiICaiABIAJqLQAAOgAAIAINAAsMAgsgAkEDTQ0AIAIhBANAIAMgASgCADYCACABQQRqIQEgA0EEaiEDIARBfGoiBEEDSw0ACyACQQNxIQILIAJFDQADQCADIAEtAAA6AAAgA0EBaiEDIAFBAWohASACQX9qIgINAAsLIAAL8wICAn8BfgJAIAJFDQAgACACaiIDQX9qIAE6AAAgACABOgAAIAJBA0kNACADQX5qIAE6AAAgACABOgABIANBfWogAToAACAAIAE6AAIgAkEHSQ0AIANBfGogAToAACAAIAE6AAMgAkEJSQ0AIABBACAAa0EDcSIEaiIDIAFB/wFxQYGChAhsIgE2AgAgAyACIARrQXxxIgRqIgJBfGogATYCACAEQQlJDQAgAyABNgIIIAMgATYCBCACQXhqIAE2AgAgAkF0aiABNgIAIARBGUkNACADIAE2AhggAyABNgIUIAMgATYCECADIAE2AgwgAkFwaiABNgIAIAJBbGogATYCACACQWhqIAE2AgAgAkFkaiABNgIAIAQgA0EEcUEYciIEayICQSBJDQAgAa0iBUIghiAFhCEFIAMgBGohAQNAIAEgBTcDGCABIAU3AxAgASAFNwMIIAEgBTcDACABQSBqIQEgAkFgaiICQR9LDQALCyAACy8BAn8gACgCBCAAKAIAQQJ0aiICLQACIQMgACACLwEAIAEgAi0AAxAIajYCACADCy8BAn8gACgCBCAAKAIAQQJ0aiICLQACIQMgACACLwEAIAEgAi0AAxAFajYCACADCx8AIAAgASACKAIEEAg2AgAgARAEGiAAIAJBCGo2AgQLCAAgAGdBH3MLugUBDX8jAEEQayIKJAACfyAEQQNNBEAgCkEANgIMIApBDGogAyAEEAsaIAAgASACIApBDGpBBBAVIgBBbCAAEAMbIAAgACAESxsMAQsgAEEAIAEoAgBBAXRBAmoQECENQVQgAygAACIGQQ9xIgBBCksNABogAiAAQQVqNgIAIAMgBGoiAkF8aiEMIAJBeWohDiACQXtqIRAgAEEGaiELQQQh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ASIDNgLE4AEgACgCvOABIQQgACABNgK84AEgACABIAJqNgK44AEgACABIAQgA2tqNgLA4AELpgEBAX8gACAAKALs4QEQFjYCyOABIABCADcD+OABIABCADcDuOABIABBwOABakIANwMAIABBqNAAaiIBQYyAgOAANgIAIABBADYCmOIBIABCADcDiOEBIABCAzcDgOEBIABBrNABakHgEikCADcCACAAQbTQAWpB6BIoAgA2AgAgACABNgIMIAAgAEGYIGo2AgggACAAQaAwajYCBCAAIABBEGo2AgALYQEBf0G4fyEDAkAgAUEDSQ0AIAIgABAhIgFBA3YiADYCCCACIAFBAXE2AgQgAiABQQF2QQNxIgM2AgACQCADQX9qIgFBAksNAAJAIAFBAWsOAgEAAgtBbA8LIAAhAwsgAwsMACAAIAEgAkEAEC4LiAQCA38CfiADEBYhBCAAQQBBKBAQIQAgBCACSwRAIAQPCyABRQRAQX8PCwJAAkAgA0EBRg0AIAEoAAAiBkGo6r5pRg0AQXYhAyAGQXBxQdDUtMIBRw0BQQghAyACQQhJDQEgAEEAQSgQECEAIAEoAAQhASAAQQE2AhQgACABrTcDAEEADwsgASACIAMQLyIDIAJLDQAgACADNgIYQXIhAyABIARqIgVBf2otAAAiAkEIcQ0AIAJBIHEiBkUEQEFwIQMgBS0AACIFQacBSw0BIAVBB3GtQgEgBUEDdkEKaq2GIgdCA4h+IAd8IQggBEEBaiEECyACQQZ2IQMgAkECdiEFAkAgAkEDcUF/aiICQQJLBEBBACECDAELAkACQAJAIAJBAWsOAgECAAsgASAEai0AACECIARBAWohBAwCCyABIARqLwAAIQIgBEECaiEEDAELIAEgBGooAAAhAiAEQQRqIQQLIAVBAXEhBQJ+AkACQAJAIANBf2oiA0ECTQRAIANBAWsOAgIDAQtCfyAGRQ0DGiABIARqMQAADAMLIAEgBGovAACtQoACfAwCCyABIARqKAAArQwBCyABIARqKQAACyEHIAAgBTYCICAAIAI2AhwgACAHNwMAQQAhAyAAQQA2AhQgACAHIAggBhsiBzcDCCAAIAdCgIAIIAdCgIAIVBs+AhALIAMLWwEBf0G4fyEDIAIQFiICIAFNBH8gACACakF/ai0AACIAQQNxQQJ0QaAeaigC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C0Egak8NAQsgByAHKQNoNwMQIAcgBykDYDcDCCAEIA0gB0EIaiAHQdwAaiAPIA4gESAQEB4hCwwBCyACIARqIQggBCAKEAcgAkERTwRAIARBEGohAgNAIAIgCkEQaiIKEAcgAkEQaiICIAhJDQALCyAIIAlrIQIgByATNgJcIAkgCCAOa0sEQCAJIAggEWtLBEBBbCELDAILIBAgAiAOayICaiIKIANqIBBNBEAgCCAKIAMQDxoMAgsgCCAKQQAgAmsQDyEIIAcgAiADaiIDNgJkIAggAmshCCAOIQILIAlBEE8EQCADIAhqIQMDQCAIIAIQByACQRBqIQIgCEEQaiIIIANJDQALDAELAkAgCUEHTQRAIAggAi0AADoAACAIIAItAAE6AAEgCCACLQACOgACIAggAi0AAzoAAyAIQQRqIAIgCUECdCIDQcAeaigCAGoiAhAXIAIgA0HgHmooAgBrIQIgBygCZCEDDAELIAggAhAMCyADQQlJDQAgAyAIaiEDIAhBCGoiCCACQQhqIgJrQQ9MBEADQCAIIAIQDCACQQhqIQIgCEEIaiIIIANJDQAMAgALAAsDQCAIIAIQByACQRBqIQIgCEEQaiIIIANJDQALCyAHQRhqEAQaIAsgDCALEAMiAhshDCAEIAQgC2ogAhshBCAFQX9qIgUNAAsgDBADDQFBbCEMIAdBGGoQBEECSQ0BQQAhCANAIAhBA0cEQCAAIAhBAnQiAmpBrNABaiACIAdqKAJENgIAIAhBAWohCAwBCwsgBygCXCEIC0G6fyEMIA8gCGsiACANIARrSw0AIAQEfyAEIAggABALIABqBUEACyABayEMCyAHQfAAaiQAIAwLkRcCFn8FfiMAQdABayIHJAAgByAAKALw4QEiCDYCvAEgASACaiESIAggACgCgOIBaiETAkACQCAFRQRAIAEhAwwBCyAAKALE4AEhESAAKALA4AEhFSAAKAK84AEhDyAAQQE2AozhAUEAIQgDQCAIQQNHBEAgByAIQQJ0IgJqIAAgAmpBrNABaigCADYCVCAIQQFqIQgMAQsLIAcgETYCZCAHIA82AmAgByABIA9rNgJoQWwhECAHQShqIAMgBBAGEAMNASAFQQQgBUEESBshFyAHQTxqIAdBKGogACgCABATIAdBxABqIAdBKGogACgCCBATIAdBzABqIAdBKGogACgCBBATQQAhBCAHQeAAaiEMIAdB5ABqIQoDQCAHQShqEARBAksgBCAXTnJFBEAgBygCQCAHKAI8QQN0aikCACIdQhCIp0H/AXEhCyAHKAJQIAcoAkxBA3RqKQIAIh5CEIinQf8BcSEJIAcoAkggBygCREEDdGopAgAiH0IgiKchCCAeQiCIISAgHUIgiKchAgJAIB9CEIinQf8BcSIDQQJPBEACQCAGRSADQRlJckUEQCAIIAdBKGogA0EgIAcoAixrIg0gDSADSxsiDRAFIAMgDWsiA3RqIQggB0EoahAEGiADRQ0BIAdBKGogAxAFIAhqIQgMAQsgB0EoaiADEAUgCGohCCAHQShqEAQaCyAHKQJUISEgByAINgJUIAcgITcDWAwBCwJAIANFBEAgAgRAIAcoAlQhCAwDCyAHKAJYIQgMAQsCQAJAIAdBKGpBARAFIAggAkVqaiIDQQNGBEAgBygCVEF/aiIDIANFaiEIDAELIANBAnQgB2ooAlQiCCAIRWohCCADQQFGDQELIAcgBygCWDYCXAsLIAcgBygCVDYCWCAHIAg2AlQLICCnIQMgCQRAIAdBKGogCRAFIANqIQMLIAkgC2pBFE8EQCAHQShqEAQaCyALBEAgB0EoaiALEAUgAmohAgsgB0EoahAEGiAHIAcoAmggAmoiCSADajYCaCAKIAwgCCAJSxsoAgAhDSAHIAdBKGogHUIYiKdB/wFxEAggHadB//8DcWo2AjwgByAHQShqIB5CGIinQf8BcRAIIB6nQf//A3FqNgJMIAdBKGoQBBogB0EoaiAfQhiIp0H/AXEQCCEOIAdB8ABqIARBBHRqIgsgCSANaiAIazYCDCALIAg2AgggCyADNgIEIAsgAjYCACAHIA4gH6dB//8DcWo2AkQgBEEBaiEEDAELCyAEIBdIDQEgEkFgaiEYIAdB4ABqIRogB0HkAGohGyABIQMDQCAHQShqEARBAksgBCAFTnJFBEAgBygCQCAHKAI8QQN0aikCACIdQhCIp0H/AXEhCyAHKAJQIAcoAkxBA3RqKQIAIh5CEIinQf8BcSEIIAcoAkggBygCREEDdGopAgAiH0IgiKchCSAeQiCIISAgHUIgiKchDAJAIB9CEIinQf8BcSICQQJPBEACQCAGRSACQRlJckUEQCAJIAdBKGogAkEgIAcoAixrIgogCiACSxsiChAFIAIgCmsiAnRqIQkgB0EoahAEGiACRQ0BIAdBKGogAhAFIAlqIQkMAQsgB0EoaiACEAUgCWohCSAHQShqEAQaCyAHKQJUISEgByAJNgJUIAcgITcDWAwBCwJAIAJFBEAgDARAIAcoAlQhCQwDCyAHKAJYIQkMAQsCQAJAIAdBKGpBARAFIAkgDEVqaiICQQNGBEAgBygCVEF/aiICIAJFaiEJDAELIAJBAnQgB2ooAlQiCSAJRWohCSACQQFGDQELIAcgBygCWDYCXAsLIAcgBygCVDYCWCAHIAk2AlQLICCnIRQgCARAIAdBKGogCBAFIBRqIRQLIAggC2pBFE8EQCAHQShqEAQaCyALBEAgB0EoaiALEAUgDGohDAsgB0EoahAEGiAHIAcoAmggDGoiGSAUajYCaCAbIBogCSAZSxsoAgAhHCAHIAdBKGogHUIYiKdB/wFxEAggHadB//8DcWo2AjwgByAHQShqIB5CGIinQf8BcRAIIB6nQf//A3FqNgJMIAdBKGoQBBogByAHQShqIB9CGIinQf8BcRAIIB+nQf//A3FqNgJEIAcgB0HwAGogBEEDcUEEdGoiDSkDCCIdNwPIASAHIA0pAwAiHjcDwAECQAJAAkAgBygCvAEiDiAepyICaiIWIBNLDQAgAyAHKALEASIKIAJqIgtqIBhLDQAgEiADayALQSBqTw0BCyAHIAcpA8gBNwMQIAcgBykDwAE3AwggAyASIAdBCGogB0G8AWogEyAPIBUgERAeIQsMAQsgAiADaiEIIAMgDhAHIAJBEU8EQCADQRBqIQIDQCACIA5BEGoiDhAHIAJBEGoiAiAISQ0ACwsgCCAdpyIOayECIAcgFjYCvAEgDiAIIA9rSwRAIA4gCCAVa0sEQEFsIQsMAgsgESACIA9rIgJqIhYgCmogEU0EQCAIIBYgChAPGgwCCyAIIBZBACACaxAPIQggByACIApqIgo2AsQBIAggAmshCCAPIQILIA5BEE8EQCAIIApqIQoDQCAIIAIQByACQRBqIQIgCEEQaiIIIApJDQALDAELAkAgDkEHTQRAIAggAi0AADoAACAIIAItAAE6AAEgCCACLQACOgACIAggAi0AAzoAAyAIQQRqIAIgDkECdCIKQcAeaigCAGoiAhAXIAIgCkHgHmooAgBrIQIgBygCxAEhCgwBCyAIIAIQDAsgCkEJSQ0AIAggCmohCiAIQQhqIgggAkEIaiICa0EPTARAA0AgCCACEAwgAkEIaiECIAhBCGoiCCAKSQ0ADAIACwALA0AgCCACEAcgAkEQaiECIAhBEGoiCCAKSQ0ACwsgCxADBEAgCyEQDAQFIA0gDDYCACANIBkgHGogCWs2AgwgDSAJNgIIIA0gFDYCBCAEQQFqIQQgAyALaiEDDAILAAsLIAQgBUgNASAEIBdrIQtBACEEA0AgCyAFSARAIAcgB0HwAGogC0EDcUEEdGoiAikDCCIdNwPIASAHIAIpAwAiHjcDwAECQAJAAkAgBygCvAEiDCAepyICaiIKIBNLDQAgAyAHKALEASIJIAJqIhBqIBhLDQAgEiADayAQQSBqTw0BCyAHIAcpA8gBNwMgIAcgBykDwAE3AxggAyASIAdBGGogB0G8AWogEyAPIBUgERAeIRAMAQsgAiADaiEIIAMgDBAHIAJBEU8EQCADQRBqIQIDQCACIAxBEGoiDBAHIAJBEGoiAiAISQ0ACwsgCCAdpyIGayECIAcgCjYCvAEgBiAIIA9rSwRAIAYgCCAVa0sEQEFsIRAMAgsgESACIA9rIgJqIgwgCWogEU0EQCAIIAwgCRAPGgwCCyAIIAxBACACaxAPIQggByACIAlqIgk2AsQBIAggAmshCCAPIQILIAZBEE8EQCAIIAlqIQYDQCAIIAIQByACQRBqIQIgCEEQaiIIIAZJDQALDAELAkAgBkEHTQRAIAggAi0AADoAACAIIAItAAE6AAEgCCACLQACOgACIAggAi0AAzoAAyAIQQRqIAIgBkECdCIGQcAeaigCAGoiAhAXIAIgBkHgHmooAgBrIQIgBygCxAEhCQwBCyAIIAIQDAsgCUEJSQ0AIAggCWohBiAIQQhqIgggAkEIaiICa0EPTARAA0AgCCACEAwgAkEIaiECIAhBCGoiCCAGSQ0ADAIACwALA0AgCCACEAcgAkEQaiECIAhBEGoiCCAGSQ0ACwsgEBADDQMgC0EBaiELIAMgEGohAwwBCwsDQCAEQQNHBEAgACAEQQJ0IgJqQazQAWogAiAHaigCVDYCACAEQQFqIQQMAQsLIAcoArwBIQgLQbp/IRAgEyAIayIAIBIgA2tLDQAgAwR/IAMgCCAAEAsgAGoFQQALIAFrIRALIAdB0AFqJAAgEAslACAAQgA3AgAgAEEAOwEIIABBADoACyAAIAE2AgwgACACOgAKC7QFAQN/IwBBMGsiBCQAIABB/wFqIgVBfWohBgJAIAMvAQIEQCAEQRhqIAEgAhAGIgIQAw0BIARBEGogBEEYaiADEBwgBEEIaiAEQRhqIAMQHCAAIQMDQAJAIARBGGoQBCADIAZPckUEQCADIARBEGogBEEYahASOgAAIAMgBEEIaiAEQRhqEBI6AAEgBEEYahAERQ0BIANBAmohAwsgBUF+aiEFAn8DQEG6fyECIAMiASAFSw0FIAEgBEEQaiAEQRhqEBI6AAAgAUEBaiEDIARBGGoQBEEDRgRAQQIhAiAEQQhqDAILIAMgBUsNBSABIARBCGogBEEYahASOgABIAFBAmohA0EDIQIgBEEYahAEQQNHDQALIARBEGoLIQUgAyAFIARBGGoQEjoAACABIAJqIABrIQIMAwsgAyAEQRBqIARBGGoQEjoAAiADIARBCGogBEEYahASOgADIANBBGohAwwAAAsACyAEQRhqIAEgAhAGIgIQAw0AIARBEGogBEEYaiADEBwgBEEIaiAEQRhqIAMQHCAAIQMDQAJAIARBGGoQBCADIAZPckUEQCADIARBEGogBEEYahAROgAAIAMgBEEIaiAEQRhqEBE6AAEgBEEYahAERQ0BIANBAmohAwsgBUF+aiEFAn8DQEG6fyECIAMiASAFSw0EIAEgBEEQaiAEQRhqEBE6AAAgAUEBaiEDIARBGGoQBEEDRgRAQQIhAiAEQQhqDAILIAMgBUsNBCABIARBCGogBEEYahAROgABIAFBAmohA0EDIQIgBEEYahAEQQNHDQALIARBEGoLIQUgAyAFIARBGGoQEToAACABIAJqIABrIQIMAgsgAyAEQRBqIARBGGoQEToAAiADIARBCGogBEEYahAROgADIANBBGohAwwAAAsACyAEQTBqJAAgAgtpAQF/An8CQAJAIAJBB00NACABKAAAQbfIwuF+Rw0AIAAgASgABDYCmOIBQWIgAEEQaiABIAIQPiIDEAMNAhogAEKBgICAEDcDiOEBIAAgASADaiACIANrECoMAQsgACABIAIQKgtBAAsLrQMBBn8jAEGAAWsiAyQAQWIhCAJAIAJBCUkNACAAQZjQAGogAUEIaiIEIAJBeGogAEGY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wOABCwutAgIEfwF+IwBBQGoiBCQAAkACQCACQQhJDQAgASgAAEFwcUHQ1LTCAUcNACABIAIQIiEBIABCADcDCCAAQQA2AgQgACABNgIADAELIARBGGogASACEC0iAxADBEAgACADEBoMAQsgAwRAIABBuH8QGgwBCyACIAQoAjAiA2shAiABIANqIQMDQAJAIAAgAyACIARBCGoQLCIFEAMEfyAFBSACIAVBA2oiBU8NAUG4fwsQGgwCCyAGQQFqIQYgAiAFayECIAMgBWohAyAEKAIMRQ0ACyAEKAI4BEAgAkEDTQRAIABBuH8QGgwCCyADQQRqIQMLIAQoAighAiAEKQMYIQcgAEEANgIEIAAgAyABazYCACAAIAIgBmytIAcgB0J/URs3AwgLIARBQGskAAslAQF/IwBBEGsiAiQAIAIgACABEFEgAigCACEAIAJBEGokACAAC30BBH8jAEGQBGsiBCQAIARB/wE2AggCQCAEQRBqIARBCGogBEEMaiABIAIQFSIGEAMEQCAGIQUMAQtBVCEFIAQoAgwiB0EGSw0AIAMgBEEQaiAEKAIIIAcQQSIFEAMNACAAIAEgBmogAiAGayADEDwhBQsgBEGQBGokACAFC4cBAgJ/An5BABAWIQMCQANAIAEgA08EQAJAIAAoAABBcHFB0NS0wgFGBEAgACABECIiAhADRQ0BQn4PCyAAIAEQVSIEQn1WDQMgBCAFfCIFIARUIQJCfiEEIAINAyAAIAEQUiICEAMNAwsgASACayEBIAAgAmohAAwBCwtCfiAFIAEbIQQLIAQLPwIBfwF+IwBBMGsiAiQAAn5CfiACQQhqIAAgARAtDQAaQgAgAigCHEEBRg0AGiACKQMICyEDIAJBMGokACADC40BAQJ/IwBBMGsiASQAAkAgAEUNACAAKAKI4gENACABIABB/OEBaigCADYCKCABIAApAvThATcDICAAEDAgACgCqOIBIQIgASABKAIoNgIYIAEgASkDIDcDECACIAFBEGoQGyAAQQA2AqjiASABIAEoAig2AgggASABKQMgNwMAIAAgARAbCyABQTBqJAALKgECfyMAQRBrIgAkACAAQQA2AgggAEIANwMAIAAQWCEBIABBEGokACABC4cBAQN/IwBBEGsiAiQAAkAgACgCAEUgACgCBEVzDQAgAiAAKAIINgIIIAIgACkCADcDAAJ/IAIoAgAiAQRAIAIoAghBqOMJIAERBQAMAQtBqOMJECgLIgFFDQAgASAAKQIANwL04QEgAUH84QFqIAAoAgg2AgAgARBZIAEhAwsgAkEQaiQAIAMLywEBAn8jAEEgayIBJAAgAEGBgIDAADYCtOIBIABBADYCiOIBIABBADYC7OEBIABCADcDkOIBIABBADYCpOMJIABBADYC3OIBIABCADcCzOIBIABBADYCvOIBIABBADYCxOABIABCADcCnOIBIABBpOIBakIANwIAIABBrOIBakEANgIAIAFCADcCECABQgA3AhggASABKQMYNwMIIAEgASkDEDcDACABKAIIQQh2QQFxIQIgAEEANgLg4gEgACACNgKM4gEgAUEgaiQAC3YBA38jAEEwayIBJAAgAARAIAEgAEHE0AFqIgIoAgA2AiggASAAKQK80AE3AyAgACgCACEDIAEgAigCADYCGCABIAApArzQATcDECADIAFBEGoQGyABIAEoAig2AgggASABKQMgNwMAIAAgARAbCyABQTBqJAALzAEBAX8gACABKAK00AE2ApjiASAAIAEoAgQiAjYCwOABIAAgAjYCvOABIAAgAiABKAIIaiICNgK44AEgACACNgLE4AEgASgCuNABBEAgAEKBgICAEDcDiOEBIAAgAUGk0ABqNgIMIAAgAUGUIGo2AgggACABQZwwajYCBCAAIAFBDGo2AgAgAEGs0AFqIAFBqNABaigCADYCACAAQbDQAWogAUGs0AFqKAIANgIAIABBtNABaiABQbDQAWooAgA2AgAPCyAAQgA3A4jhAQs7ACACRQRAQbp/DwsgBEUEQEFsDwsgAiAEEGAEQCAAIAEgAiADIAQgBRBhDwsgACABIAIgAyAEIAUQZQtGAQF/IwBBEGsiBSQAIAVBCGogBBAOAn8gBS0ACQRAIAAgASACIAMgBBAyDAELIAAgASACIAMgBBA0CyEAIAVBEGokACAACzQAIAAgAyAEIAUQNiIFEAMEQCAFDwsgBSAESQR/IAEgAiADIAVqIAQgBWsgABA1BUG4fwsLRgEBfyMAQRBrIgUkACAFQQhqIAQQDgJ/IAUtAAkEQCAAIAEgAiADIAQQYgwBCyAAIAEgAiADIAQQNQshACAFQRBqJAAgAAtZAQF/QQ8hAiABIABJBEAgAUEE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",
    $A = new WeakMap();
let AI,
    II = 0;
class gI extends o {
    constructor(A) {
        super(A),
            (this.transcoderPath = ""),
            (this.transcoderBinary = null),
            (this.transcoderPending = null),
            (this.workerPool = new L()),
            (this.workerSourceURL = ""),
            (this.workerConfig = null),
            "undefined" != typeof MSC_TRANSCODER &&
                console.warn(
                    'THREE.KTX2Loader: Please update to latest "basis_transcoder". "msc_basis_transcoder" is no longer supported in three.js r125+.'
                );
    }
    setTranscoderPath(A) {
        return (this.transcoderPath = A), this;
    }
    setWorkerLimit(A) {
        return this.workerPool.setWorkerLimit(A), this;
    }
    detectSupport(A) {
        return (
            !0 === A.isWebGPURenderer
                ? (this.workerConfig = {
                      astcSupported: A.hasFeature("texture-compression-astc"),
                      etc1Supported: !1,
                      etc2Supported: A.hasFeature("texture-compression-etc2"),
                      dxtSupported: A.hasFeature("texture-compression-bc"),
                      bptcSupported: !1,
                      pvrtcSupported: !1,
                  })
                : ((this.workerConfig = {
                      astcSupported: A.extensions.has("WEBGL_compressed_texture_astc"),
                      etc1Supported: A.extensions.has("WEBGL_compressed_texture_etc1"),
                      etc2Supported: A.extensions.has("WEBGL_compressed_texture_etc"),
                      dxtSupported: A.extensions.has("WEBGL_compressed_texture_s3tc"),
                      bptcSupported: A.extensions.has("EXT_texture_compression_bptc"),
                      pvrtcSupported: A.extensions.has("WEBGL_compressed_texture_pvrtc") || A.extensions.has("WEBKIT_WEBGL_compressed_texture_pvrtc"),
                  }),
                  A.capabilities.isWebGL2 && (this.workerConfig.etc1Supported = !1)),
            this
        );
    }
    init() {
        if (!this.transcoderPending) {
            const A = new r(this.manager);
            A.setPath(this.transcoderPath), A.setWithCredentials(this.withCredentials);
            const I = A.loadAsync("basis_transcoder.js"),
                g = new r(this.manager);
            g.setPath(this.transcoderPath), g.setResponseType("arraybuffer"), g.setWithCredentials(this.withCredentials);
            const B = g.loadAsync("basis_transcoder.wasm");
            (this.transcoderPending = Promise.all([I, B]).then(([A, I]) => {
                const g = gI.BasisWorker.toString(),
                    B = [
                        "/* constants */",
                        "let _EngineFormat = " + JSON.stringify(gI.EngineFormat),
                        "let _TranscoderFormat = " + JSON.stringify(gI.TranscoderFormat),
                        "let _BasisFormat = " + JSON.stringify(gI.BasisFormat),
                        "/* basis_transcoder.js */",
                        A,
                        "/* worker */",
                        g.substring(g.indexOf("{") + 1, g.lastIndexOf("}")),
                    ].join("\n");
                (this.workerSourceURL = URL.createObjectURL(new Blob([B]))),
                    (this.transcoderBinary = I),
                    this.workerPool.setWorkerCreator(() => {
                        const A = new Worker(this.workerSourceURL),
                            I = this.transcoderBinary.slice(0);
                        return A.postMessage({ type: "init", config: this.workerConfig, transcoderBinary: I }, [I]), A;
                    });
            })),
                II > 0 &&
                    console.warn(
                        "THREE.KTX2Loader: Multiple active KTX2 loaders may cause performance issues. Use a single KTX2Loader instance, or call .dispose() on old instances."
                    ),
                II++;
        }
        return this.transcoderPending;
    }
    load(A, I, g, B) {
        if (null === this.workerConfig) throw new Error("THREE.KTX2Loader: Missing initialization with `.detectSupport( renderer )`.");
        const C = new r(this.manager);
        C.setResponseType("arraybuffer"),
            C.setWithCredentials(this.withCredentials),
            C.load(
                A,
                (A) => {
                    if ($A.has(A)) {
                        return $A.get(A).promise.then(I).catch(B);
                    }
                    this._createTexture(A)
                        .then((A) => (I ? I(A) : null))
                        .catch(B);
                },
                g,
                B
            );
    }
    _createTextureFrom(A, I) {
        const { faces: g, width: B, height: C, format: t, type: Q, error: E, dfdFlags: i } = A;
        if ("error" === Q) return Promise.reject(E);
        let e;
        if (6 === I.faceCount) e = new n(g, t, s);
        else {
            const A = g[0].mipmaps;
            e = I.layerCount > 1 ? new a(A, B, C, I.layerCount, t, s) : new h(A, B, C, t, s);
        }
        return (
            (e.minFilter = 1 === g[0].mipmaps.length ? f : w),
            (e.magFilter = f),
            (e.generateMipmaps = !1),
            (e.needsUpdate = !0),
            (e.colorSpace = QI(I)),
            (e.premultiplyAlpha = !!(1 & i)),
            e
        );
    }
    async _createTexture(A, I = {}) {
        const g = (function (A) {
            const I = new Uint8Array(A.buffer, A.byteOffset, vA.length);
            if (
                I[0] !== vA[0] ||
                I[1] !== vA[1] ||
                I[2] !== vA[2] ||
                I[3] !== vA[3] ||
                I[4] !== vA[4] ||
                I[5] !== vA[5] ||
                I[6] !== vA[6] ||
                I[7] !== vA[7] ||
                I[8] !== vA[8] ||
                I[9] !== vA[9] ||
                I[10] !== vA[10] ||
                I[11] !== vA[11]
            )
                throw new Error("Missing KTX 2.0 identifier.");
            const g = new bA(),
                B = 17 * Uint32Array.BYTES_PER_ELEMENT,
                C = new PA(A, vA.length, B, !0);
            (g.vkFormat = C._nextUint32()),
                (g.typeSize = C._nextUint32()),
                (g.pixelWidth = C._nextUint32()),
                (g.pixelHeight = C._nextUint32()),
                (g.pixelDepth = C._nextUint32()),
                (g.layerCount = C._nextUint32()),
                (g.faceCount = C._nextUint32());
            const t = C._nextUint32();
            g.supercompressionScheme = C._nextUint32();
            const Q = C._nextUint32(),
                E = C._nextUint32(),
                i = C._nextUint32(),
                e = C._nextUint32(),
                o = C._nextUint64(),
                r = C._nextUint64(),
                n = new PA(A, vA.length + B, 3 * t * 8, !0);
            for (let I = 0; I < t; I++)
                g.levels.push({
                    levelData: new Uint8Array(A.buffer, A.byteOffset + n._nextUint64(), n._nextUint64()),
                    uncompressedByteLength: n._nextUint64(),
                });
            const s = new PA(A, Q, E, !0),
                a = {
                    vendorId: s._skip(4)._nextUint16(),
                    descriptorType: s._nextUint16(),
                    versionNumber: s._nextUint16(),
                    descriptorBlockSize: s._nextUint16(),
                    colorModel: s._nextUint8(),
                    colorPrimaries: s._nextUint8(),
                    transferFunction: s._nextUint8(),
                    flags: s._nextUint8(),
                    texelBlockDimension: [s._nextUint8(), s._nextUint8(), s._nextUint8(), s._nextUint8()],
                    bytesPlane: [
                        s._nextUint8(),
                        s._nextUint8(),
                        s._nextUint8(),
                        s._nextUint8(),
                        s._nextUint8(),
                        s._nextUint8(),
                        s._nextUint8(),
                        s._nextUint8(),
                    ],
                    samples: [],
                },
                h = (a.descriptorBlockSize / 4 - 6) / 4;
            for (let A = 0; A < h; A++) {
                const I = {
                    bitOffset: s._nextUint16(),
                    bitLength: s._nextUint8(),
                    channelType: s._nextUint8(),
                    samplePosition: [s._nextUint8(), s._nextUint8(), s._nextUint8(), s._nextUint8()],
                    sampleLower: -1 / 0,
                    sampleUpper: 1 / 0,
                };
                64 & I.channelType
                    ? ((I.sampleLower = s._nextInt32()), (I.sampleUpper = s._nextInt32()))
                    : ((I.sampleLower = s._nextUint32()), (I.sampleUpper = s._nextUint32())),
                    (a.samples[A] = I);
            }
            (g.dataFormatDescriptor.length = 0), g.dataFormatDescriptor.push(a);
            const f = new PA(A, i, e, !0);
            for (; f._offset < e; ) {
                const A = f._nextUint32(),
                    I = f._scan(A),
                    B = OA(I),
                    C = f._scan(A - I.byteLength);
                (g.keyValue[B] = B.match(/^ktx/i) ? OA(C) : C), f._offset % 4 && f._skip(4 - (f._offset % 4));
            }
            if (r <= 0) return g;
            const w = new PA(A, o, r, !0),
                D = w._nextUint16(),
                c = w._nextUint16(),
                y = w._nextUint32(),
                u = w._nextUint32(),
                G = w._nextUint32(),
                F = w._nextUint32(),
                R = [];
            for (let A = 0; A < t; A++)
                R.push({
                    imageFlags: w._nextUint32(),
                    rgbSliceByteOffset: w._nextUint32(),
                    rgbSliceByteLength: w._nextUint32(),
                    alphaSliceByteOffset: w._nextUint32(),
                    alphaSliceByteLength: w._nextUint32(),
                });
            const S = o + w._offset,
                p = S + y,
                U = p + u,
                l = U + G,
                d = new Uint8Array(A.buffer, A.byteOffset + S, y),
                L = new Uint8Array(A.buffer, A.byteOffset + p, u),
                k = new Uint8Array(A.buffer, A.byteOffset + U, G),
                N = new Uint8Array(A.buffer, A.byteOffset + l, F);
            return (
                (g.globalData = {
                    endpointCount: D,
                    selectorCount: c,
                    imageDescs: R,
                    endpointsData: d,
                    selectorsData: L,
                    tablesData: k,
                    extendedData: N,
                }),
                g
            );
        })(new Uint8Array(A));
        if (0 !== g.vkFormat)
            return (async function (A) {
                const { vkFormat: I } = A;
                if (void 0 === CI[I]) throw new Error("THREE.KTX2Loader: Unsupported vkFormat.");
                let g;
                2 === A.supercompressionScheme &&
                    (AI ||
                        (AI = new Promise(async (A) => {
                            const I = new jA();
                            await I.init(), A(I);
                        })),
                    (g = await AI));
                const B = [];
                for (let C = 0; C < A.levels.length; C++) {
                    const t = Math.max(1, A.pixelWidth >> C),
                        Q = Math.max(1, A.pixelHeight >> C),
                        E = A.pixelDepth ? Math.max(1, A.pixelDepth >> C) : 0,
                        i = A.levels[C];
                    let e, o;
                    if (0 === A.supercompressionScheme) e = i.levelData;
                    else {
                        if (2 !== A.supercompressionScheme) throw new Error("THREE.KTX2Loader: Unsupported supercompressionScheme.");
                        e = g.decode(i.levelData, i.uncompressedByteLength);
                    }
                    (o =
                        tI[I] === D
                            ? new Float32Array(e.buffer, e.byteOffset, e.byteLength / Float32Array.BYTES_PER_ELEMENT)
                            : tI[I] === c
                            ? new Uint16Array(e.buffer, e.byteOffset, e.byteLength / Uint16Array.BYTES_PER_ELEMENT)
                            : e),
                        B.push({ data: o, width: t, height: Q, depth: E });
                }
                let C;
                if (BI.has(CI[I]))
                    C =
                        0 === A.pixelDepth
                            ? new y(B[0].data, A.pixelWidth, A.pixelHeight)
                            : new u(B[0].data, A.pixelWidth, A.pixelHeight, A.pixelDepth);
                else {
                    if (A.pixelDepth > 0) throw new Error("THREE.KTX2Loader: Unsupported pixelDepth.");
                    C = new h(B, A.pixelWidth, A.pixelHeight);
                }
                return (C.mipmaps = B), (C.type = tI[I]), (C.format = CI[I]), (C.colorSpace = QI(A)), (C.needsUpdate = !0), Promise.resolve(C);
            })(g);
        const B = I,
            C = this.init()
                .then(() => this.workerPool.postMessage({ type: "transcode", buffer: A, taskConfig: B }, [A]))
                .then((A) => this._createTextureFrom(A.data, g));
        return $A.set(A, { promise: C }), C;
    }
    dispose() {
        return this.workerPool.dispose(), this.workerSourceURL && URL.revokeObjectURL(this.workerSourceURL), II--, this;
    }
}
(gI.BasisFormat = { ETC1S: 0, UASTC_4x4: 1 }),
    (gI.TranscoderFormat = {
        ETC1: 0,
        ETC2: 1,
        BC1: 2,
        BC3: 3,
        BC4: 4,
        BC5: 5,
        BC7_M6_OPAQUE_ONLY: 6,
        BC7_M5: 7,
        PVRTC1_4_RGB: 8,
        PVRTC1_4_RGBA: 9,
        ASTC_4x4: 10,
        ATC_RGB: 11,
        ATC_RGBA_INTERPOLATED_ALPHA: 12,
        RGBA32: 13,
        RGB565: 14,
        BGR565: 15,
        RGBA4444: 16,
    }),
    (gI.EngineFormat = {
        RGBAFormat: A,
        RGBA_ASTC_4x4_Format: I,
        RGBA_BPTC_Format: g,
        RGBA_ETC2_EAC_Format: B,
        RGBA_PVRTC_4BPPV1_Format: C,
        RGBA_S3TC_DXT5_Format: t,
        RGB_ETC1_Format: Q,
        RGB_ETC2_Format: E,
        RGB_PVRTC_4BPPV1_Format: i,
        RGB_S3TC_DXT1_Format: e,
    }),
    (gI.BasisWorker = function () {
        let A, I, g;
        const B = _EngineFormat,
            C = _TranscoderFormat,
            t = _BasisFormat;
        self.addEventListener("message", function (Q) {
            const r = Q.data;
            switch (r.type) {
                case "init":
                    (A = r.config),
                        (n = r.transcoderBinary),
                        (I = new Promise((A) => {
                            (g = { wasmBinary: n, onRuntimeInitialized: A }), BASIS(g);
                        }).then(() => {
                            g.initializeBasis(), void 0 === g.KTX2File && console.warn("THREE.KTX2Loader: Please update Basis Universal transcoder.");
                        }));
                    break;
                case "transcode":
                    I.then(() => {
                        try {
                            const {
                                faces: I,
                                buffers: Q,
                                width: n,
                                height: s,
                                hasAlpha: a,
                                format: h,
                                dfdFlags: f,
                            } = (function (I) {
                                const Q = new g.KTX2File(new Uint8Array(I));
                                function r() {
                                    Q.close(), Q.delete();
                                }
                                if (!Q.isValid()) throw (r(), new Error("THREE.KTX2Loader:\tInvalid or unsupported .ktx2 file"));
                                const n = Q.isUASTC() ? t.UASTC_4x4 : t.ETC1S,
                                    s = Q.getWidth(),
                                    a = Q.getHeight(),
                                    h = Q.getLayers() || 1,
                                    f = Q.getLevels(),
                                    w = Q.getFaces(),
                                    D = Q.getHasAlpha(),
                                    c = Q.getDFDFlags(),
                                    { transcoderFormat: y, engineFormat: u } = (function (I, g, Q, o) {
                                        let r, n;
                                        const s = I === t.ETC1S ? E : i;
                                        for (let B = 0; B < s.length; B++) {
                                            const C = s[B];
                                            if (
                                                A[C.if] &&
                                                C.basisFormat.includes(I) &&
                                                !(o && C.transcoderFormat.length < 2) &&
                                                (!C.needsPowerOfTwo || (e(g) && e(Q)))
                                            )
                                                return (
                                                    (r = C.transcoderFormat[o ? 1 : 0]),
                                                    (n = C.engineFormat[o ? 1 : 0]),
                                                    { transcoderFormat: r, engineFormat: n }
                                                );
                                        }
                                        return (
                                            console.warn("THREE.KTX2Loader: No suitable compressed texture format found. Decoding to RGBA32."),
                                            (r = C.RGBA32),
                                            (n = B.RGBAFormat),
                                            { transcoderFormat: r, engineFormat: n }
                                        );
                                    })(n, s, a, D);
                                if (!s || !a || !f) throw (r(), new Error("THREE.KTX2Loader:\tInvalid texture"));
                                if (!Q.startTranscoding()) throw (r(), new Error("THREE.KTX2Loader: .startTranscoding failed"));
                                const G = [],
                                    F = [];
                                for (let A = 0; A < w; A++) {
                                    const I = [];
                                    for (let g = 0; g < f; g++) {
                                        const B = [];
                                        let C, t;
                                        for (let I = 0; I < h; I++) {
                                            const E = Q.getImageLevelInfo(g, I, A);
                                            0 !== A ||
                                                0 !== g ||
                                                0 !== I ||
                                                (E.origWidth % 4 == 0 && E.origHeight % 4 == 0) ||
                                                console.warn("THREE.KTX2Loader: ETC1S and UASTC textures should use multiple-of-four dimensions."),
                                                f > 1 ? ((C = E.origWidth), (t = E.origHeight)) : ((C = E.width), (t = E.height));
                                            const i = new Uint8Array(Q.getImageTranscodedSizeInBytes(g, I, 0, y));
                                            if (!Q.transcodeImage(i, g, I, A, y, 0, -1, -1))
                                                throw (r(), new Error("THREE.KTX2Loader: .transcodeImage failed."));
                                            B.push(i);
                                        }
                                        const E = o(B);
                                        I.push({ data: E, width: C, height: t }), F.push(E.buffer);
                                    }
                                    G.push({ mipmaps: I, width: s, height: a, format: u });
                                }
                                return r(), { faces: G, buffers: F, width: s, height: a, hasAlpha: D, format: u, dfdFlags: c };
                            })(r.buffer);
                            self.postMessage({ type: "transcode", id: r.id, faces: I, width: n, height: s, hasAlpha: a, format: h, dfdFlags: f }, Q);
                        } catch (A) {
                            console.error(A), self.postMessage({ type: "error", id: r.id, error: A.message });
                        }
                    });
            }
            var n;
        });
        const Q = [
                {
                    if: "astcSupported",
                    basisFormat: [t.UASTC_4x4],
                    transcoderFormat: [C.ASTC_4x4, C.ASTC_4x4],
                    engineFormat: [B.RGBA_ASTC_4x4_Format, B.RGBA_ASTC_4x4_Format],
                    priorityETC1S: 1 / 0,
                    priorityUASTC: 1,
                    needsPowerOfTwo: !1,
                },
                {
                    if: "bptcSupported",
                    basisFormat: [t.ETC1S, t.UASTC_4x4],
                    transcoderFormat: [C.BC7_M5, C.BC7_M5],
                    engineFormat: [B.RGBA_BPTC_Format, B.RGBA_BPTC_Format],
                    priorityETC1S: 3,
                    priorityUASTC: 2,
                    needsPowerOfTwo: !1,
                },
                {
                    if: "dxtSupported",
                    basisFormat: [t.ETC1S, t.UASTC_4x4],
                    transcoderFormat: [C.BC1, C.BC3],
                    engineFormat: [B.RGB_S3TC_DXT1_Format, B.RGBA_S3TC_DXT5_Format],
                    priorityETC1S: 4,
                    priorityUASTC: 5,
                    needsPowerOfTwo: !1,
                },
                {
                    if: "etc2Supported",
                    basisFormat: [t.ETC1S, t.UASTC_4x4],
                    transcoderFormat: [C.ETC1, C.ETC2],
                    engineFormat: [B.RGB_ETC2_Format, B.RGBA_ETC2_EAC_Format],
                    priorityETC1S: 1,
                    priorityUASTC: 3,
                    needsPowerOfTwo: !1,
                },
                {
                    if: "etc1Supported",
                    basisFormat: [t.ETC1S, t.UASTC_4x4],
                    transcoderFormat: [C.ETC1],
                    engineFormat: [B.RGB_ETC1_Format],
                    priorityETC1S: 2,
                    priorityUASTC: 4,
                    needsPowerOfTwo: !1,
                },
                {
                    if: "pvrtcSupported",
                    basisFormat: [t.ETC1S, t.UASTC_4x4],
                    transcoderFormat: [C.PVRTC1_4_RGB, C.PVRTC1_4_RGBA],
                    engineFormat: [B.RGB_PVRTC_4BPPV1_Format, B.RGBA_PVRTC_4BPPV1_Format],
                    priorityETC1S: 5,
                    priorityUASTC: 6,
                    needsPowerOfTwo: !0,
                },
            ],
            E = Q.sort(function (A, I) {
                return A.priorityETC1S - I.priorityETC1S;
            }),
            i = Q.sort(function (A, I) {
                return A.priorityUASTC - I.priorityUASTC;
            });
        function e(A) {
            return A <= 2 || (!(A & (A - 1)) && 0 !== A);
        }
        function o(A) {
            if (1 === A.length) return A[0];
            let I = 0;
            for (let g = 0; g < A.length; g++) {
                I += A[g].byteLength;
            }
            const g = new Uint8Array(I);
            let B = 0;
            for (let I = 0; I < A.length; I++) {
                const C = A[I];
                g.set(C, B), (B += C.byteLength);
            }
            return g;
        }
    });
const BI = new Set([A, U, l]),
    CI = { [xA]: A, [mA]: A, [MA]: A, [JA]: A, [_A]: U, [YA]: U, [kA]: U, [NA]: U, [HA]: l, [qA]: l, [LA]: l, [dA]: l, [TA]: d, [KA]: d },
    tI = { [xA]: D, [mA]: c, [MA]: s, [JA]: s, [_A]: D, [YA]: c, [kA]: s, [NA]: s, [HA]: D, [qA]: c, [LA]: s, [dA]: s, [TA]: s, [KA]: s };
function QI(A) {
    const I = A.dataFormatDescriptor[0];
    return 1 === I.colorPrimaries
        ? 2 === I.transferFunction
            ? G
            : F
        : 10 === I.colorPrimaries
        ? 2 === I.transferFunction
            ? R
            : S
        : (0 === I.colorPrimaries || console.warn(`THREE.KTX2Loader: Unsupported color primaries, "${I.colorPrimaries}"`), p);
}
export { gI as KTX2Loader };
export default null;
//# sourceMappingURL=/sm/11226d2c5a5eb83cd33028011aae1af1170288f8685824da6de38f439891f8b2.map
