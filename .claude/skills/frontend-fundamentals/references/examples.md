# Frontend Fundamentals — 상세 코드 예제

네 가지 원칙을 적용하는 구체적인 Before/After 코드 예제. 원칙 적용 시 참조.

## 목차

- [가독성](#가독성)
  - [동시에 실행되지 않는 코드 분리](#동시에-실행되지-않는-코드-분리)
  - [구현 세부사항 추상화](#구현-세부사항-추상화)
  - [관심사별 훅 분리](#관심사별-훅-분리)
  - [복잡한 조건에 이름 붙이기](#복잡한-조건에-이름-붙이기)
  - [매직 넘버에 이름 붙이기](#매직-넘버에-이름-붙이기)
  - [시선 이동 줄이기](#시선-이동-줄이기)
  - [삼항 연산자 단순화](#삼항-연산자-단순화)
  - [왼쪽에서 오른쪽으로 비교](#왼쪽에서-오른쪽으로-비교)
- [예측 가능성](#예측-가능성)
  - [중복 이름 피하기](#중복-이름-피하기)
  - [반환 타입 통일](#반환-타입-통일)
  - [숨겨진 로직 드러내기](#숨겨진-로직-드러내기)
- [응집도](#응집도)
  - [함께 수정되는 파일을 같은 디렉토리에](#함께-수정되는-파일을-같은-디렉토리에)
  - [응집도를 위한 매직 넘버 제거](#응집도를-위한-매직-넘버-제거)
  - [폼 응집도 수준](#폼-응집도-수준)
- [결합도](#결합도)
  - [책임을 개별적으로 관리](#책임을-개별적으로-관리)
  - [코드 중복 허용](#코드-중복-허용)
  - [Props Drilling 제거](#props-drilling-제거)

---

## 가독성

### 동시에 실행되지 않는 코드 분리

조건에 따라 완전히 다른 UI를 보여주는 컴포넌트는 각 분기를 별도 컴포넌트로 분리한다.

**Before — 분기가 뒤섞인 코드:**

```tsx
function SubmitButton() {
	const isViewer = useRole() === "viewer";

	useEffect(() => {
		if (isViewer) return;
		showButtonAnimation();
	}, [isViewer]);

	return isViewer ? <TextButton disabled>Submit</TextButton> : <Button type="submit">Submit</Button>;
}
```

**After — 분리된 코드:**

```tsx
function SubmitButton() {
	const isViewer = useRole() === "viewer";
	return isViewer ? <ViewerSubmitButton /> : <AdminSubmitButton />;
}

function ViewerSubmitButton() {
	return <TextButton disabled>Submit</TextButton>;
}

function AdminSubmitButton() {
	useEffect(() => {
		showButtonAnimation();
	}, []);
	return <Button type="submit">Submit</Button>;
}
```

이유: 각 컴포넌트가 정확히 하나의 분기만 처리한다. 독자가 어떤 코드가 언제 실행되는지 머릿속에서 교차시킬 필요가 없다.

---

### 구현 세부사항 추상화

저수준 인증 확인 로직이 페이지 컴포넌트를 어지럽히면, Guard 컴포넌트로 추출한다.

**Before:**

```tsx
function LoginStartPage() {
	useCheckLogin({
		onChecked: (status) => {
			if (status === "LOGGED_IN") {
				location.href = "/home";
			}
		}
	});
	return <>{/* ...로그인 UI... */}</>;
}
```

**After:**

```tsx
function App() {
	return (
		<AuthGuard>
			<LoginStartPage />
		</AuthGuard>
	);
}

function AuthGuard({ children }) {
	const status = useCheckLoginStatus();
	useEffect(() => {
		if (status === "LOGGED_IN") {
			location.href = "/home";
		}
	}, [status]);
	return status !== "LOGGED_IN" ? children : null;
}

function LoginStartPage() {
	return <>{/* ...로그인 UI... */}</>;
}
```

이유: LoginStartPage는 로그인 UI만 다룬다. 리다이렉트 관심사는 추상화되어 분리된다.

---

### 관심사별 훅 분리

**Before — 하나의 훅이 모든 쿼리 파라미터를 관리:**

```typescript
export function usePageState() {
	const [query, setQuery] = useQueryParams({
		cardId: NumberParam,
		dateFrom: DateParam,
		dateTo: DateParam,
		statusList: ArrayParam
	});
	return useMemo(
		() => ({
			values: {/* 모든 파라미터 */},
			controls: {/* 모든 setter */}
		}),
		[query, setQuery]
	);
}
```

**After — 관심사별 개별 훅:**

```typescript
export function useCardIdQueryParam() {
	const [cardId, setCardId] = useQueryParam("cardId", NumberParam);
	return [
		cardId ?? undefined,
		useCallback((id: number) => {
			setCardId(id, "replaceIn");
		}, [])
	] as const;
}
```

이유: 좁은 책임, 명확한 이름, 관련 소비자만 리렌더링된다.

---

### 복잡한 조건에 이름 붙이기

**Before:**

```typescript
const result = products.filter((product) =>
	product.categories.some(
		(category) =>
			category.id === targetCategory.id && product.prices.some((price) => price >= minPrice && price <= maxPrice)
	)
);
```

**After:**

```typescript
const matchedProducts = products.filter((product) =>
	product.categories.some((category) => {
		const isSameCategory = category.id === targetCategory.id;
		const isPriceInRange = product.prices.some((price) => price >= minPrice && price <= maxPrice);
		return isSameCategory && isPriceInRange;
	})
);
```

---

### 매직 넘버에 이름 붙이기

**Before:** `await delay(300);`
**After:** `const ANIMATION_DELAY_MS = 300; await delay(ANIMATION_DELAY_MS);`

---

### 시선 이동 줄이기

**Before — `POLICY_SET`, `getPolicyByRole`, JSX 사이를 오가며 읽어야 함:**

```tsx
function Page() {
	const user = useUser();
	const policy = getPolicyByRole(user.role);
	return (
		<div>
			<Button disabled={!policy.canInvite}>Invite</Button>
			<Button disabled={!policy.canView}>View</Button>
		</div>
	);
}

function getPolicyByRole(role) {
	/* ... POLICY_SET 참조 ... */
}
const POLICY_SET = { admin: ["invite", "view"], viewer: ["view"] };
```

**After — 정책 객체를 인라인:**

```tsx
function Page() {
	const user = useUser();
	const policy = {
		admin: { canInvite: true, canView: true },
		viewer: { canInvite: false, canView: true }
	}[user.role];

	return (
		<div>
			<Button disabled={!policy.canInvite}>Invite</Button>
			<Button disabled={!policy.canView}>View</Button>
		</div>
	);
}
```

---

### 삼항 연산자 단순화

**Before:**

```typescript
const status = ACondition && BCondition ? "BOTH" : ACondition || BCondition ? (ACondition ? "A" : "B") : "NONE";
```

**After:**

```typescript
const status = (() => {
	if (ACondition && BCondition) return "BOTH";
	if (ACondition) return "A";
	if (BCondition) return "B";
	return "NONE";
})();
```

---

### 왼쪽에서 오른쪽으로 비교

**Before:** `if (price >= minPrice && price <= maxPrice)`
**After:** `if (minPrice <= price && price <= maxPrice)`

수학 부등식처럼 읽힌다: minPrice ≤ price ≤ maxPrice.

---

## 예측 가능성

### 중복 이름 피하기

라이브러리가 `http`를 export하는데 서비스에서 래핑한다면, 구별되는 이름을 사용한다:

**Before:** `export const http = { async get(url) { /* 인증 토큰 추가 */ } }`
**After:** `export const httpService = { async getWithAuth(url) { /* 인증 토큰 추가 */ } }`

`getWithAuth`라는 이름이 추가된 동작을 드러낸다.

---

### 반환 타입 통일

**Before — 일관성 없는 훅 반환 타입:**

```typescript
function useUser() {
	return query;
} // Query 객체 반환
function useServerTime() {
	return query.data;
} // raw 데이터만 반환
```

**After — 모두 Query 객체 반환:**

```typescript
function useUser() {
	return query;
}
function useServerTime() {
	return query;
}
```

Validation 함수도 동일한 원칙 — Discriminated Union 사용:

```typescript
type ValidationResult = { ok: true } | { ok: false; reason: string };
```

---

### 숨겨진 로직 드러내기

**Before — fetchBalance가 몰래 로깅:**

```typescript
async function fetchBalance(): Promise<number> {
	const balance = await http.get<number>("...");
	logging.log("balance_fetched"); // 숨겨진 사이드 이펙트!
	return balance;
}
```

**After — 호출자가 명시적으로 조합:**

```typescript
async function fetchBalance(): Promise<number> {
	return await http.get<number>("...");
}

// 호출 측에서:
const balance = await fetchBalance();
logging.log("balance_fetched");
```

---

## 응집도

### 함께 수정되는 파일을 같은 디렉토리에

**Before — 타입별 구조 (낮은 응집도):**

```
src/
├── components/   ← 모든 도메인의 100개 이상 파일
├── hooks/
├── utils/
```

**After — 기능별 구조 (높은 응집도):**

```
src/
├── shared/components/
├── features/
│   ├── auth/components, hooks, utils
│   └── video/components, hooks, utils
```

`../../../video/hooks/useFoo` 같은 크로스 도메인 import는 명확한 코드 스멜이다.

---

### 응집도를 위한 매직 넘버 제거

CSS 트랜지션과 JS delay가 같은 애니메이션 시간을 공유한다면, 상수로 추출하여 항상 함께 업데이트되게 한다.

---

### 폼 응집도 수준

**필드 수준** — 각 필드가 독립적으로 검증. 필드가 재사용되거나 비동기 검증이 필요할 때 적합.
**폼 수준** — 단일 스키마가 전체를 검증. 모든 필드가 하나의 비즈니스 작업을 구성할 때 적합 (예: 결제).

변경 단위가 필드인지 폼인지에 따라 선택한다.

---

## 결합도

### 책임을 개별적으로 관리

`usePageState()`(모든 파라미터 관리)를 `useCardIdQueryParam()` 같은 관심사별 훅으로 분리하여 영향 범위를 제한한다.

---

### 코드 중복 허용

두 페이지가 오늘은 비슷한 로직을 공유하지만 내일 달라질 수 있다면, 10줄 중복이 다음보다 낫다:

- 각 변형에 복잡한 파라미터가 필요한 공유 훅
- 변경할 때마다 모든 소비자를 테스트해야 하는 부담
- 점점 수정하기 어려워지는 코드

질문: "이 사용 사례들이 항상 함께 변경될까?" 아니라면 → 중복 허용.

---

### Props Drilling 제거

**Before — 여러 레이어를 통해 props 전달:**

```tsx
<ItemEditModal items={items} keyword={keyword} onConfirm={onConfirm}>
	<ItemEditBody items={items} keyword={keyword} onConfirm={onConfirm}>
		<ItemEditList items={items} keyword={keyword} onConfirm={onConfirm} />
	</ItemEditBody>
</ItemEditModal>
```

**After — Composition 패턴:**

```tsx
function ItemEditModal({ open, items, recommendedItems, onConfirm, onClose }) {
	const [keyword, setKeyword] = useState("");
	return (
		<Modal open={open} onClose={onClose}>
			<Input value={keyword} onChange={(e) => setKeyword(e.target.value)} />
			<Button onClick={onClose}>Close</Button>
			<ItemEditList keyword={keyword} items={items} recommendedItems={recommendedItems} onConfirm={onConfirm} />
		</Modal>
	);
}
```

트리를 평탄화한다. 데이터가 있는 곳에서 직접 자식을 렌더링한다. 불필요한 래퍼 레이어를 제거한다.
