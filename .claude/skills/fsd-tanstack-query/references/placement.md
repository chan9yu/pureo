# 배치 결정 상세 — query·mutation을 어디에 둘 것인가

> 원천: fsd.how/kr `guides/tech/with-react-query` — "query key를 어디에 둘 것인가" · "mutation은 어디에 둘 것인가"

## 목차

1. [query factory 배치 — 3가지 옵션](#1-query-factory-배치--3가지-옵션)
2. [mutation 배치 — 2가지 옵션](#2-mutation-배치--2가지-옵션)
3. [mutation key 배치](#3-mutation-key-배치)
4. [레이어 임포트 규칙과의 상호작용](#4-레이어-임포트-규칙과의-상호작용)
5. [코드 생성 도구 산출물](#5-코드-생성-도구-산출물)

---

## 1. query factory 배치 — 3가지 옵션

query key는 보통 query factory·API 호출 함수와 같은 곳에서 관리한다. 어느 레이어에 두는지는 프로젝트 구성에 따라 달라진다.

### 옵션 A — shared에 두기

프로젝트 전반의 API를 `shared/api` 한곳에 모아 관리하려는 경우. query factory는 `shared/api/queries` 아래에 두고 `shared/api/index.ts`의 public API로 노출한다.

```
src/
├── app/ …
├── pages/ …
├── widgets/ …
├── features/ …
├── entities/ …
└── shared/
    └── api/
        ├── queries/            ← query factory 모음
        │   ├── example.ts
        │   └── another-example.ts
        └── index.ts
```

```ts
// src/shared/api/index.ts
export { exampleQueries } from "./queries/example";
```

### 옵션 B — shared에 두되 controller 단위로 나누기

endpoint 수가 많아지면 `shared/api/queries` 한 폴더에 모두 모으는 방식은 관리하기 어려워진다. controller(백엔드 리소스) 단위로 폴더를 나누고, **각 controller마다 `index.ts`로 public API를 따로 둔다**.

```
src/shared/api/
├── example/
│   ├── index.ts
│   ├── example.query.ts        ← example controller의 key + query factory
│   ├── get-example.ts
│   ├── create-example.ts
│   ├── update-example.ts
│   └── delete-example.ts
└── another-example/
    ├── index.ts
    ├── another-example.query.ts
    └── …
```

```ts
// src/shared/api/example/index.ts
export { exampleQueries } from "./example.query";
```

### 옵션 C — entities에 두기

프로젝트가 이미 entity 단위로 나뉘어 있고 **각 요청이 하나의 entity에 대응**한다면 가장 자연스러운 방식. 해당 entity의 `api` 세그먼트에 query factory와 실제 API 호출 함수를 함께 둔다.

```
src/entities/example/
└── api/
    ├── example.query.ts        ← key + query factory
    ├── get-example.ts
    ├── create-example.ts
    ├── update-example.ts
    └── delete-example.ts
```

한 entity가 다른 entity를 참조한다면(예: Country entity가 City entity 목록을 필드로 갖는 경우) public API를 이용한 `@x` cross-import를 사용한다.

### 선택 기준 요약

| 신호                                                       | 선택   |
| ---------------------------------------------------------- | ------ |
| API 표면이 작고 한곳에서 훑고 싶다                         | 옵션 A |
| endpoint가 많다 / 백엔드가 controller·리소스 단위로 정리됨 | 옵션 B |
| 도메인 모델(entities)이 이미 서 있고 요청이 entity와 1:1   | 옵션 C |

옵션 A → B는 폴더 재배치만으로 이행 가능하다. A/B → C는 entities 레이어 도입 여부가 걸린 아키텍처 결정이므로, entity 재사용이 명확해진 뒤에 이동한다 (FSD 일반 원칙: 재사용이 확인될 때만 하위 레이어로 추출).

---

## 2. mutation 배치 — 2가지 옵션

**mutation은 query와 같은 파일에 함께 두지 않는 것을 권장**한다. mutation은 저장·삭제·수정처럼 특정 사용자 동작 뒤에 실행되는 경우가 많고, 이후의 캐시 갱신이나 UI 처리도 화면마다 달라지기 쉽기 때문이다.

### 옵션 A — 사용처와 가까운 api 세그먼트에 custom hook

화면 흐름과 밀접하게 연결되는 mutation은 사용하는 위치와 가까운 `api` 세그먼트에 custom hook 형태로 둔다.

```ts
// src/pages/example/api/use-update-example.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, POST_QUERIES } from "@/shared/api/post";

interface UpdateExample {
	id: number;
	newTitle: string;
}

export const useUpdateExample = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, newTitle }: UpdateExample) => {
			const { data } = await apiClient.patch(`/posts/${id}`, { title: newTitle });
			return data;
		},
		onSuccess: (newPost, { id }) => {
			queryClient.setQueryData(POST_QUERIES.detail(id).queryKey, newPost);
		}
	});
};
```

캐시 갱신(`setQueryData`·`invalidateQueries`)에 query factory의 key를 재사용하는 것이 이 패턴의 핵심 — key 문자열이 흩어지지 않는다.

### 옵션 B — shared/entities에 mutationFn 두고, hook은 사용처에서 구성

mutation **로직의 재사용 단위**와 **hook을 구성하는 위치**를 나누는 방식. mutation 함수는 shared나 entities에 두고, 컴포넌트에서는 `useMutation`을 직접 구성하면서 `mutationFn`으로 연결한다.

```tsx
// src/pages/example/ui/example.tsx
import { useMutation } from "@tanstack/react-query";
import { mutations } from "@/shared/api/example";

export const Example = () => {
	const [title, setTitle] = useState("");
	const { mutate, isPending } = useMutation({
		mutationFn: mutations.createExample
	});

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		mutate({ title, userId: DEFAULT_USER_ID });
	};

	return (
		<form onSubmit={handleSubmit}>
			<Input onChange={(e) => setTitle(e.target.value)} value={title} />
			<Button type="submit" disabled={isPending}>
				Create
			</Button>
		</form>
	);
};
```

### 선택 기준

| 신호                                                         | 선택   |
| ------------------------------------------------------------ | ------ |
| 후처리(캐시 무효화·낙관적 업데이트·리다이렉트)가 화면에 종속 | 옵션 A |
| 같은 mutation 로직을 여러 화면에서 서로 다른 후처리로 사용   | 옵션 B |

---

## 3. mutation key 배치

`useMutationState`로 다른 컴포넌트에서 mutation 진행 상태를 읽으려면 `mutationKey`가 필요하다. mutation key는 **query factory와 같은 파일**에 모아 둔다 (query key와 동일한 단일 관리 지점).

```ts
// src/shared/api/post/post.queries.ts
export const POST_MUTATIONS = {
	updateTitle: () => ["post", "update-title"],
	create: () => ["post", "create"]
};
```

사용 흐름 전체(식별 → 교차 조회)는 `patterns.md` §6 참조.

---

## 4. 레이어 임포트 규칙과의 상호작용

서버 상태 코드에도 FSD Layer Import Rule이 그대로 적용된다:

- query factory를 **shared**에 두면 모든 상위 레이어에서 사용 가능 — 가장 제약 없는 위치.
- **`entities/<slice>/api`**에 두면 pages·widgets·features에서 사용 가능. 다른 entity에서 쓰려면 `@x` cross-import가 필요하다.
- mutation hook을 **`pages/<slice>/api`**에 두면 그 페이지 전용이다. 다른 페이지에서도 필요해지면 — 여러 페이지 재사용이 **명확해졌을 때만** — `features/<slice>/api`로 내리거나 옵션 B(mutationFn 분리)로 전환한다.
- feature의 mutation hook은 shared의 key 상수·apiClient만 참조할 수 있다 — **feature 간 크로스 임포트 금지** 규칙은 서버 상태 코드에도 동일하다.

---

## 5. 코드 생성 도구 산출물

Swagger/OpenAPI 명세가 잘 정리되어 있고 생성 도구를 중심으로 API 계층을 운영한다면, 생성된 코드를 `shared/api`에 모아 두는 방식을 고려할 수 있다. 다만 자동 생성은 위에서 설명한 수동 구성만큼 세밀하게 맞추기는 어렵다 — factory 계층 설계·화면별 mutation 후처리는 생성 코드 위에 수동으로 얹게 된다.
