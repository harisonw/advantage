import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	CheckCircle,
	FileText,
	Loader2,
	Send,
	ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";

import { DocumentDrawer } from "../components/DocumentDrawer";
import { StatusPill } from "../components/StatusPill";
import {
	getDeal,
	pendingUpdateCheckInStore,
	resolveCheckInStore,
	setDealStatusInStore,
} from "../deal/getDeal";
import type {
	CheckResult,
	CheckStatus,
	Deal,
	DocumentMeta,
} from "../deal/types";

export const Route = createFileRoute("/deal/$dealId")({
	component: DealComponent,
});

function DealComponent() {
	const { dealId } = Route.useParams();
	return <DealWorkspace key={dealId} dealId={dealId} />;
}

function DealWorkspace({ dealId }: { dealId: string }) {
	const deal = useMemo(() => getDeal(dealId), [dealId]);
	const [checks, setChecks] = useState<CheckResult[]>(deal.checks);
	const [dealStatus, setDealStatus] = useState<Deal["status"]>(deal.status);
	const [showPassed, setShowPassed] = useState(true);
	const [showSignOffModal, setShowSignOffModal] = useState(false);

	const [selectedCheckId, setSelectedCheckId] = useState(() => {
		const firstProblem = deal.checks.find(
			(c) => c.status === "fail" || c.status === "needs_review",
		);
		return firstProblem?.id ?? deal.checks[0]?.id ?? "";
	});

	const [docDrawer, setDocDrawer] = useState<{
		open: boolean;
		docId: string | null;
	}>({
		open: false,
		docId: null,
	});

	const selected = checks.find((c) => c.id === selectedCheckId) ?? null;

	const counts = useMemo(() => {
		const base = {
			fail: 0,
			needs_review: 0,
			missing: 0,
			pass: 0,
			resolved: 0,
			pending_update: 0,
		} satisfies Record<CheckStatus, number>;

		for (const c of checks) base[c.status] += 1;
		return base;
	}, [checks]);

	const overall = useMemo(() => {
		if (dealStatus === "Paid out") return "Paid out";
		return counts.fail > 0
			? "Blocked"
			: counts.needs_review + counts.missing + counts.pending_update > 0
				? "Needs review"
				: "Ready";
	}, [counts, dealStatus]);

	const visibleChecks = showPassed
		? checks
		: checks.filter(
				(c) =>
					c.status === "fail" ||
					c.status === "needs_review" ||
					c.status === "missing" ||
					c.status === "pending_update",
			);

	const categories = useMemo(() => {
		const order = [
			"Customer",
			"Vehicle",
			"Financial",
			"Dealer & Payee",
			"Documents",
			"System",
		] as const;
		const byCategory = new Map<string, CheckResult[]>();
		for (const cat of order) byCategory.set(cat, []);
		for (const c of visibleChecks) byCategory.get(c.category)?.push(c);

		const statusRank: Record<CheckStatus, number> = {
			fail: 0,
			needs_review: 1,
			missing: 2,
			pending_update: 3,
			pass: 4,
			resolved: 5,
		};

		for (const items of byCategory.values()) {
			items.sort((a, b) => statusRank[a.status] - statusRank[b.status]);
		}

		return order
			.map((cat) => ({
				category: cat,
				items: byCategory.get(cat) ?? [],
			}))
			.filter((g) => g.items.length > 0);
	}, [visibleChecks]);

	const openDocument = (docId: string) => {
		setDocDrawer({ open: true, docId });
	};

	const markResolved = (checkId: string) => {
		resolveCheckInStore(dealId, checkId);
		setChecks((prev) =>
			prev.map((c) =>
				c.id === checkId ? { ...c, status: "resolved" as const } : c,
			),
		);
	};

	const markPendingUpdate = (checkId: string) => {
		pendingUpdateCheckInStore(dealId, checkId);
		setChecks((prev) =>
			prev.map((c) =>
				c.id === checkId ? { ...c, status: "pending_update" as const } : c,
			),
		);
	};

	const handleConfirmSignOff = () => {
		setDealStatusInStore(dealId, "Paid out");
		setDealStatus("Paid out");
		setShowSignOffModal(false);
	};

	const handleDownloadPack = () => {
		const text = `Advantage Finance - Document Pack - ${dealId}
Customer: ${deal.customerName}
Dealer: ${deal.dealerName}
Finance Amount: £${deal.financeAmount.toLocaleString()}
Status: Paid out (sent to Accounts funding)
Signed off on: ${new Date().toLocaleDateString("en-GB")}
`;
		const blob = new Blob([text], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `document-pack-${dealId}.txt`;
		link.click();
		URL.revokeObjectURL(url);
	};

	const closeDrawer = () => setDocDrawer({ open: false, docId: null });

	const docMeta = (docId: string | null): DocumentMeta | null => {
		if (!docId) return null;
		return deal.documents.find((d) => d.id === docId) ?? null;
	};

	return (
		<div className="grid gap-4">
			<div className="flex items-center justify-between">
				<Link
					to="/"
					className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:underline"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to dashboard
				</Link>
			</div>

			<section className="rounded-2xl border border-border bg-surface p-5">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<h1 className="text-pretty text-2xl font-semibold text-brand-navy">
							Reconciliation workspace — {deal.id}
						</h1>
						<p className="mt-1 max-w-prose text-sm text-ink-muted">
							Triage exceptions for {deal.customerName} ({deal.dealerName}).
							Passed checks are shown by default.
						</p>
					</div>

					<div className="flex flex-col items-end gap-2 text-right">
						<div className="flex items-center gap-2">
							<span className="text-xs text-ink-muted">Status:</span>
							<DashboardStatusPill status={overall} />
						</div>
						{overall !== "Paid out" && (
							<button
								type="button"
								disabled={overall !== "Ready"}
								onClick={() => setShowSignOffModal(true)}
								className={`rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-all duration-150 ${
									overall === "Ready"
										? "bg-brand-blue text-surface hover:bg-brand-blue/95 cursor-pointer shadow-sm"
										: "bg-surface-2 border border-border text-ink-muted cursor-not-allowed"
								}`}
							>
								Sign off deal
							</button>
						)}
					</div>
				</div>
			</section>

			{overall === "Paid out" && (
				<div className="rounded-2xl border border-success/30 bg-success/5 p-6 animate-in fade-in duration-200 shadow-xs">
					<div className="flex items-start gap-4">
						<div className="rounded-full bg-success/15 p-2 text-success">
							<CheckCircle className="h-6 w-6" />
						</div>
						<div className="flex-1">
							<h3 className="text-base font-bold text-brand-navy">
								Deal successfully signed off and paid out
							</h3>
							<p className="mt-1 text-sm text-ink-muted">
								The document pack has been successfully compiled, saved, and
								dispatched to Accounts funding.
							</p>
							<div className="mt-4 flex gap-3">
								<button
									type="button"
									onClick={handleDownloadPack}
									className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-blue/95 shadow-sm transition-colors cursor-pointer"
								>
									<FileText className="h-4 w-4" />
									Download Document Pack
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			<section className="grid grid-cols-12 gap-6">
				<div className="col-span-12 rounded-2xl border border-border bg-surface md:col-span-5">
					<div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
						<h2 className="text-sm font-semibold text-brand-navy">Checks</h2>
						<button
							type="button"
							className="text-xs font-semibold text-brand-blue hover:underline"
							onClick={() => setShowPassed((v) => !v)}
						>
							{showPassed
								? `Hide passed (${counts.pass})`
								: `Show passed (${counts.pass})`}
						</button>
					</div>

					<div className="max-h-[70dvh] overflow-auto p-2">
						{categories.map((group) => (
							<div key={group.category} className="mb-4">
								<div className="px-2 py-2 text-xs font-semibold text-ink-muted">
									{group.category}
								</div>

								<div className="space-y-1">
									{group.items.map((c) => (
										<button
											key={c.id}
											type="button"
											className={
												(c.id === selectedCheckId
													? "w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-left"
													: "w-full rounded-xl px-3 py-2 text-left hover:bg-surface-2") +
												(c.id === "bank-verification"
													? " outline outline-2 outline-brand-blue outline-offset-1"
													: "")
											}
											onClick={() => setSelectedCheckId(c.id)}
										>
											<div className="flex items-start justify-between gap-3">
												<div className="text-sm font-semibold text-ink">
													{c.title}
												</div>
												<StatusPill status={c.status} />
											</div>
											<div className="mt-1 text-xs text-ink-muted">
												{formatCheckType(c.checkType)}
											</div>
										</button>
									))}
								</div>
							</div>
						))}

						{categories.length === 0 ? (
							<div className="px-3 py-10 text-center text-sm text-ink-muted">
								No exceptions. This deal looks ready.
							</div>
						) : null}
					</div>
				</div>

				<div className="col-span-12 rounded-2xl border border-border bg-surface md:col-span-7">
					<div className="border-b border-border px-4 py-3">
						<h2 className="text-sm font-semibold text-brand-navy">Details</h2>
					</div>

					<div className="max-h-[70dvh] overflow-auto p-4">
						{selected ? (
							<CheckDetails
								key={selected.id}
								check={selected}
								onOpenDocument={openDocument}
								onMarkResolved={markResolved}
								onMarkPendingUpdate={markPendingUpdate}
							/>
						) : (
							<div className="py-10 text-center text-sm text-ink-muted">
								Select a check to review.
							</div>
						)}
					</div>
				</div>
			</section>

			<DocumentDrawer
				open={docDrawer.open}
				document={docMeta(docDrawer.docId)}
				onClose={closeDrawer}
			/>

			{showSignOffModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
					<div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in zoom-in-95 duration-200">
						<h3 className="text-lg font-bold text-brand-navy">
							Confirm Deal Sign-off
						</h3>
						<p className="mt-3 text-sm text-ink leading-relaxed">
							Are you sure you want to sign off this deal?
						</p>
						<p className="mt-2 text-sm font-medium text-ink-muted">
							By proceeding, you confirm you have reviewed all checks.
						</p>

						<div className="mt-6 flex items-center justify-end gap-3">
							<button
								type="button"
								onClick={() => setShowSignOffModal(false)}
								className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink-muted hover:bg-surface-2 cursor-pointer transition-colors"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleConfirmSignOff}
								className="rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-surface hover:bg-brand-blue/95 cursor-pointer transition-colors"
							>
								Yes, sign off
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

function DashboardStatusPill({ status }: { status: Deal["status"] }) {
	switch (status) {
		case "Blocked":
			return (
				<span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2 py-1 text-xs font-semibold text-danger border border-danger/20">
					<span className="h-1.5 w-1.5 rounded-full bg-danger animate-pulse" />
					Blocked
				</span>
			);
		case "Needs review":
			return (
				<span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-1 text-xs font-semibold text-warning border border-warning/20">
					<span className="h-1.5 w-1.5 rounded-full bg-warning" />
					Needs review
				</span>
			);
		case "Ready":
			return (
				<span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-xs font-semibold text-success border border-success/20">
					<ShieldCheck className="h-3 w-3" />
					Ready
				</span>
			);
		case "Paid out":
			return (
				<span className="inline-flex items-center gap-1 rounded-full bg-brand-blue/10 px-2 py-1 text-xs font-semibold text-brand-blue border border-brand-blue/20">
					<span className="h-1.5 w-1.5 rounded-full bg-brand-blue" />
					Paid out
				</span>
			);
	}
}

function formatCheckType(type: CheckResult["checkType"]) {
	switch (type) {
		case "exact":
			return "Exact match";
		case "fuzzy":
			return "Fuzzy match";
		case "tolerance":
			return "Numeric tolerance";
		case "policy":
			return "Policy rule";
		case "system_lookup":
			return "System lookup";
		case "entity_resolution":
			return "Entity resolution";
		case "presence":
			return "Presence check";
		case "arithmetic":
			return "Arithmetic check";
		default:
			return "Check";
	}
}

function CheckDetails({
	check,
	onOpenDocument,
	onMarkResolved,
	onMarkPendingUpdate,
}: {
	check: CheckResult;
	onOpenDocument: (docId: string) => void;
	onMarkResolved: (checkId: string) => void;
	onMarkPendingUpdate: (checkId: string) => void;
}) {
	const [isSending, setIsSending] = useState(false);
	const [sentAt, setSentAt] = useState<string | null>(null);

	const handleSend = () => {
		setIsSending(true);
		setTimeout(() => {
			setIsSending(false);
			const now = new Date();
			const formattedDate = `${now.toLocaleDateString("en-GB")} ${now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
			setSentAt(formattedDate);
			onMarkPendingUpdate(check.id);
		}, 800);
	};

	const isPendingUpdate = check.status === "pending_update";
	const isResolved = check.status === "resolved";
	const isResolvedOrPending = isResolved || isPendingUpdate;
	const displayTime = sentAt || new Date().toLocaleDateString("en-GB");

	return (
		<div>
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<div className="text-lg font-semibold text-brand-navy">
						{check.title}
					</div>
					<div className="mt-1 text-sm text-ink-muted">
						{formatCheckType(check.checkType)}
					</div>
				</div>

				<div className="flex items-center gap-2">
					<StatusPill status={check.status} />
					{check.status !== "pass" && check.status !== "resolved" ? (
						<button
							type="button"
							className="rounded-lg bg-brand-blue px-3 py-1.5 text-xs font-semibold text-surface hover:opacity-95 cursor-pointer"
							onClick={() => onMarkResolved(check.id)}
						>
							Mark resolved
						</button>
					) : null}
				</div>
			</div>

			<div className="mt-6 grid gap-4">
				<div className="rounded-xl border border-border bg-surface-2 p-4">
					<div className="text-xs font-semibold text-ink-muted">Rule</div>
					<div className="mt-1 text-sm text-ink">{check.rule}</div>
					<div className="mt-2 text-sm text-ink-muted">{check.explanation}</div>
				</div>

				<div className="rounded-xl border border-border bg-surface p-4">
					<div className="flex items-center justify-between gap-3">
						<div className="text-xs font-semibold text-ink-muted">Evidence</div>
					</div>

					<div className="mt-3 overflow-hidden rounded-lg border border-border">
						<table className="w-full text-left text-sm">
							<thead className="bg-surface-2 text-xs text-ink-muted">
								<tr>
									<th className="px-3 py-2 font-semibold">Source</th>
									<th className="px-3 py-2 font-semibold">Value</th>
									<th className="px-3 py-2 font-semibold">Doc</th>
								</tr>
							</thead>
							<tbody>
								{check.evidence.map((e) => (
									<tr
										key={`${e.documentId}-${e.sourceLabel}`}
										className="border-t border-border"
									>
										<td className="px-3 py-2 align-top text-ink">
											{e.sourceLabel}
										</td>
										<td className="px-3 py-2 align-top">
											<div className="text-ink">{e.value}</div>
											{e.normalized ? (
												<div className="mt-0.5 text-xs text-ink-muted">
													Normalized: {e.normalized}
												</div>
											) : null}
											{e.note ? (
												<div className="mt-1 text-xs text-ink-muted">
													{e.note}
												</div>
											) : null}
										</td>
										<td className="px-3 py-2 align-top">
											<button
												type="button"
												className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-surface-2 cursor-pointer"
												onClick={() => onOpenDocument(e.documentId)}
											>
												<FileText className="h-4 w-4" aria-hidden="true" />
												View
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{check.pasDraft ? (
					<div className="rounded-xl border border-border bg-surface p-4">
						<div className="text-xs font-semibold text-ink-muted">
							PAS draft
						</div>
						<div className="mt-1 text-sm font-semibold text-ink">
							To: {check.pasDraft.to} · {check.pasDraft.title}
						</div>
						<textarea
							className="mt-3 h-32 w-full resize-none rounded-xl border border-border bg-surface-2 p-3 text-sm text-ink outline-none"
							defaultValue={check.pasDraft.body}
							readOnly={isResolvedOrPending || isSending}
						/>
						{isResolved ? (
							<div className="mt-3 rounded-xl border border-green-200 bg-green-50/50 p-3 text-sm text-green-800 flex items-center gap-2">
								<CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
								<div>
									<span className="font-semibold">
										Check resolved manually.
									</span>{" "}
									No PAS notification was sent.
								</div>
							</div>
						) : isPendingUpdate ? (
							<div className="mt-3 rounded-xl border border-brand-blue/20 bg-brand-blue/5 p-3 text-sm text-brand-blue flex items-center gap-2">
								<CheckCircle className="h-5 w-5 text-brand-blue flex-shrink-0" />
								<div>
									<span className="font-semibold">
										PAS notification raised successfully!
									</span>{" "}
									Pending update (Broker notified on {displayTime}).
								</div>
							</div>
						) : isSending ? (
							<button
								type="button"
								disabled
								className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-brand-blue/80 px-4 py-2.5 text-sm font-semibold text-surface cursor-not-allowed"
							>
								<Loader2 className="h-4 w-4 animate-spin" />
								Raising PAS notification...
							</button>
						) : (
							<button
								type="button"
								onClick={handleSend}
								className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-surface hover:bg-brand-blue/90 cursor-pointer shadow-sm transition-colors"
							>
								<Send className="h-4 w-4" />
								Raise PAS Notification
							</button>
						)}
					</div>
				) : null}
			</div>
		</div>
	);
}
