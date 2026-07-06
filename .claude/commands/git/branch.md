---
description: 새 브랜치를 생성하고 전환해주세요.
---

새 브랜치를 생성하고 전환해주세요:

## 절차

1. `git status`로 현재 작업 상태 확인 (uncommitted 변경사항 체크)
2. `git branch -a`로 기존 브랜치 목록 확인 (중복 방지)
3. 변경사항이 있으면 사용자에게 커밋/스태시 여부 확인
4. `main` 최신화 (원격이 있는 경우): `git checkout main && git pull origin main`
5. 사용자가 지정한 이름으로 브랜치 생성, 미지정 시 아래 규칙으로 제안
6. `git checkout -b <브랜치명>` 실행

## 브랜치 네이밍 규칙

- 형식: `<타입>/<간단한-설명>`
- 소문자 영어, 하이픈(`-`)으로 단어 구분, 50자 이내 권장

| 타입     | 설명             | 예시                        |
| -------- | ---------------- | --------------------------- |
| feat     | 기능 단위 작업   | `feat/watchlist-heart`      |
| fix      | 버그 수정        | `fix/quote-refetch-loop`    |
| refactor | 코드 리팩토링    | `refactor/provider-layer`   |
| style    | UI/스타일링 변경 | `style/card-redesign`       |
| chore    | 설정/의존성 변경 | `chore/eslint-update`       |
| docs     | 문서 작업        | `docs/spec-phase2`          |
| test     | 테스트 추가/수정 | `test/interpret-edge-cases` |

## 주의사항

- **base 브랜치는 `main`**
- 이미 존재하는 브랜치명은 사용하지 않는다
- 진행 중인 기능 브랜치가 있으면 새로 만들지 말고 이어서 작업한다
