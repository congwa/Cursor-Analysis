#!/bin/bash
# 在 macOS 上交叉编译 Windows 版本
# 需要先安装: rustup target add x86_64-pc-windows-msvc && cargo install cargo-xwin && brew install llvm

set -e

echo "========================================"
echo "  Windows 交叉编译脚本"
echo "========================================"

# 设置 LLVM 路径
export PATH="/usr/local/opt/llvm/bin:$PATH"

# 设置交叉编译环境变量
export CC_x86_64_pc_windows_msvc="/usr/local/opt/llvm/bin/clang-cl"
export CXX_x86_64_pc_windows_msvc="/usr/local/opt/llvm/bin/clang-cl"
export AR_x86_64_pc_windows_msvc="/usr/local/opt/llvm/bin/llvm-lib"
export RC_x86_64_pc_windows_msvc="/usr/local/opt/llvm/bin/llvm-rc"

# Windows SDK include 路径
XWIN_CACHE="$HOME/Library/Caches/cargo-xwin/xwin"
export CFLAGS_x86_64_pc_windows_msvc="--target=x86_64-pc-windows-msvc -Wno-unused-command-line-argument -fuse-ld=lld-link /imsvc $XWIN_CACHE/crt/include /imsvc $XWIN_CACHE/sdk/include/ucrt /imsvc $XWIN_CACHE/sdk/include/um /imsvc $XWIN_CACHE/sdk/include/shared"

cd "$(dirname "$0")/.."
PROJECT_DIR=$(pwd)

# 1. 构建前端
echo ""
echo "[1/3] 构建前端..."
pnpm build

# 2. 使用 cargo-xwin 构建 (它会正确处理所有交叉编译设置)
echo ""
echo "[2/3] 使用 cargo-xwin 交叉编译..."
cd src-tauri
cargo xwin build --release --target x86_64-pc-windows-msvc

# 3. 打包
echo ""
echo "[3/3] 打包 Windows 版本..."
cd ..
mkdir -p release/windows

# 复制可执行文件
cp src-tauri/target/x86_64-pc-windows-msvc/release/cursor-analysis.exe release/windows/

# 由于 Tauri 应用内嵌前端资源，exe 可独立运行
# 但 cargo-xwin 构建的版本需要额外配置，这里我们提供完整的运行包

# 复制前端资源作为备用
cp -r dist release/windows/

# 创建 ZIP
cd release/windows
zip -r "../Cursor-Analysis_1.0.4_Windows-x64.zip" cursor-analysis.exe
cd ../..

echo ""
echo "========================================"
echo "  构建完成！"
echo "========================================"
echo ""
echo "Windows 构建产物:"
ls -lh release/windows/cursor-analysis.exe
ls -lh release/*.zip 2>/dev/null || true
echo ""
echo "注意: 由于使用 cargo-xwin 构建，前端资源可能未正确嵌入。"
echo "如需完整的 Tauri 打包功能，建议使用 GitHub Actions 在 Windows 上构建。"
