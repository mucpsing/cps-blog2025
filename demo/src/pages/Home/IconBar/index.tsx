import { useEffect } from "react";
import Iconfont from "@site/src/components/Iconfont";

export default function IconBar() {
  const iconsList = ["logoicon-bilibili-line", "logoicon-juejin", "logoicon-github-fill", "logoicon-gitee", "logoicon-QQ-circle-fill", "logoicon-weixin"];

  return (
    <div className={["mt-6"].join(" ")}>
      <div className={["flex gap-2"].join(" ")}>
        {iconsList.map((icon, key) => (
          <div key={key}>
            <Iconfont className="text-2xl" iconName={icon}></Iconfont>
          </div>
        ))}
      </div>
    </div>
  );
}
