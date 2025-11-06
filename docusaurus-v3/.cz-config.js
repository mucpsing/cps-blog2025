/*
 * @Author: Capsion 373704015@qq.com
 * @Date: 2024-02-20 21:08:48
 * @LastEditors: Capsion 373704015@qq.com
 * @LastEditTime: 2025-02-10 12:20:36
 * @FilePath: \cps-blog-docusaurus-v3\.cz-config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
module.exports = {
  types: [
    { value: "✨feat", name: "新增:    新增功能或者特性" },
    { value: "⚡️perf", name: "优化:    优化相关，比如提升性能、体验" },
    { value: "💄style", name: "格式:    💄仅仅修改了空格、格式缩进等等，不改变代码逻辑" },
    { value: "✅test", name: "测试:    测试用例，包括增加缺失用例或者修正测试用例" },
    { value: "🐛fix", name: "修复:    修复Bug" },
    { value: "📝docs", name: "文档:    仅仅修改了文档，比如`README`, `CHANGELOG`, CONTRIBUTE等等" },
    { value: "♻️refactor", name: "重构:    重构（即不是新增功能，也不是修改bug的代码变动）" },
    { value: "🔧chore", name: "工具:    构建过程或辅助工具的变动" },
    { value: "⏪revert", name: "回滚:    用于撤销以前的 commit，后面跟着被撤销 Commit 的 Header。" },
    { value: "🔃ci", name: "更新:    更改我们的CI配置文件和脚本" },
  ],
  scopes: [{ name: "custom" }, { name: "leetcode" }, { name: "javascript" }, { name: "typescript" }, { name: "Vue" }, { name: "node" }],
  // it needs to match the value for field type. Eg.: 'fix'
  // scopeOverrides: {
  //   fix: [{ name: "merge" }, { name: "style" }, { name: "e2eTest" }, { name: "unitTest" }],
  // },
  // override the messages, defaults are as follows
  messages: {
    type: "选择一种你的提交类型:",
    scope: "选择一个scope (可选):",
    // used if allowCustomScopes is true
    // customScope: "Denote the SCOPE of this change:",
    customScope: "选择一个scope (可选):",
    subject: "短说明:\n",
    body: '长说明，使用"|"换行(可选)：\n',
    breaking: "非兼容性说明 (可选):\n",
    footer: "关联关闭的issue，例如：#31, #34(可选):\n",
    confirmCommit: "确定提交说明?(yes/no)",
  },
  allowCustomScopes: true,
  allowBreakingChanges: ["特性", "修复"],
  // limit subject length
  subjectLimit: 100,
};
