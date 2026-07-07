export function StockDetailLoading() {
	return (
		<main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 lg:px-8 lg:py-10">
			<div className="flex flex-col gap-3">
				<div className="mb-1 flex items-center justify-between">
					<div className="h-8 w-24 animate-pulse rounded-xl bg-grey-100" />
					<div className="h-8 w-16 animate-pulse rounded-xl bg-grey-100" />
				</div>
				<div className="grid gap-3 lg:grid-cols-3">
					<div className="h-52 animate-pulse rounded-3xl bg-grey-100 lg:col-span-2 lg:col-start-1 lg:row-start-1" />
					<div className="h-52 animate-pulse rounded-3xl bg-grey-100 lg:col-start-3 lg:row-start-1" />
					<div className="h-72 animate-pulse rounded-3xl bg-grey-100 lg:col-span-2 lg:row-start-2" />
					<div className="h-72 animate-pulse rounded-3xl bg-grey-100 lg:col-start-3 lg:row-start-2" />
				</div>
			</div>
		</main>
	);
}
