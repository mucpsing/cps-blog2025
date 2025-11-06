import { useState, useRef, useEffect } from "react";
import Tilty from "react-tilty";

import { useGlobalContext, skillIcons } from "@site/src/store";
import MouseTracker from "@site/src/components/MouseIconsTracker";

export default function CoderSwiper() {
  const globalContext = useGlobalContext();

  useEffect(() => {
    globalContext.register("CoderSwiper");
  }, []);

  return (
    <div
      className={["p-[4px] bg-white", "w-full h-[550px] relative", "cursor-pointer"].join(" ")}
      style={{ borderRadius: "55px", backgroundColor: globalContext.mainColor, boxShadow: "rgba(5, 71, 17, 0) 40px 50px 25px -40px, rgba(5, 71, 17, 0.2) 0px 25px 25px -5px" }}
    >
      <div
        style={{
          borderRadius: "55px",
          // borderTopRightRadius: "100%",
          background: "linear-gradient(0deg, rgba(255, 255, 255, 0.349) 0%, rgba(255, 255, 255, 0.815) 100%)",
        }}
        className={["transition-all", "border-l-[1px] border-b-[1px] border-white border-solid", "inset-2 h-full"].join(" ")}
      >
        <MouseTracker DEBUG={false} iconsList={skillIcons} size={30} count={skillIcons.length} threshold={100}></MouseTracker>
      </div>
    </div>
  );
}
