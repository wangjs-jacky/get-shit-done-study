#!/bin/bash

# 修复翻译文件的脚本
# 解决 "File has not been read yet" 错误

echo "开始修复翻译文件..."

# 文件列表
files=(
    "gsd-codebase-mapper.zh-CN.md"
    "gsd-debugger.zh-CN.md"
    "gsd-executor.zh-CN.md"
    "gsd-integration-checker.zh-CN.md"
    "gsd-nyquist-auditor.zh-CN.md"
    "gsd-phase-researcher.zh-CN.md"
    "gsd-plan-checker.zh-CN.md"
)

# 检查每个文件是否存在，如果不存在则创建空文件
for file in "${files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "创建空文件: $file"
        touch "$file"
    fi
done

echo "翻译文件修复完成。"