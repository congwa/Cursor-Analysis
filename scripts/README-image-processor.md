# 图片处理脚本使用说明

## 概述

这个脚本用于根据不同平台自动切换 README.md 中的图片引用方式：
- **GitHub**: 使用 HTTP 图床链接（GitHub raw 文件链接）
- **Gitee**: 使用本地图片引用

## 脚本位置

`scripts/image-processor.sh`

## 使用方法

### 手动使用

```bash
# 切换到 GitHub 模式（使用 HTTP 图床）
./scripts/image-processor.sh github

# 切换到 Gitee 模式（使用本地图片）
./scripts/image-processor.sh gitee
```

### 自动化集成

#### GitHub Actions

在 `.github/workflows/build.yml` 中已集成，每次构建时会自动：
1. 检出代码
2. **自动切换到 GitHub 模式**
3. 继续构建流程

#### 本地开发

如果你在本地推送到 Gitee，可以手动切换：

```bash
# 推送到 Gitee 前切换到本地图片模式
./scripts/image-processor.sh gitee
git add README.md
git commit -m "切换到 Gitee 模式"
git push gitee main

# 推送到 GitHub 前切换到 HTTP 图床模式
./scripts/image-processor.sh github
git add README.md
git commit -m "切换到 GitHub 模式"
git push github main
```

## 工作原理

### GitHub 模式
- 将 `![Cursor界面](cursor.png)` 替换为 `![Cursor界面](https://raw.githubusercontent.com/congwa/Cursor-Analysis/main/cursor.png)`
- 将 `![参考图](image.png)` 替换为 `![参考图](https://raw.githubusercontent.com/congwa/Cursor-Analysis/main/image.png)`

### Gitee 模式
- 将所有 HTTP 图床链接恢复为本地图片引用
- 使用正则表达式匹配任意图床域名

## 安全特性

1. **自动备份**: 每次执行前都会创建 `README.md.backup` 备份
2. **变更预览**: 显示具体的更改内容
3. **验证检查**: 显示当前图片引用状态
4. **恢复机制**: 可通过备份文件快速恢复

## 配置说明

如需修改图床 URL，请编辑脚本中的以下变量：

```bash
GITHUB_CURSOR_URL="https://raw.githubusercontent.com/congwa/Cursor-Analysis/main/cursor.png"
GITHUB_IMAGE_URL="https://raw.githubusercontent.com/congwa/Cursor-Analysis/main/image.png"
```

## 故障排除

### 恢复备份
```bash
cp README.md.backup README.md
```

### 检查当前状态
```bash
grep -n "!\[.*\](" README.md
```

### 清理临时文件
```bash
rm -f README.md.backup README.md.tmp
```

## 注意事项

1. 确保图片文件在 GitHub 仓库中存在
2. 脚本会自动处理文件权限问题
3. 在 Windows 环境下需要使用 Git Bash 或 WSL
4. 建议在执行前提交当前更改，以便回滚
