---
description: React 컴포넌트 작성 규칙
paths: ["src/**/*.tsx"]
---

# 컴포넌트 컨벤션

- Props는 별도 type으로 선언 (인라인 타입 금지)
- 파일당 하나의 컴포넌트만 export (Props 미노출, 외부에서 필요 시 `ComponentProps<typeof C>`로 추론)
- 복합 컴포넌트: `Object.assign` 패턴 — 서브 함수/타입에 부모 prefix 필수
- `"use client"`: hooks/browser API/이벤트 핸들러 직접 사용 시에만
- 무거운 클라이언트 컴포넌트는 `next/dynamic`으로 지연 로딩
- 컴포넌트 배치(레이어·슬라이스 선택) 기준: `.claude/rules/project-structure.md` 참조
