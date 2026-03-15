#!/bin/bash

# =============================================================================
# jq 演示脚本 - 在终端执行: bash notes/jq-demo.sh
# =============================================================================

echo "=========================================="
echo "1. 模拟 gsd-tools.cjs init 返回的 JSON"
echo "=========================================="

# 这是一个典型的 init execute-phase 返回值
INIT='{
  "phase_found": true,
  "phase_dir": ".planning/phases/01-foundation",
  "phase_number": 1,
  "phase_name": "Foundation",
  "phase_slug": "foundation",
  "plans": [
    {
      "id": "01-01",
      "wave": 1,
      "autonomous": true,
      "objective": "Setup project structure",
      "task_count": 3,
      "has_summary": false
    },
    {
      "id": "01-02",
      "wave": 1,
      "autonomous": true,
      "objective": "Configure build system",
      "task_count": 2,
      "has_summary": false
    },
    {
      "id": "01-03",
      "wave": 2,
      "autonomous": false,
      "objective": "Setup CI/CD pipeline",
      "task_count": 4,
      "has_summary": true
    }
  ],
  "waves": {
    "1": ["01-01", "01-02"],
    "2": ["01-03"]
  },
  "plan_count": 3,
  "incomplete_count": 2,
  "state_exists": true,
  "roadmap_exists": true,
  "executor_model": "sonnet",
  "verifier_model": "sonnet",
  "parallelization": true,
  "branching_strategy": "phase",
  "branch_name": "phase-1-foundation",
  "phase_req_ids": ["REQ-01", "REQ-02", "REQ-03"],
  "has_checkpoints": true
}'

echo ""
echo "原始 JSON:"
echo "$INIT" | head -20
echo "..."
echo ""

# =============================================================================
echo "=========================================="
echo "2. 用 jq 提取单个字段"
echo "=========================================="

echo ""
echo "# 提取 phase_dir（带引号）"
echo 'echo "$INIT" | jq '"'"'.phase_dir'"'"
echo "$INIT" | jq '.phase_dir'
echo ""

echo "# 提取 phase_dir（无引号，-r = raw output）"
echo 'echo "$INIT" | jq -r '"'"'.phase_dir'"'"
echo "$INIT" | jq -r '.phase_dir'
echo ""

echo "# 提取数字"
echo 'echo "$INIT" | jq '"'"'.plan_count'"'"
echo "$INIT" | jq '.plan_count'
echo ""

# =============================================================================
echo ""
echo "=========================================="
echo "3. 用 jq 提取嵌套字段"
echo "=========================================="

echo ""
echo "# 提取第一个计划的目标"
echo 'echo "$INIT" | jq -r '"'"'.plans[0].objective'"'"
echo "$INIT" | jq -r '.plans[0].objective'
echo ""

echo "# 提取 wave 1 的计划 ID"
echo 'echo "$INIT" | jq -r '"'"'.waves["1"][]'"'"
echo "$INIT" | jq -r '.waves["1"][]'
echo ""

# =============================================================================
echo ""
echo "=========================================="
echo "4. 用 jq 遍历数组"
echo "=========================================="

echo ""
echo "# 遍历所有计划，提取 ID 和目标"
echo 'echo "$INIT" | jq -r '"'"'.plans[] | \"\(.id): \(.objective)\"'"'"
echo "$INIT" | jq -r '.plans[] | "\(.id): \(.objective)"'
echo ""

echo "# 只提取未完成的计划"
echo 'echo "$INIT" | jq '"'"'.plans[] | select(.has_summary == false)'"'"
echo "$INIT" | jq '.plans[] | select(.has_summary == false)'
echo ""

# =============================================================================
echo ""
echo "=========================================="
echo "5. 用 jq 计数"
echo "=========================================="

echo ""
echo "# 计算计划总数"
echo 'echo "$INIT" | jq '"'"'.plans | length'"'"
echo "$INIT" | jq '.plans | length'
echo ""

echo "# 计算 wave 数量"
echo 'echo "$INIT" | jq '"'"'.waves | keys | length'"'"
echo "$INIT" | jq '.waves | keys | length'
echo ""

# =============================================================================
echo ""
echo "=========================================="
echo "6. 实际 GSD 中的用法"
echo "=========================================="

echo ""
echo "# GSD workflow 中通常会这样写："
echo ""
cat << 'SCRIPT'
# 一次性加载所有上下文
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init execute-phase "1")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi

# 解析 JSON
phase_dir=$(echo "$INIT" | jq -r '.phase_dir')
plan_count=$(echo "$INIT" | jq -r '.plan_count')
incomplete_count=$(echo "$INIT" | jq -r '.incomplete_count')
executor_model=$(echo "$INIT" | jq -r '.executor_model')
parallelization=$(echo "$INIT" | jq -r '.parallelization')

# 使用解析后的值
echo "Found ${plan_count} plans in ${phase_dir}"
echo "${incomplete_count} incomplete"
echo "Using ${executor_model} model"
SCRIPT

echo ""
echo "=========================================="
echo "7. 对比：不用 jq 有多麻烦"
echo "=========================================="

echo ""
echo "# 假设我们只想提取 phase_dir 的值"
echo ""
echo "# ❌ 不用 jq（bash 无法直接解析 JSON）:"
echo "#    只能用 grep + sed，非常脆弱"
echo 'echo "$INIT" | grep "phase_dir" | head -1 | sed "s/.*: \"\(.*\)\".*/\1/"'
echo "$INIT" | grep "phase_dir" | head -1 | sed "s/.*: \"\(.*\)\".*/\1/"
echo ""
echo "# ✅ 用 jq（简洁、可靠）:"
echo 'echo "$INIT" | jq -r '"'"'.phase_dir'"'"
echo "$INIT" | jq -r '.phase_dir'
echo ""

# =============================================================================
echo ""
echo "=========================================="
echo "8. jq 常用速查表"
echo "=========================================="

cat << 'CHEATSHEET'
| 操作 | 命令 | 示例 |
|------|------|------|
| 提取字段 | jq '.field' | jq '.name' |
| 提取字段(无引号) | jq -r '.field' | jq -r '.phase_dir' |
| 嵌套字段 | jq '.a.b.c' | jq '.waves["1"]' |
| 数组索引 | jq '.arr[0]' | jq '.plans[0]' |
| 遍历数组 | jq '.arr[]' | jq '.plans[]' |
| 提取数组字段 | jq '.arr[].field' | jq '.plans[].objective' |
| 过滤 | jq 'select(.x == y)' | jq '.plans[] | select(.wave == 1)' |
| 格式化输出 | jq '"\(.)"' | jq '.plans[] | "\(.id): \(.objective)"' |
| 计数 | jq 'length' | jq '.plans | length' |
| 获取 keys | jq 'keys' | jq '.waves | keys' |
CHEATSHEET

echo ""
echo "演示完成！"
