import React, { useEffect, useRef, useState } from "react";
import Typed from "typed.js";
import Prism from "prismjs";
import "prismjs/themes/prism.css";

// 引入需要的语言支持
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";

interface CodeTypingProps {
  code: string;
  language?: string;
  typingSpeed?: number;
  loop?: boolean;
  cursorChar?: string;
}

const CodeTyping: React.FC<CodeTypingProps> = ({ code, language = "javascript", typingSpeed = 40, loop = false, cursorChar = "|" }) => {
  const typedTarget = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLElement>(null);
  const [displayCode, setDisplayCode] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);

  // 光标闪烁动画
  useEffect(() => {
    const timer = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const typed = new Typed(typedTarget.current!, {
      strings: [code],
      typeSpeed: typingSpeed,
      loop,
      showCursor: false, // 禁用默认光标
      onDestroy: () => setDisplayCode(""),
      onStringTyped: () => {
        setDisplayCode(typedTarget.current!.textContent || "");
        Prism.highlightElement(codeRef.current!);
      },
      onTypingPaused: () => {
        setDisplayCode(typedTarget.current!.textContent || "");
        Prism.highlightElement(codeRef.current!);
      },
    });

    return () => typed.destroy();
  }, [code, loop, typingSpeed]);

  return (
    <div className="code-container">
      {/* 隐藏的Typed.js输入目标 */}
      <div ref={typedTarget} style={{ display: "none" }} />

      {/* 实际显示的高亮代码块 */}
      <pre className={`language-${language}`}>
        <code
          ref={codeRef}
          className={`language-${language}`}
          dangerouslySetInnerHTML={{
            __html: Prism.highlight(displayCode, Prism.languages[language], language),
          }}
        />
        {/* 自定义光标 */}
        {cursorVisible && <span className="typed-cursor">{cursorChar}</span>}
      </pre>
    </div>
  );
};

export default CodeTyping;
