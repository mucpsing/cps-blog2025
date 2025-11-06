var DEFAULT_MAIN_COLOR = ["#FC1E4F", "#FFF43D", "#9FDA7F", "#4A90E2", "#FF9F00", "#9B4DCA"];
var DEFAULT_SUB_COLOR = ["#FF4058", "#F6B429", "#64D487", "#1D72B8", "#FF7F32", "#8E44AD"];

var baseContainerStyle = { pointerEvents: "auto", width: "100vw", heigh: "0px", opacity: 0, postition: "flex", zIndex: 99 };
var baseElStyle = { pointerEvents: "auto", width: "100vw", heigh: "0px", opacity: 0 };

var elOut = document.createElement("div");
var elList = DEFAULT_MAIN_COLOR.map((color, i) => {
  var el = document.createElement("div");

  el.style;
});

Object.assign(elOut.style, baseContainerStyle);
elOut.innerText = "~~ loading! ~~";
document.body.prepend(elOut);
