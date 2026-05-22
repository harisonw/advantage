import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { getMockDocumentMarkdown } from "../deal/getDeal";
import type { DocumentMeta } from "../deal/types";

export function DocumentDrawer({
	open,
	document,
	onClose,
}: {
	open: boolean;
	document: DocumentMeta | null;
	onClose: () => void;
}) {
	const [content, setContent] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) return;

		setContent(null);
		setError(null);

		if (!document?.assetPath) {
			setError("No document source available.");
			return;
		}

		const processMarkdown = (text: string, docId: string): string => {
			if (docId === "previous-application") {
				const index = text.indexOf("## Previous Application");
				if (index !== -1) {
					const sliced = text.substring(index);
					return sliced.replace(
						"## Previous Application",
						"# Previous Application",
					);
				}
			}
			return text;
		};

		if (document.assetPath.startsWith("mock://")) {
			const path = document.assetPath.replace("mock://", "");
			const [dealId, docId] = path.split("/");
			if (dealId && docId) {
				try {
					const text = getMockDocumentMarkdown(dealId, docId);
					setContent(processMarkdown(text, document.id));
				} catch (e: unknown) {
					setError(
						e instanceof Error ? e.message : "Failed to load mock document",
					);
				}
			} else {
				setError("Invalid mock document reference");
			}
			return;
		}

		const controller = new AbortController();

		fetch(document.assetPath, { signal: controller.signal })
			.then(async (res) => {
				if (!res.ok) {
					throw new Error(`Failed to load document (${res.status})`);
				}
				return res.text();
			})
			.then((text) => setContent(processMarkdown(text, document.id)))
			.catch((e: unknown) => {
				if (controller.signal.aborted) return;
				setError(e instanceof Error ? e.message : "Failed to load document");
			});

		return () => controller.abort();
	}, [open, document?.id, document?.assetPath]);

	return (
		<>
			{open ? (
				<button
					type="button"
					aria-label="Close document drawer"
					className="fixed inset-0 z-50 bg-ink/30"
					onClick={onClose}
				/>
			) : null}
			<aside
				className={
					open
						? "fixed right-0 top-0 z-50 h-dvh w-full max-w-xl translate-x-0 border-l border-border bg-surface shadow-sm transition-transform"
						: "fixed right-0 top-0 z-50 h-dvh w-full max-w-xl translate-x-full border-l border-border bg-surface shadow-sm transition-transform"
				}
				aria-hidden={!open}
			>
				<div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
					<div className="min-w-0">
						<div className="text-xs font-semibold text-ink-muted">Document</div>
						<div className="truncate text-sm font-semibold text-brand-navy">
							{document?.title ?? "Unknown document"}
						</div>
						<div className="mt-0.5 text-xs text-ink-muted">
							{[document?.source, document?.date].filter(Boolean).join(" · ")}
						</div>
					</div>

					<button
						type="button"
						className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-ink hover:bg-surface-2"
						onClick={onClose}
					>
						Close
					</button>
				</div>

				<div className="h-[calc(100dvh-52px)] overflow-auto p-4">
					{error ? (
						<div className="rounded-xl border border-border bg-surface-2 p-4 text-sm text-ink">
							{error}
						</div>
					) : content ? (
						<article className="prose prose-sm max-w-none prose-headings:text-brand-navy prose-a:text-brand-blue prose-strong:text-ink">
							<ReactMarkdown remarkPlugins={[remarkGfm]}>
								{content}
							</ReactMarkdown>
						</article>
					) : (
						<div className="rounded-xl border border-border bg-surface-2 p-4 text-sm text-ink-muted">
							Loading document.
						</div>
					)}
				</div>
			</aside>
		</>
	);
}
