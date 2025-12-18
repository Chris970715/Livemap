#!/bin/bash

# PreToolUse hook: Git commit 전 Before 스크린샷 요청
# JSON 구조화 출력을 사용해 Claude에게 직접 메시지 전달
#
# 설정 방법:
# 1. .env에서 OBSIDIAN_VAULT_PATH와 PROJECT_NAME 설정
# 2. 또는 이 스크립트의 기본값 수정

# 환경 변수 로드 (있으면)
if [[ -f "$CLAUDE_PROJECT_DIR/.env" ]]; then
    export $(grep -E '^(OBSIDIAN_VAULT_PATH|PROJECT_NAME)=' "$CLAUDE_PROJECT_DIR/.env" | xargs)
fi

# 기본값 설정
OBSIDIAN_VAULT_PATH="${OBSIDIAN_VAULT_PATH:-$HOME/Desktop/obsidian}"
PROJECT_NAME="${PROJECT_NAME:-my-project}"

# stdin에서 JSON 입력 읽기
input=$(cat)

# jq로 tool_name과 command 추출
tool_name=$(echo "$input" | jq -r '.tool_name // empty')
command=$(echo "$input" | jq -r '.tool_input.command // empty')

# Bash 명령이 git commit을 포함하는지 확인
if [[ "$tool_name" == "Bash" ]] && [[ "$command" == *"git commit"* ]]; then
    # JSON 구조화 출력으로 Claude에게 메시지 전달
    cat << EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "additionalContext": "📷 BEFORE SCREENSHOT REQUIRED\n\n커밋 전에 UI 변경사항이 있으면 Before 스크린샷을 먼저 캡처하세요.\n\n1. 변경된 파일에서 UI 관련 파일 확인 (app/**/*.tsx)\n2. 해당 페이지 URL로 이동하여 스크린샷 캡처\n3. 저장 위치: ${OBSIDIAN_VAULT_PATH}/work/projects/${PROJECT_NAME}/screenshots/\n4. 파일명: YYYY-MM-DD-HHMM-{page-name}-before.png"
  }
}
EOF
fi

exit 0
