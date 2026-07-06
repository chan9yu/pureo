---
description: 전체적인 코드 퀄리티 리뷰를 진행해주세요.
arguments:
  - name: target
    description: "리뷰 대상 (슬라이스 이름 또는 파일 경로, 예: stock-detail, src/entities/stock). 미지정 시 최근 변경 파일 대상"
    required: false
---

# 심층 코드 퀄리티 리뷰

ultrathink

## 스킬 로드

아래 3개 스킬을 순서대로 호출하여 리뷰 기준을 컨텍스트에 로드하세요:

1. `/vercel-react-best-practices` 스킬 호출
2. `/nextjs-best-practices` 스킬 호출
3. `/frontend-fundamentals` 스킬 호출

## 리뷰 대상 결정

$ARGUMENTS가 주어지면:

- 슬라이스 이름이면: `src/` 하위에서 해당 슬라이스 디렉토리를 찾아 전체
- 파일/디렉토리 경로이면: 해당 경로

$ARGUMENTS가 없으면:

- `git diff --name-only HEAD~5` 또는 최근 변경된 파일들을 대상으로 선정

## 리뷰 진행 방식

**두 리뷰어를 병렬로 실행합니다.**

### Team 1: React/Next.js + 코드 품질 리뷰어

- `react-nextjs-code-reviewer` 에이전트 사용
- 중점: React 19 패턴 준수, hooks 규칙, Server/Client Component 분리, 렌더링 최적화,
  가독성·응집도·결합도·네이밍 (`/frontend-fundamentals` 기준)
- `/vercel-react-best-practices`와 `/nextjs-best-practices` 기준 적용
- `.claude/rules/` 규칙 위반 여부 체크

### Team 2: 경계면/아키텍처 리뷰어

- `boundary-mismatch-qa` 에이전트 사용
- 중점: FSD Layer Import Rule(app→pages→widgets→features→entities→shared 단방향) 준수,
  슬라이스 public API 우회 여부, Route Handler ↔ 클라이언트 fetch 계약 일치, TanStack Query
  queryKey/타입 정합성
- `.claude/rules/project-structure.md` 기준 적용

## 리뷰 기준 체크리스트

### 가독성

- [ ] 코드 흐름이 위에서 아래로 자연스럽게 읽히는가
- [ ] 함수/컴포넌트 길이가 적절한가 (단일 책임)
- [ ] 조건문/분기가 복잡하지 않은가

### 네이밍

- [ ] 변수/함수/컴포넌트명이 의도를 명확히 전달하는가
- [ ] boolean은 is/has/should, 이벤트 핸들러는 handle/on 접두사

### 응집도와 결합도

- [ ] 관련 로직이 한 곳에 모여있는가
- [ ] 슬라이스 간 크로스 임포트가 없는가
- [ ] shared에 도메인 지식이 누수되지 않았는가

### 유지보수성

- [ ] 중복 코드 (3회 이상 반복이면 추출 고려)
- [ ] 에러 처리가 일관적인가, 매직 넘버 대신 상수인가
- [ ] 타입 안전성 (any, 타입 단언 최소화)

### React/Next.js Best Practice

- [ ] Server/Client Component 분리, "use client" 최소화
- [ ] Effect 적절성 (파생 상태는 렌더 중 계산)
- [ ] 데이터 페칭 전략 (캐싱, 병렬 페칭, 워터폴 방지)

## 결과 보고 형식

```
## 코드 퀄리티 리뷰 결과

### 요약
- 리뷰 대상: [파일/슬라이스 목록]
- 전체 평가: [A/B/C/D/F]
- 핵심 발견사항: [1~3줄 요약]

### 칭찬할 점 (Keep)
- ...

### 개선 제안 (Improve)
- [파일:라인] 설명 — 심각도: High/Medium/Low

### 리팩토링 제안 (Consider)
- ...
```

## 주의사항

- 리뷰만 수행하고 코드 수정은 하지 않는다
- 사소한 스타일 이슈보다 구조적/설계적 문제에 집중한다
- 구체적인 파일명과 라인 번호를 포함하여 피드백한다
- 긍정적인 부분(잘 된 점)도 반드시 포함한다
