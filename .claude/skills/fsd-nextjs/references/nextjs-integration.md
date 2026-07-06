# FSD × Next.js 통합 상세

> 원천: fsd.how/kr `guides/tech/with-nextjs` + `guides/examples/page-layout` + `guides/examples/api-requests`

## 핵심 문제와 공식 해법

Next.js가 요구하는 `app`(App Router)·`pages`(Pages Router) 폴더는 FSD의 `app`·`pages` **레이어**와 이름이 충돌한다. 공식 문서가 제시하는 해법은 단일 방식이다:

> Next.js의 `app` 폴더는 프로젝트 루트에 두고 라우팅에 필요한 파일만 배치한다. 페이지는 `src` 하위의 FSD pages 레이어에 두고, 루트 `app` 폴더의 각 라우트 파일에서 이를 가져와 연결한다.

즉 **루트 = Next.js 규약 영역(얇은 접착제), `src/` = FSD 영역(모든 구현)**. 라우팅 파일에는 어떤 구현도 남기지 않는다.

## App Router

### 디렉토리 구조

```
app/                        ← Next.js 라우팅 (루트)
├── api/
│   └── example/
│       └── route.ts
└── example/
    └── page.tsx

pages/                      ← 빈 폴더 (빌드 실패 방지용)
└── README.md               ← 왜 존재하는지 설명

src/
├── app/                    ← FSD app 레이어
│   └── api-routes/
├── pages/                  ← FSD pages 레이어 (실제 페이지 구현)
│   └── example/
│       ├── index.ts
│       └── ui/
│           └── example.tsx
├── widgets/
├── features/
├── entities/
└── shared/
```

### ⚠️ 빈 `pages/` 폴더는 필수다

루트에 빈 `pages` 폴더가 없으면, App Router를 사용하더라도 Next.js가 `src/pages`(FSD 레이어)를 **Pages Router로 인식해 빌드가 실패**한다. 빈 폴더 안에 존재 이유를 설명하는 `README.md`를 함께 두는 것이 공식 권장이다:

```md
<!-- pages/README.md -->

# 이 폴더는 왜 비어 있나

이 폴더는 의도적으로 비어 있다. 루트에 `pages/`가 없으면 Next.js가
`src/pages/`(FSD pages 레이어)를 Pages Router로 인식해 빌드가 실패한다.
삭제하지 말 것.
```

### 라우트 파일 = one-line re-export

```tsx
// app/example/page.tsx
export { ExamplePage as default, metadata } from "@/pages/example";
```

- 실제 구현은 `src/pages/example/ui/example.tsx`에 있고, 슬라이스 public API(`index.ts`)를 거쳐 노출된다.
- **`metadata`도 FSD pages 슬라이스가 소유**하고 라우트 파일이 re-export한다. SEO 메타데이터까지 FSD 레이어에 두는 것이 공식 예시의 원리.
- `@/` alias는 `src/`를 가리키도록 설정한다 (tsconfig `paths`).
- `layout.tsx`·`loading.tsx`·`error.tsx`에 대한 공식 예시는 문서에 없으나, `page.tsx`와 동일한 re-export 원리를 적용하는 것이 자연스러운 확장이다 (공식 문서 외 보충).

### Route Handler (API)

핸들러 구현은 FSD `app` 레이어의 `api-routes` 세그먼트에 둔다:

```ts
// src/app/api-routes/get-example-data.ts
import { getExamplesList } from "@/shared/db";

export const getExampleData = () => {
	try {
		const examplesList = getExamplesList();
		return Response.json({ examplesList });
	} catch {
		return Response.json(null, {
			status: 500,
			statusText: "Ouch, something went wrong"
		});
	}
};
```

루트 라우트 파일은 HTTP 메서드 이름으로 re-export만 한다:

```ts
// app/api/example/route.ts
export { getExampleData as GET } from "@/app/api-routes";
```

### DB 쿼리

> 데이터베이스 쿼리는 `shared` 레이어의 `db` 세그먼트에 정의하고, 상위 레이어에서 가져와 사용한다.

캐싱·revalidate 로직도 쿼리 정의와 동일 위치에 둔다. 서버 측 API 코드가 많아지면 FSD는 프론트엔드 방법론이므로 **Monorepo 별도 패키지 분리**가 공식 권장이다.

## Pages Router

### 디렉토리 구조

```
pages/                      ← Next.js 라우팅 (루트)
├── _app.tsx
├── api/
│   └── example.ts
└── example/
    └── index.tsx

src/
├── app/
│   ├── custom-app/
│   │   └── custom-app.tsx
│   └── api-routes/
│       └── get-example-data.ts
├── pages/
│   └── example/
│       ├── index.ts
│       └── ui/
│           └── example.tsx
├── widgets/
├── features/
├── entities/
└── shared/
```

### 라우트 파일

