---
description: React 19 코드 작성 규칙
paths: ["src/**/*.tsx"]
---

# React 19 컨벤션

## API 패턴

- `use(Context)` 사용 (`useContext` 대신)
- `<Context value={...}>` 사용 (`.Provider` 대신)
- ref는 일반 prop으로 전달 (`forwardRef` 금지)
- `React.MouseEvent` 등 네임스페이스 접근 금지 → `import type { MouseEvent } from "react"`

## 함수 스타일

- JSX 인라인 함수 지양 → named 함수로 추출 (`onChange={handleChange}`)
- 예외: useForm의 `{...form.getFieldProps("name")}` spread props 패턴은 허용
- 컴포넌트/커스텀 훅은 `function` 선언 (`export function useAuth()`, `export function SignupForm()`)
- 컴포넌트 내부 이벤트 핸들러는 화살표 함수로 선언 (`const handleClick = () => { ... }`)
- 컴포넌트 외부의 순수 헬퍼 함수는 function 선언 허용

## Effect 규칙

- Effect body에서 동기적으로 setState 호출 금지 (set-state-in-effect)
- 파생 상태는 렌더 중에 직접 계산 (useEffect + setState 대신 변수 or useMemo)
- 외부 스토어(localStorage 등) 구독 시 `useSyncExternalStore` 사용
- Effect는 외부 시스템과의 동기화(DOM 조작, 이벤트 구독)에만 사용

### Hydration mismatch / mounted gate 패턴

server snapshot과 client snapshot이 다른 hook(예: `useViewMode` localStorage 기반)을 직접 className·attribute에 사용하면 hydration mismatch(React #418). `useEffect(() => setMounted(true), [])` 패턴 **금지** — `set-state-in-effect` 룰 위반.

```tsx
// ❌ 금지 — set-state-in-effect 위반
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);

// ✅ 권장 — useHydrated (`@/shared/lib/useHydrated`)
const hydrated = useHydrated();
const effectiveView = hydrated ? view : serverFallback;
```

`useHydrated`는 `useSyncExternalStore` 기반: server snapshot=`false`, client snapshot=`true` → server·client first hydration이 일치 → mismatch 0, cascading render 0.

## 성능

- `useCallback`/`useMemo`: React Compiler가 처리하므로 수동 사용 최소화, Context Provider value 안정성 등 명확한 이유가 있을 때만
