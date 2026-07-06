export class HttpError extends Error {
	constructor(
		public readonly status: number,
		message: string
	) {
		super(message);
		this.name = "HttpError";
	}
}

export async function fetchJson<T>(url: string): Promise<T> {
	const res = await fetch(url);
	if (!res.ok) {
		const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
		throw new HttpError(res.status, body?.error?.message ?? "데이터를 불러오지 못했어요.");
	}

	return res.json();
}
