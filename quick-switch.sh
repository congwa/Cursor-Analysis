#!/bin/bash
# 快速切换脚本 - 用于日常开发中的平台切换

set -e

echo "Cursor Analysis - 图片引用快速切换"
echo "===================================="
echo ""

# 检查当前状态
echo "当前图片引用状态:"
grep -n "!\[.*\](" README.md | head -2
echo ""

# 检测当前模式
if grep -q "https://raw.githubusercontent.com" README.md; then
    CURRENT_MODE="GitHub"
    NEXT_MODE="gitee"
    NEXT_ACTION="切换到 Gitee 模式（本地图片）"
elif grep -q "cursor.png\|image.png" README.md; then
    CURRENT_MODE="Gitee"
    NEXT_MODE="github"
    NEXT_ACTION="切换到 GitHub 模式（HTTP 图床）"
else
    echo "⚠️  无法检测当前模式"
    exit 1
fi

echo "当前模式: $CURRENT_MODE"
echo "建议操作: $NEXT_ACTION"
echo ""

read -p "是否执行切换？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "正在切换..."
    ./scripts/image-processor.sh $NEXT_MODE
    echo ""
    echo "✅ 切换完成！"
    echo ""
    echo "新状态:"
    grep -n "!\[.*\](" README.md | head -2
else
    echo "❌ 取消切换"
fi
