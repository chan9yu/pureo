import "../styles/globals.css";

import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import type { PropsWithChildren } from "react";

import { QueryProvider } from "../providers/QueryProvider";

const pretendard = localFont({
	src: "../fonts/PretendardVariable.woff2",
	display: "swap",
	weight: "45 920",
	variable: "--font-pretendard",
	preload: false
});

export const metadata: Metadata = {
	title: "pureo — 쉬운 종목 카드",
	description: "어려운 주식 숫자를 쉬운 말로 풀어 읽어주는 종목 카드 앱",
	icons: {
		icon: [
			{ url: "/favicons/favicon.ico", type: "image/x-icon" },
			{ url: "/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" }
		],
		apple: [{ url: "/favicons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
	}
};

export function RootLayout({ children }: PropsWithChildren) {
	return (
		<html lang="ko" className={`${pretendard.variable} h-full antialiased`}>
			<body className="flex min-h-full flex-col bg-white">
				<QueryProvider>
					<header className="sticky top-0 z-40 bg-white/90 backdrop-blur">
						<div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
							<Link
								href="/"
								className="text-t4 font-extrabold tracking-tight text-primary transition active:opacity-70"
							>
								pureo
							</Link>
							<p className="text-t7 hidden text-grey-600 sm:block">어려운 주식, 쉬운 말로</p>
						</div>
					</header>
					{children}
					<footer className="mt-auto border-t border-grey-100">
						<div className="mx-auto w-full max-w-6xl px-5 py-8 lg:px-8">
							<p className="text-t7 text-center leading-relaxed text-grey-600">
								pureo — 어려운 주식 숫자를 쉬운 말로. 모든 해석은 투자 권유가 아닌 참고용이에요.
							</p>
						</div>
					</footer>
				</QueryProvider>
			</body>
		</html>
	);
}
