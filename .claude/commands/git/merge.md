---
description: PR을 머지하고 브랜치를 정리해주세요.
---

PR을 머지하고 브랜치를 정리해주세요:

## 절차

1. `gh pr list`로 열린 PR 목록 확인
2. 사용자가 지정한 PR 번호 또는 현재 브랜치의 PR을 대상으로 선택
3. `gh pr view <번호>`로 PR 상태(리뷰, CI 체크) 확인
4. CI 체크가 통과했는지 확인 (`gh pr checks <번호>`)
5. 머지 전 사용자에게 최종 확인 요청
6. `gh pr merge <번호>` 실행 (기본: squash merge)
7. 머지 완료 후 로컬 브랜치 정리

## 머지 전략

- **기본**: Squash merge (`--squash`) — 깔끔한 히스토리 유지
- 사용자가 명시적으로 요청 시 다른 전략 사용 (`--rebase`, `--merge`)

## 머지 후 정리

```bash
git checkout main
git pull origin main
git branch -d <머지된-브랜치>
```

## 주의사항

- CI 체크가 실패한 PR은 머지하지 않는다 (사용자에게 실패 원인 안내)
- 머지 충돌이 있으면 사용자에게 알리고 해결 방법을 제안한다
- `main`에 직접 force push하지 않는다
- 원격 브랜치 삭제는 GitHub PR 머지 시 자동 처리되므로 별도 실행하지 않는다
- 로컬 브랜치 삭제 전 머지 완료를 반드시 확인한다 (`-d` 사용, `-D` 지양)
