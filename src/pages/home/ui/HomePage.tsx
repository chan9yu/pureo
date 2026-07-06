import { SearchBar } from "./SearchBar";

export function HomePage() {
	return (
		<main className="mx-auto max-w-xl px-4 py-16">
			<h1 className="text-2xl font-bold">이 회사, 지금 어떤지 쉽게 볼까요?</h1>
			<p className="mt-2 text-gray-600">종목을 검색하면 어려운 숫자를 쉬운 말로 해석해 드려요.</p>
			<div className="mt-8">
				<SearchBar />
			</div>
		</main>
	);
}
