import Link from "next/link";

export function NotFound() {
	return (
		<main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-5 py-24 text-center">
			<h1 className="text-t3 font-bold">페이지를 찾을 수 없어요</h1>
			<p className="text-t6 mt-2 text-grey-600">주소가 바뀌었거나 없는 페이지예요.</p>
			<Link
				href="/"
				className="text-t6 mt-6 inline-flex items-center rounded-xl bg-primary-weak px-4 py-2.5 font-semibold text-primary transition hover:bg-primary-soft active:scale-95"
			>
				홈으로 가기
			</Link>
		</main>
	);
}
