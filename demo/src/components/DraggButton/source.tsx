/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2025-05-28 15:55:04
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2025-05-28 15:55:11
 * @FilePath: \gsap-lenis-learn\src\components\DraggButton\source.tsx
 * @Description: https://codepen.io/MAW/pen/bdrBNg
 */
/* a Pen by Diaco m.lotfollahi  : https://diacodesign.com */
var C = 15,
  AX = [],
  AY = [];
(I = document.getElementById("I")), (svg = document.getElementById("myLife"));
var svgNS = "http://www.w3.org/2000/svg";
for (var i = 0; i < C; i++) {
  var myCircle = document.createElementNS(svgNS, "circle");
  var myLine = document.createElementNS(svgNS, "line");
  var w = R(7, 15),
    x = R(10, 500),
    y = R(10, 500);
  AY.push(y);
  AX.push(x);
  svg.insertBefore(myCircle, I);
  svg.insertBefore(myLine, I);
  TweenLite.set(myCircle, { attr: { r: w }, x: x, y: y, fill: "silver", opacity: 0.7, stroke: "gray", strokeWidth: 2 });
  TweenLite.set(myLine, {
    attr: { x1: x, x2: x, y2: y, y1: y },
    strokeWidth: w / 2,
    strokeLinecap: "round",
    className: "lines",
    fill: "none",
    stroke: "rgba(0,0,0,0.8)",
  });
}
var y = Aa(AY),
  x = Aa(AX);
TweenLite.set(I, { y: y, x: x });
Draggable.create(I, {
  type: "x,y",
  onDrag: SU,
  onRelease: function () {
    TweenLite.to(this.target, 1, { x: x, y: y, ease: Elastic.easeOut.config(1, 0.15), onUpdate: SU });
  },
});
function SU() {
  TweenMax.set(".lines", { attr: { x2: I._gsTransform.x, y2: I._gsTransform.y } });
}
SU();
function R(min, max) {
  return min + Math.floor(Math.random() * (max - min));
}
function Aa(arr) {
  return Math.min.apply(Math, arr) + (Math.max.apply(Math, arr) - Math.min.apply(Math, arr)) / 2;
}

/* a Pen by Diaco m.lotfollahi  : https://diacodesign.com */
