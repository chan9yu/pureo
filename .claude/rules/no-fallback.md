---
description: Fallback / Workaround 코드 거부 — 본질적 문제 해결 강제
---

# No Fallback / No Workaround

## Why

LLM이 짠 코드의 가장 흔한 안티패턴은 **본질적 문제를 회피하는 fallback / workaround**다. 표면적으로 "에러를 안 내는 것처럼" 보이지만 실제로는:

1. 사용자에게 일부 기능이 **무음 fail** (검색이 동작 안 하는데 모름, 빈 화면이 정상으로 위장)
2. **기술 부채 누적** — 잘못된 패턴이 codebase 전체에 전파
3. **디버깅 단서 소실** — try/catch가 root cause를 삼킴

이 룰은 그 회귀를 차단한다.

## 거부 대상 패턴

다음 패턴이 보이면 **즉시 reject + 본질 fix로 가이드**한다.

### 1. fs / network / 외부 호출 후 try/catch → 빈 값 반환

```ts
// ❌ 거부
try {
	return readFileSync(path);
} catch {
	return ""; // 또는 [], null, undefined
}
```

**왜 안 되나**: fs/network 실패가 발생하는 자체가 **설계 결함**. 빈 값 반환은 결함을 가림.

**올바른 접근**:

- **fs 의존을 빌드 타임으로 이동** — 정적 JSON emit + 모듈 import (lambda 번들에 자동 포함, runtime fs 호출 0)
- **외부 호출을 캐시 / 대체** — build-time prefetch + import
- **호출 지점을 다른 layer로 이동** — RSC layout이 아닌 page-level, 또는 client-side fetch

### 2. 임시 플래그 변수로 분기 회피

```ts
// ❌ 거부
let _hasError = false;
try {
	doThing();
} catch {
	_hasError = true;
}
if (_hasError) {
	/* skip */
}
```

**왜 안 되나**: 흐름을 숨김. 결합 증가. error flag pattern은 type system이 표현 못 하는 implicit state.

**올바른 접근**: error를 propagate하거나 정상 결과 type으로 명시 (`Result<T, E>` 패턴 또는 union type).

### 3. 의미 없는 setTimeout / setInterval

```ts
// ❌ 거부
setTimeout(() => doThing(), 100); // 왜 100ms? (race condition 회피?)
setInterval(() => poll(), 5000); // hydration 우회?
```

**왜 안 되나**: race condition·hydration·async ordering은 타이머가 아닌 **데이터 흐름·이벤트 모델·`useSyncExternalStore`** 등으로 해결.

**올바른 접근**: 타이머에 의존하지 않는 deterministic 로직. React 19에서는 `useSyncExternalStore`, `use()`, Suspense boundary가 대부분의 race를 흡수.

### 4. 조건부 if-else로 broken case 우회

```ts
// ❌ 거부
if (!data || data.length === 0) {
  return <EmptyFallback />; // data는 정상이면 항상 있어야 하는 경우
}
```

**왜 안 되나**: data가 없는 게 *정상 비즈니스 케이스*인지 *예외*인지 코드만 보면 모름.

**올바른 접근**:

- 정상 케이스면 type으로 명시 (`Posts | EmptyState`)
- 예외 케이스면 root cause 수정 (왜 data가 없는가?)

### 5. fallback prop 또는 기본값으로 누락 데이터 가림

```ts
// ❌ 거부
const title = post.title ?? "제목 없음";
const date = post.date || "1970-01-01";
```

**왜 안 되나**: schema가 실제로 optional이 아닌데 `??`/`||`로 _마치 optional인 것처럼_ 취급. 데이터 손상이 silent UX 손상으로 이어짐.

**올바른 접근**: schema로 required 명시 (Zod 등), 빌드 타임 검증으로 누락을 빌드 fail로 바꿈.

## 허용 예외 (fallback이 아니라 합리적 방어)

다음은 거부 대상이 아니다 — *설계*된 fail-soft layer:

- **외부 API 일시 실패에 대한 retry / circuit breaker** — 외부 의존성, 우리가 통제 불가능. 단, 격리된 layer에서 명시적으로 처리.
- **사용자 입력 검증 후 거부** — invalid input은 정상 비즈니스 케이스 (Zod parse + return error).
- **explicit empty state UI** — 검색 결과 0건, 빈 태그 페이지 등 정상 비즈니스 시나리오.
- **명시적으로 격리된 graceful degradation** — 스펙에 fail mode가 명시된 경우만. 예: 종목 카드의 섹션 부분 실패 → 해당 섹션만 "불러오지 못했어요 + 재시도" 표시(설계 문서 7절에 기획된 동작), 카드 전체는 유지.

핵심 차이: 합리적 방어는 **요구사항에 명시된 동작**(스펙 문서에 적힌 fail mode), fallback 안티패턴은 **요구사항에 없는 임기응변**.

## 적용 절차

코드 리뷰 / 핫픽스 작업 중 fallback 패턴 발견 시:

1. **즉시 reject** — 회피 코드 적용 금지
2. **본질 문제 명시** — "왜 이 fs/throw가 발생하는가? 어떤 설계 결함이 원인인가?"
3. **본질 fix 옵션 제시** — 최소 2개:
   - 데이터 흐름 변경 (예: runtime fetch → build-time emit)
   - 아키텍처 layer 이동 (예: RSC fs 의존 → static JSON import)
   - 의존성 제거 (예: 매 요청 fs.readdir → 단일 모듈 import)
4. 사용자 결정 후 **본질 fix 적용**
