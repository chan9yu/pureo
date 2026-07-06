---
description: 테스트 커버리지 리포트 생성 및 요약
arguments:
  - name: target
    description: "커버리지 대상 (파일 경로 또는 feature 이름)"
    required: false
---

테스트 커버리지를 측정합니다.

`pnpm exec vitest run --coverage` 를 실행하고 결과를 요약합니다:

- 전체 커버리지 퍼센트 (Statements, Branches, Functions, Lines)
- 커버리지가 낮은 파일 목록
- 테스트가 없는 파일 식별

$ARGUMENTS가 주어지면 해당 대상만 측정합니다.
