import React from "react";
import MouseFollower from "@site/src/components/MouseFollower";
import MouseBall from "@site/src/components/MouseBall";

export default function Test() {
  return (
    <div className="w-[100vw] h-[80vh]">
      {/* <MouseFollower colors={["#FF6347", "#FF4500", "#32CD32", "#1E90FF", "#FFD700"]} offsetX={10} offsetY={10} radius={30} interval={20} /> */}
      <MouseBall></MouseBall>
    </div>
  );
}
