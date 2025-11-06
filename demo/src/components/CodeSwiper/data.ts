/*
 * @Author: capsion_surfacePro7 capsion@surfacePro2.com
 * @Date: 2025-04-29 17:03:36
 * @LastEditors: Capsion 373704015@qq.com
 * @LastEditTime: 2025-05-01 08:34:58
 * @FilePath: \gsap-lenis-learn\src\components\CodeSwiper\data.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

export const codeSnippets = {
  go: `
package main

import ("fmt" "strings")

type Blog struct {
  slogan string
}

func (b Blog) ShowWelcome() {
  fmt.Println(strings.ToUpper(b.slogan) + "!")
}

func main() {
  Blog{slogan: "wellcome my blog capsion'hub"}.ShowWelcome()
}
  `.trim(),

  java: `
public class MyBlog {
  private final String message;
  
  public MyBlog(String text) {
      this.message = text.toUpperCase().replace(" ", "  ✦  ");
  }
  
  public void display() {
      System.out.println("✨ " + this.message + " ✨");
  }
  
  public static void main(String[] args) {
      new MyBlog("wellcome my blog capsion'hub").display();
  }
}
  `.trim(),

  python: `
class MyBlog:
  def __init__(self, greeting):
      self.banner = f"★ {greeting.upper()} ★"
  
  def __repr__(self):
      return self.banner
  
  @classmethod
  def create_hub(cls):
      return cls("wellcome my blog capsion'hub")

if __name__ == "__main__":
  print(MyBlog.create_hub())
  `.trim(),

  javascript: `
class MyBlog {
  constructor(text) {
      this.header = text.toUpperCase().split(' ')
                       .join(' ▸ ');
  }

  render() {
      console.log(\`%c\${this.header}\`, 
                 'font-weight: bold; color: #2ecc71');
  }
}

new MyBlog('wellcome my blog capsion\\'hub').render();
  `.trim(),

  typescript: `
interface BlogConfig {
  welcomeText: string;
  symbol: string;
}

const createHeader = (config: BlogConfig): string => {
  return \`\${config.symbol} \${config.welcomeText.toUpperCase()} \${config.symbol}\`;
}

console.log(createHeader({
  welcomeText: "wellcome my blog capsion'hub",
  symbol: "◆"
}));
  `.trim(),

  tsx: `
import React from 'react';

export default function MyBlog() {
  const text = "wellcome my blog capsion'hub".toUpperCase();
  return (
      <div className="neon-text">
          {text.split(' ').map((word, i) => 
              <span key={i}>{word} {i < 4 && '◈'}</span>
          )}
      </div>
  );
}
  `.trim(),

  vue: `
<template>
  <div class="animated-header">{{ decoratedText }}</div>
</template>

<script>
export default {
  data: () => ({
      greeting: "wellcome my blog capsion'hub"
  }),
  mounted() {
    this.greeting.toUpperCase().replace(/'/g, '✧')
  }
}
</script>
  `.trim(),

  lua: `
Blog = { message = "wellcome my blog capsion'hub" }

function Blog:decorate()
  local decorated = string.upper(self.message)
  return decorated:gsub(" ", " ▹ ")
end

function Blog:show()
  print("【"..self:decorate().."】")
end

local myBlog = Blog
myBlog:show()
  `.trim(),

  php: `
<?php

class MyBlog {
  private $greeting;
  
  public function __construct($text) {
      $this->greeting = strtoupper($text);
  }
  
  public function display() {
      echo "<div class='blog-header'>";
      echo str_replace(" ", " • ", $this->greeting);
      echo "</div>";
  }
}

(new MyBlog('wellcome my blog capsion\\'hub'))->display();

?>
  `.trim(),
} as const;

export type Language = keyof typeof codeSnippets;

export const languagesList = Object.keys(codeSnippets) as Language[];

export default codeSnippets;
