---
description: 아이콘 사용 규칙 — lucide-react 단일화
---

# 아이콘 규약

## 기본 원칙

**모든 UI 아이콘은 `lucide-react`로 통일한다.** 다른 아이콘 라이브러리(`react-icons`, `heroicons` 등)
도입 금지 — 번들 크기 증가와 시각적 통일성 저해.

## 사용 패턴

```tsx
import { Search, Heart } from "lucide-react";

<Search className="size-4" aria-hidden />
<button aria-label="관심종목 추가">
  <Heart className="size-5" aria-hidden />
</button>
```

- **Import**: named import만 사용 (tree-shaking). default import 금지.
- **크기**: Tailwind `size-N` 유틸 우선. `width`/`height` prop 지양.
- **색상**: `text-*` 유틸로 `currentColor` 상속.
- **접근성**: 장식용 아이콘은 `aria-hidden`, 아이콘 단독 버튼·링크는 부모에 `aria-label` 필수.

## 예외

- lucide에 없는 **브랜드 마크**만 커스텀 SVG (`src/shared/assets/icons/`, `fill="currentColor"`, kebab-case)
- **데이터 시각화용 SVG**(스파크라인·게이지 등)는 아이콘이 아니므로 컴포넌트로 직접 작성 허용
- 재사용되는 인라인 `<svg>` 장황 마크업 금지 — 파일로 분리
