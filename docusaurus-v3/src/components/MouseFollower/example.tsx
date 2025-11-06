/*
 * @Author: cpasion-office-win10 373704015@qq.com
 * @Date: 2025-02-28 10:00:38
 * @LastEditors: cpasion-office-win10 373704015@qq.com
 * @LastEditTime: 2025-02-28 10:00:52
 * @FilePath: \cps-blog-docusaurus-v3\src\components\MouseFollower\example.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from "react";
import FollowMouse from "./index";

const App: React.FC = () => {
  return (
    <div>
      <h1>鼠标跟随组件示例</h1>
      <FollowMouse offsetX={10} offsetY={10} radius={30} />
    </div>
  );
};

export default App;

interface MouseFollowerProps {
  offsetX?: number;
  offsetY?: number;
  radius?: number;
}

const MouseFollower: React.FC<MouseFollowerProps> = ({ offsetX = 0, offsetY = 0, radius = 20 }) => {
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX + offsetX,
        y: e.clientY + offsetY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [offsetX, offsetY]);

  return (
    <div
      style={{
        position: "absolute",
        width: radius * 2,
        height: radius * 2,
        borderRadius: "50%",
        backgroundColor: "rgba(0, 128, 255, 0.6)",
        transform: `translateX(${position.x - radius}px) translateY(${position.y - radius}px)`,
        transition: "transform 0.1s ease-out",
        pointerEvents: "none",
      }}
    />
  );
};

export default MouseFollower;
