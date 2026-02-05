#!/bin/bash
# 同时构建 macOS 和 Windows 版本

set -e

# 确保 LLVM 在 PATH 中
export PATH="/usr/local/opt/llvm/bin:$PATH"

cd "$(dirname "$0")/.."
PROJECT_DIR=$(pwd)

echo "========================================"
echo "  Cursor Analysis 全平台构建脚本"
echo "========================================"
echo ""

# 创建 release 目录
mkdir -p release/macos release/windows

# 1. 构建前端
echo "[1/4] 构建前端..."
pnpm build

# 2. 构建 macOS 版本
echo ""
echo "[2/4] 构建 macOS 版本..."
npm run tauri build

# 复制 macOS 产物
cp -r src-tauri/target/release/bundle/dmg/*.dmg release/macos/ 2>/dev/null || true
cp -r src-tauri/target/release/bundle/macos/*.app release/macos/ 2>/dev/null || true

# 3. 构建 Windows 版本
echo ""
echo "[3/4] 交叉编译 Windows 版本..."
cd src-tauri
cargo xwin build --release --target x86_64-pc-windows-msvc
cd ..

# 4. 打包 Windows 版本
echo ""
echo "[4/4] 打包 Windows 版本..."
cp src-tauri/target/x86_64-pc-windows-msvc/release/cursor-analysis.exe release/windows/
cp -r dist release/windows/

# 创建 Windows ZIP 包
cd release/windows
zip -r "../Cursor-Analysis-Windows-x64.zip" .
cd ../..

echo ""
echo "========================================"
echo "  构建完成！"
echo "========================================"
echo ""
echo "macOS 构建产物:"
ls -lh release/macos/ 2>/dev/null || echo "  (无)"
echo ""
echo "Windows 构建产物:"
ls -lh release/windows/*.exe release/*.zip 2>/dev/null || echo "  (无)"
echo ""
echo "所有产物位于: $PROJECT_DIR/release/"