```tsx
// pages/example/index.tsx
export { Example as default } from "@/pages/example";
```

### Custom App — FSD app 레이어 소속

Custom App(전통적으로 providers가 놓이는 곳)은 `src/app/custom-app/` 세그먼트에 구현한다:

```tsx
// src/app/custom-app/custom-app.tsx
import type { AppProps } from "next/app";

export const App = ({ Component, pageProps }: AppProps) => {
	return (
		<>
			<p>My Custom App component</p>
			<Component {...pageProps} />
		</>
	);
};
```

```tsx
// pages/_app.tsx
export { App as default } from "@/app/custom-app";
```

### API 라우트 — `{ config, handler }` 객체 패턴

Pages Router의 API는 named export `config` + default export 규약이 있으므로, FSD 레이어에서는 둘을 하나의 객체로 묶어 소유하고 라우팅 파일에서 분해한다:

```ts
// src/app/api-routes/get-example-data.ts
import type { NextApiRequest, NextApiResponse } from "next";

const config = {
	api: {
		bodyParser: {
			sizeLimit: "1mb"
		}
	},
	maxDuration: 5
};

const handler = (req: NextApiRequest, res: NextApiResponse) => {
	res.status(200).json({ message: "Hello from FSD" });
};

export const getExampleData = { config, handler } as const;
```

```ts
// src/app/api-routes/index.ts
export { getExampleData } from "./get-example-data";
```

```ts
// pages/api/example.ts
import { getExampleData } from "@/app/api-routes";

export const config = getExampleData.config;
export default getExampleData.handler;
```

## middleware · instrumentation · 규약 파일

- `middleware.ts`·`instrumentation.ts`는 **프로젝트 루트**에 둔다 (Next.js 규약상 루트에 있어야 하므로 `src/`로 옮기지 않는다).
- `next.config.ts` 등 나머지 Next.js 규약 파일도 같은 원리로 루트 유지.

## 레이아웃 배치 전략

공식 `page-layout` 가이드의 원칙: **"레이아웃은 프레임을 제공하고 구체적 콘텐츠는 props로 받아 렌더링한다."**

| 상황                                       | 배치                                                                                   |
| ------------------------------------------ | -------------------------------------------------------------------------------------- |
| 비즈니스 로직 없는 단순 마크업 레이아웃    | `shared/ui` 또는 `app/layouts`                                                         |
| 인증·데이터 로딩이 필요한 레이아웃         | **app 레이어로 승격** (`app/layouts`는 전 레이어 import 가능 → 규칙 위반 없음)         |
| 레이아웃이 UI 골격만 제공, 콘텐츠는 자식이 | Render Props / Slots 패턴                                                              |
| 2~3개 페이지만 쓰는 레이아웃               | **복사-붙여넣기 허용** — 레이아웃은 자주 안 바뀌므로 페이지별 wrapper 중복이 공식 대안 |

"위젯 레이아웃을 만들기 전에: 이 레이아웃이 정말 필요한가? 꼭 위젯이어야 하는가?"를 먼저 자문하라는 것이 공식 권고다. App Router에서는 route group + `layout.tsx` 중첩이 "app 레이어에서 라우터 중첩으로 레이아웃 1회 적용"과 정확히 대응하는 사고방식이다.

## API 요청 코드 배치 (`api-requests` 가이드)

- 공통 API 로직 → `shared/api`: `client.ts`(base URL·헤더·직렬화 일원화) + `endpoints/` + `index.ts`
- 특정 페이지/기능 전용 요청 → 그 슬라이스의 `api` 세그먼트 (예: `pages/login/api/`). 슬라이스 public API로 re-export하지 않아도 된다.
- **백엔드 응답 타입·API 함수를 entities에 직접 두지 말 것** — `shared/api`가 백엔드 데이터를, `entities`가 프론트에 필요한 구조를 담당.
- OpenAPI 자동 생성물(Orval, openapi-typescript) → `shared/api/openapi/`
- TanStack Query 등의 데이터 타입·캐시 키·공통 옵션 → `shared`에 공유

## 서버/클라이언트 컴포넌트 경계 (공식 문서 외 보충)

FSD 공식 Next.js 가이드는 RSC/`"use client"`를 다루지 않는다. 다음은 FSD 원리에서 자연스럽게 도출되는 실무 지침이다:

- `"use client"` 지시어는 상호작용이 필요한 **말단 컴포넌트**(features/의 폼·버튼, shared/ui의 인터랙티브 컴포넌트)에만 붙이고, pages 슬라이스의 상위 컴포넌트는 서버 컴포넌트로 유지해 데이터 로딩을 담당시킨다.
- 서버 전용 코드(DB 쿼리 등 `shared/db`)는 `server-only` 패키지로 클라이언트 번들 유입을 차단하면 레이어 경계가 런타임 경계와 일치한다.
