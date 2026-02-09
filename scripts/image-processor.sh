#!/bin/bash
# 图片处理脚本 - 根据平台自动切换图片引用
# 用法: ./scripts/image-processor.sh [github|gitee]

set -e

# 检查参数
if [ $# -ne 1 ]; then
    echo "用法: $0 [github|gitee]"
    echo "  github - 将图片链接替换为 HTTP 图床"
    echo "  gitee  - 恢复本地图片引用"
    exit 1
fi

PLATFORM=$1
README_FILE="README.md"
BACKUP_FILE="README.md.backup"

# 检查 README 文件是否存在
if [ ! -f "$README_FILE" ]; then
    echo "错误: 找不到 $README_FILE 文件"
    exit 1
fi

# 创建备份
cp "$README_FILE" "$BACKUP_FILE"
echo "已创建备份: $BACKUP_FILE"

# HTTP 图床配置 - 请替换为你的实际图床 URL
GITHUB_CURSOR_URL="https://raw.githubusercontent.com/congwa/Cursor-Analysis/main/cursor.png"
GITHUB_IMAGE_URL="https://raw.githubusercontent.com/congwa/Cursor-Analysis/main/image.png"

if [ "$PLATFORM" = "github" ]; then
    echo "切换到 GitHub 模式 - 使用 HTTP 图床链接..."
    
    # 替换为 GitHub 的 raw 文件链接
    sed -i.tmp 's|!\[Cursor界面](cursor.png)|![Cursor界面]('"$GITHUB_CURSOR_URL"')|g' "$README_FILE"
    sed -i.tmp 's|!\[参考图](image.png)|![参考图]('"$GITHUB_IMAGE_URL"')|g' "$README_FILE"
    
    # 清理临时文件
    rm -f "$README_FILE.tmp"
    
    echo "✅ 已切换到 GitHub 模式"
    
elif [ "$PLATFORM" = "gitee" ]; then
    echo "切换到 Gitee 模式 - 使用本地图片引用..."
    
    # 恢复本地图片引用 - 使用更通用的正则表达式
    sed -i.tmp 's|!\[Cursor界面](https://[^)]*/cursor\.png)|![Cursor界面](cursor.png)|g' "$README_FILE"
    sed -i.tmp 's|!\[参考图](https://[^)]*/image\.png)|![参考图](image.png)|g' "$README_FILE"
    
    # 清理临时文件
    rm -f "$README_FILE.tmp"
    
    echo "✅ 已切换到 Gitee 模式"
    
else
    echo "错误: 不支持的平台 '$PLATFORM'"
    echo "支持的平台: github, gitee"
    rm -f "$BACKUP_FILE"
    exit 1
fi

# 显示更改
echo ""
echo "更改预览:"
echo "----------"
diff "$BACKUP_FILE" "$README_FILE" || echo "无显示差异（可能是格式化问题）"
echo "----------"

# 验证更改
echo ""
echo "当前图片引用:"
grep -n "!\[.*\](" "$README_FILE" | head -2

echo ""
echo "✅ 处理完成！"
echo "💡 提示: 如需恢复，请运行: cp $BACKUP_FILE $README_FILE"
