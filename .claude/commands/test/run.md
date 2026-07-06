---
description: 특정 파일 또는 feature의 테스트 실행
arguments:
  - name: target
    description: "테스트 대상 (파일 경로 또는 feature 이름, 예: auth, video, validators)"
    required: false
---

테스트를 실행합니다.

$ARGUMENTS가 주어지면 해당 대상만 테스트합니다:

- 슬라이스 이름이면: `src/` 하위에서 해당 슬라이스 디렉토리를 찾아 `pnpm exec vitest run <경로>` (예: `src/entities/stock/`)
- 파일 경로이면: `pnpm exec vitest run $ARGUMENTS`
- 없으면: `pnpm exec vitest run` (전체 테스트)

테스트 결과를 요약하여 보고합니다:

- 통과/실패 테스트 수
- 실패한 테스트가 있으면 원인 분석
