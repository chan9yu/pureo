---
description: 현재 브랜치의 변경사항으로 Pull Request를 생성해주세요.
---

현재 브랜치의 변경사항으로 Pull Request를 생성해주세요:

## 절차

1. `git status`로 uncommitted 변경사항 확인 (있으면 커밋 먼저 권유)
2. `git log main..HEAD --oneline`으로 PR에 포함될 커밋 목록 확인
3. `git diff main...HEAD --stat`으로 변경 파일 요약 확인
4. 현재 브랜치가 원격에 푸시되었는지 확인, 미푸시 시 `git push -u origin <브랜치>` 실행
5. PR 제목과 본문 작성
6. `gh pr create --base main`으로 PR 생성
7. 생성된 PR URL 출력

## PR 제목 규칙

- 커밋 메시지와 동일한 형식: `<타입>: <제목>`
- 한국어로 작성, 70자 이내
- 여러 커밋이 포함된 경우 전체 변경의 목적을 요약

## PR 본문 템플릿

```markdown
## 변경 사항

- 주요 변경 내용을 bullet point로 정리

## 관련 문서

- 스펙/계획: docs/superpowers/ 하위 관련 문서 경로

## 테스트

- [ ] `pnpm test` 통과
- [ ] `pnpm build` 성공
- [ ] 개발 서버에서 동작 확인
```

## 주의사항

- PR 생성 전 `pnpm build && pnpm test`를 실행하여 CI 실패를 사전 방지한다
- 커밋이 없는 브랜치로는 PR을 생성하지 않는다
- draft PR이 필요하면 `--draft` 플래그를 사용한다
