// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchJson } from "@/shared/api";

import { SearchBar } from "../SearchBar";

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: pushMock })
}));

vi.mock("@/shared/api", () => ({
	fetchJson: vi.fn()
}));

const APPLE_RESULTS = {
	results: [
		{ symbol: "AAPL", name: "Apple Inc", market: "US" },
		{ symbol: "APLE", name: "Apple Hospitality REIT", market: "US" }
	]
};

const MSFT_RESULTS = {
	results: [{ symbol: "MSFT", name: "Microsoft Corp", market: "US" }]
};

function renderSearchBar() {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	render(
		<QueryClientProvider client={queryClient}>
			<SearchBar />
		</QueryClientProvider>
	);
}

function setupUser() {
	return userEvent.setup({ advanceTimers: vi.advanceTimersByTime, delay: null });
}

// TanStack Query notifyManager가 setTimeout(0)으로 알림을 스케줄 — 타이머·마이크로태스크를 교차 진행해야 결과가 렌더된다
async function settleDebounce() {
	await act(async () => {
		await vi.advanceTimersByTimeAsync(300);
	});
	await act(async () => {
		await vi.advanceTimersByTimeAsync(0);
	});
}

beforeAll(() => {
	window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

beforeEach(() => {
	// user-event가 fake clock에 갇혀 hang — 실시간 경과를 fake clock에 반영해야 풀린다
	vi.useFakeTimers({ shouldAdvanceTime: true });
	vi.mocked(fetchJson).mockResolvedValue(APPLE_RESULTS);
});

afterEach(() => {
	cleanup();
	vi.useRealTimers();
	vi.clearAllMocks();
});

describe("SearchBar 자동완성", () => {
	it("타이핑 후 디바운스가 지나면 요청이 정확히 1회 발생하고 결과가 열린다", async () => {
		const user = setupUser();
		renderSearchBar();

		await user.keyboard("apple");
		expect(fetchJson).not.toHaveBeenCalled();

		await settleDebounce();
		expect(fetchJson).toHaveBeenCalledTimes(1);
		expect(fetchJson).toHaveBeenCalledWith("/api/search?q=apple&limit=10");
		expect(screen.getByRole("option", { name: /Apple Inc/ })).toBeTruthy();
	});

	it("2자 미만 입력은 요청 없이 드롭다운이 닫혀 있다", async () => {
		const user = setupUser();
		renderSearchBar();

		await user.keyboard("a");
		await settleDebounce();

		expect(fetchJson).not.toHaveBeenCalled();
		expect(screen.queryByRole("listbox")).toBeNull();
	});

	it("입력을 전부 지우면 디바운스를 기다리지 않고 즉시 닫힌다", async () => {
		const user = setupUser();
		renderSearchBar();

		await user.keyboard("apple");
		await settleDebounce();
		expect(screen.getByRole("listbox")).toBeTruthy();

		await user.clear(screen.getByRole("combobox"));
		expect(screen.queryByRole("listbox")).toBeNull();
	});

	it("Escape는 드롭다운만 닫고 입력값은 보존한다", async () => {
		const user = setupUser();
		renderSearchBar();

		await user.keyboard("apple");
		await settleDebounce();
		await user.keyboard("{Escape}");

		expect(screen.queryByRole("listbox")).toBeNull();
		expect(screen.getByRole<HTMLInputElement>("combobox").value).toBe("apple");
	});

	it("ArrowDown/ArrowUp으로 활성 항목이 이동하고 경계에서 순환한다", async () => {
		const user = setupUser();
		renderSearchBar();

		await user.keyboard("apple");
		await settleDebounce();
		const input = screen.getByRole("combobox");
		const options = screen.getAllByRole("option");

		await user.keyboard("{ArrowDown}");
		expect(input.getAttribute("aria-activedescendant")).toBe(options[0]?.id);
		expect(options[0]?.getAttribute("aria-selected")).toBe("true");

		await user.keyboard("{ArrowDown}{ArrowDown}");
		expect(input.getAttribute("aria-activedescendant")).toBe(options[0]?.id);

		await user.keyboard("{ArrowUp}");
		expect(input.getAttribute("aria-activedescendant")).toBe(options[1]?.id);
	});

	it("Enter는 하이라이트된 항목의 상세로 이동한다", async () => {
		const user = setupUser();
		renderSearchBar();

		await user.keyboard("apple");
		await settleDebounce();
		await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");

		expect(pushMock).toHaveBeenCalledWith("/stocks/APLE");
	});

	it("하이라이트가 없으면 Enter는 첫 번째 결과로 이동한다", async () => {
		const user = setupUser();
		renderSearchBar();

		await user.keyboard("apple");
		await settleDebounce();
		await user.keyboard("{Enter}");

		expect(pushMock).toHaveBeenCalledWith("/stocks/AAPL");
	});

	it("검색어 교체 중에는 이전 결과가 stale로 잠기고 settle 후 새 결과로 동작한다", async () => {
		vi.mocked(fetchJson).mockImplementation(async (url) =>
			(url as string).includes("q=msft") ? MSFT_RESULTS : APPLE_RESULTS
		);
		const user = setupUser();
		renderSearchBar();

		await user.keyboard("apple");
		await settleDebounce();

		await user.clear(screen.getByRole("combobox"));
		await user.keyboard("msft");
		const staleListbox = screen.getByRole("listbox");
		expect(staleListbox.getAttribute("aria-busy")).toBe("true");
		expect(screen.getByRole("option", { name: /Apple Inc/ })).toBeTruthy();

		await user.keyboard("{Enter}");
		expect(pushMock).not.toHaveBeenCalled();

		await settleDebounce();
		expect(screen.getByRole("listbox").getAttribute("aria-busy")).toBe("false");
		await user.keyboard("{Enter}");
		expect(pushMock).toHaveBeenCalledWith("/stocks/MSFT");
	});

	it("결과가 0건이면 빈 상태 안내를 보여준다", async () => {
		vi.mocked(fetchJson).mockResolvedValue({ results: [] });
		const user = setupUser();
		renderSearchBar();

		await user.keyboard("zzqqx");
		await settleDebounce();

		expect(screen.getByText(/미국 상장 종목의 티커나 영문 이름으로 검색해보세요/)).toBeTruthy();
	});

	it("요청이 실패하면 에러 안내를 보여준다", async () => {
		vi.mocked(fetchJson).mockRejectedValue(new Error("boom"));
		const user = setupUser();
		renderSearchBar();

		await user.keyboard("apple");
		await settleDebounce();

		expect(screen.getByText(/검색하지 못했어요/)).toBeTruthy();
	});
});
