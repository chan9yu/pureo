#!/bin/bash
# 방금 수정된 파일 하나만 포맷한다.

file_path=$(jq -r '.tool_input.file_path // empty' 2>/dev/null)
[ -z "$file_path" ] && exit 0
[ -f "$file_path" ] || exit 0

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

pnpm exec prettier --write --ignore-unknown "$file_path" >/dev/null 2>&1

exit 0
