module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // ✨ 新功能
        'fix', // 🐛 修复 bug
        'docs', // 📝 文档更新
        'style', // 💅 代码格式（不影响逻辑）
        'refactor', // ♻️ 重构（非新增功能、非修复）
        'perf', // ⚡️ 性能优化
        'test', // ✅ 测试相关修改
        'build', // 🏗️ 构建系统或依赖更新
        'ci', // 🤖 CI/CD 配置变更
        'chore', // 🔧 杂项任务
        'revert', // ⏪ 回滚提交
      ],
    ],
    'subject-case': [0],
  },
};
