---
description: TypeScript 및 Import/Export 규칙
paths: ["src/**/*.ts", "src/**/*.tsx"]
---

# TypeScript 컨벤션

- strict mode 필수
- 리턴 타입 자동 추론 가능하면 명시 금지 (함수, 메서드 모두)
- 인터페이스에 `I` prefix 금지 (`IStorageAdapter` → `StorageAdapterPort` 또는 `StorageAdapter`)
- `@deprecated` 표시된 API 사용 지양, 최신 지원 API로 대체
- Non-null assertion (`!`) 사용 금지 — 타입 가드, props 전달 등으로 타입을 좁힐 것

## Import/Export

- Named exports 우선 (프레임워크 요구사항 예외: page.tsx, layout.tsx 등)
- Import 순서: external → internal (`@/*`) → relative (`./`, `../`)
- 모듈 간 import: `@/*` 절대 경로 (예: `@/shared/api/http`)
- 같은 슬라이스 내부: `./`, `../` 상대 경로
- 배럴 파일(index.ts): pages 슬라이스만 배럴 필수, app·shared는 파일 단위 직접 import (상세: `project-structure.md` §6)
  - **배럴은 re-export만 허용**: `export { X } from "./X"` / `export type { T } from "./T"` 형태만. 타입·상수·함수 직접 정의 금지
  - 배럴에 `"use client"` 금지 — 서버/클라이언트 혼재 + 클라이언트 소비자 등장 시 split barrel
- 레이어 간 의존성(단방향, 크로스 임포트 금지): `.claude/rules/project-structure.md`의 **FSD Layer Import Rule** 참조
