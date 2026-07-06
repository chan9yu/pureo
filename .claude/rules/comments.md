# 주석 컨벤션

## 기본 원칙: **No comments by default**

코드는 잘 명명된 식별자와 작은 함수로 자기 설명적이어야 한다. 주석을 추가하기 전에 먼저 함수·변수·타입 이름으로 의도를 표현한다. **주석을 작성하지 않는 것이 기본값**.

## Why over What

주석을 쓴다면 **Why** 만. **What**은 코드가 이미 표현한다.

```ts
// ❌ What — 코드가 이미 표현
// posts를 date 기준 내림차순 정렬
posts.sort((a, b) => b.date.localeCompare(a.date));

// ✅ Why — 비명시적 제약
// Finnhub 무료 티어는 분당 60회 제한 — 서버 캐시 TTL을 60초 밑으로 내리지 말 것
const QUOTE_REVALIDATE_SECONDS = 60;
```

## 작성해도 되는 4가지 케이스만

1. **비명시적 제약** — 코드만 봐서는 알 수 없는 외부 제약 (브라우저 버그·플랫폼 limit·라이선스·API quota·spec 인용)
2. **Subtle invariant** — 호출 순서·precondition·동기화 가정 (race condition 회피, dependency 순서)
3. **Workaround** — 우회 코드 + 근본 원인의 연관 이슈 ID/PR/issue 또는 회고 위치
4. **회귀 차단** — incident postmortem 결과로 이 라인이 존재하는 이유 (ex: v1.1.0 production stuck)

## 금지 패턴

다음은 **반드시 제거**한다 (코드 리뷰에서 reject):

| ❌ 금지                                 | 이유                               |
| --------------------------------------- | ---------------------------------- |
| `// 사용자 정보를 가져온다` (What 설명) | 함수명 `getUser()`가 이미 표현     |
| `// added for X feature` (이력)         | git blame/PR이 추적                |
| `// 2026-04-15에 수정됨` (변경 이력)    | git log가 추적                     |
| `// TODO/FIXME without ticket`          | 추적 불가, 영구 부채               |
| `// hack: ...` (워크어라운드 미설명)    | workaround 이유·티켓 누락          |
| 코드와 **중복되는 주석**                | 동기화 비용 + 거짓말 위험          |
| `// === SECTION ===` 같은 ASCII 박스    | 시각적 노이즈, 함수 추출이 더 낫다 |
| 함수 시작에 한 줄 한 줄 단계 설명       | 함수 추출 또는 변수명 개선         |

## JSDoc 사용 기준

- **Public API** (슬라이스 `index.ts`에서 export되는 함수): 시그니처가 명확하면 JSDoc 생략. 인자 의미가 비명시적일 때만 `@param`. 한 줄 description 권장.
- **Internal helper**: JSDoc 미사용. 이름과 타입으로 충분.
- **`@deprecated`**: 대체 API 명시 필수 (`@deprecated use X instead`).
- **다단 paragraph JSDoc 금지** — 정보가 정말 길면 별도 README.md 또는 docs/.

## 주석 한 줄 길이

- **한 줄 권장**: 80~120자 이내. 가독성 + diff 친화적.
- 두 줄 넘게 필요하면 **함수 추출 시도** 후 그래도 필요하면 작성.
- 다단 paragraph는 README.md 또는 inline 스토리텔링이 필요한 회고 케이스에만.

## "필요해서 추가한 것"의 자기 검증

주석 작성 직전 다음 질문:

1. 이 주석을 지우면 **6개월 뒤 후임자(또는 미래의 나)가 헷갈릴까?** No → 삭제.
2. 코드 자체로 **이 정보를 표현할 방법이 있는가?** Yes → 함수 추출 / 변수명 개선 / 타입 narrowing.
3. 이 정보가 **git history (commit·PR·issue)에 더 잘 맞지 않는가?** Yes → 거기로 이동.
