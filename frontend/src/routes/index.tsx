import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Car, Search, ShieldCheck, User } from "lucide-react";
import { useMemo, useState } from "react";

import { getDeals } from "../deal/getDeal";
import type { Deal } from "../deal/types";

export const Route = createFileRoute("/")({
	component: Dashboard,
});

function Dashboard() {
	const deals = useMemo(() => getDeals(), []);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<
		"All" | "Blocked" | "Needs review" | "Ready" | "Paid out"
	>("All");

	// Compute stats across all deals
	const stats = useMemo(() => {
		const counts = {
			all: deals.length,
			blocked: 0,
			needsReview: 0,
			ready: 0,
			paidOut: 0,
		};
		for (const d of deals) {
			if (d.status === "Blocked") counts.blocked++;
			else if (d.status === "Needs review") counts.needsReview++;
			else if (d.status === "Ready") counts.ready++;
			else if (d.status === "Paid out") counts.paidOut++;
		}
		return counts;
	}, [deals]);

	// Filter deals based on search and status tab
	const filteredDeals = useMemo(() => {
		return deals.filter((deal) => {
			// Status filter
			if (statusFilter !== "All" && deal.status !== statusFilter) {
				return false;
			}

			// Search query filter
			if (search.trim()) {
				const query = search.toLowerCase();
				const matchId = deal.id.toLowerCase().includes(query);
				const matchCustomer = deal.customerName.toLowerCase().includes(query);
				const matchDealer = deal.dealerName.toLowerCase().includes(query);
				const matchReg = deal.vehicleReg.toLowerCase().includes(query);
				return matchId || matchCustomer || matchDealer || matchReg;
			}

			return true;
		});
	}, [deals, search, statusFilter]);

	return (
		<div className="grid gap-6">
			{/* Welcome Banner */}
			<section className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<h1 className="text-pretty text-2xl font-bold tracking-tight text-brand-navy">
							Advantage Finance Payout Desk
						</h1>
						<p className="mt-1 max-w-prose text-sm text-ink-muted">
							Select an active hire-purchase application to begin reconciliation
							checking. Ensure all documents and bank instructions align before
							payout.
						</p>
					</div>
				</div>
			</section>

			{/* Stats Cards */}
			<section className="grid grid-cols-2 gap-4 md:grid-cols-5">
				{/* Card: All */}
				<button
					type="button"
					onClick={() => setStatusFilter("All")}
					className={`flex flex-col rounded-2xl border p-4 text-left transition-all duration-150 cursor-pointer ${
						statusFilter === "All"
							? "border-brand-blue bg-surface-2 shadow-xs ring-1 ring-brand-blue"
							: "border-border bg-surface hover:border-ink-muted"
					}`}
				>
					<span className="text-xs font-semibold text-ink-muted">
						All applications
					</span>
					<span className="mt-2 text-3xl font-bold text-brand-navy">
						{stats.all}
					</span>
				</button>

				{/* Card: Blocked */}
				<button
					type="button"
					onClick={() => setStatusFilter("Blocked")}
					className={`flex flex-col rounded-2xl border p-4 text-left transition-all duration-150 cursor-pointer ${
						statusFilter === "Blocked"
							? "border-danger bg-danger/5 shadow-xs ring-1 ring-danger"
							: "border-border bg-surface hover:border-danger/40"
					}`}
				>
					<span className="text-xs font-semibold text-ink-muted">
						Blocked (Fails)
					</span>
					<span className="mt-2 text-3xl font-bold text-danger">
						{stats.blocked}
					</span>
				</button>

				{/* Card: Needs Review */}
				<button
					type="button"
					onClick={() => setStatusFilter("Needs review")}
					className={`flex flex-col rounded-2xl border p-4 text-left transition-all duration-150 cursor-pointer ${
						statusFilter === "Needs review"
							? "border-warning bg-warning/5 shadow-xs ring-1 ring-warning"
							: "border-border bg-surface hover:border-warning/40"
					}`}
				>
					<span className="text-xs font-semibold text-ink-muted">
						Needs Review
					</span>
					<span className="mt-2 text-3xl font-bold text-warning">
						{stats.needsReview}
					</span>
				</button>

				{/* Card: Ready */}
				<button
					type="button"
					onClick={() => setStatusFilter("Ready")}
					className={`flex flex-col rounded-2xl border p-4 text-left transition-all duration-150 cursor-pointer ${
						statusFilter === "Ready"
							? "border-success bg-success/5 shadow-xs ring-1 ring-success"
							: "border-border bg-surface hover:border-success/40"
					}`}
				>
					<span className="text-xs font-semibold text-ink-muted">
						Ready to Pay
					</span>
					<span className="mt-2 text-3xl font-bold text-success">
						{stats.ready}
					</span>
				</button>

				{/* Card: Paid out */}
				<button
					type="button"
					onClick={() => setStatusFilter("Paid out")}
					className={`flex flex-col rounded-2xl border p-4 text-left transition-all duration-150 cursor-pointer ${
						statusFilter === "Paid out"
							? "border-brand-blue bg-brand-blue/5 shadow-xs ring-1 ring-brand-blue"
							: "border-border bg-surface hover:border-brand-blue/40"
					}`}
				>
					<span className="text-xs font-semibold text-ink-muted">Paid Out</span>
					<span className="mt-2 text-3xl font-bold text-brand-blue">
						{stats.paidOut}
					</span>
				</button>
			</section>

			{/* Search and Filters bar */}
			<section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 shadow-xs">
				<div className="relative w-full max-w-md">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
					<input
						type="text"
						placeholder="Search by Deal ID, customer name, dealer, or reg..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-full rounded-xl border border-border bg-surface py-2 pl-10 pr-4 text-sm text-ink outline-none focus:border-brand-blue"
					/>
				</div>

				{/* Horizontal filter tabs */}
				<div className="flex gap-1.5 rounded-xl bg-surface-2 p-1 border border-border">
					{(
						["All", "Blocked", "Needs review", "Ready", "Paid out"] as const
					).map((tab) => (
						<button
							key={tab}
							type="button"
							onClick={() => setStatusFilter(tab)}
							className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
								statusFilter === tab
									? "bg-surface text-brand-navy shadow-xs border border-border"
									: "text-ink-muted hover:text-ink"
							}`}
						>
							{tab}
						</button>
					))}
				</div>
			</section>

			{/* Applications List */}
			<section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm border-collapse">
						<thead className="bg-surface-2 text-xs text-ink-muted border-b border-border">
							<tr>
								<th className="px-5 py-3 font-semibold">Deal details</th>
								<th className="px-5 py-3 font-semibold">Customer</th>
								<th className="px-5 py-3 font-semibold">Vehicle</th>
								<th className="px-5 py-3 font-semibold">Dealer / Partner</th>
								<th className="px-5 py-3 font-semibold">Amount</th>
								<th className="px-5 py-3 font-semibold">Checks breakdown</th>
								<th className="px-5 py-3 font-semibold">Status</th>
								<th className="px-5 py-3 font-semibold"></th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{filteredDeals.map((deal) => {
								const checkCounts = getCheckBreakdown(deal);
								return (
									<tr
										key={deal.id}
										className="hover:bg-surface-2/60 transition-all duration-150"
									>
										{/* Deal ID */}
										<td className="px-5 py-4.5 align-middle">
											<Link
												to="/deal/$dealId"
												params={{ dealId: deal.id }}
												className="text-sm font-bold text-brand-blue hover:underline focus:outline-none"
											>
												{deal.id}
											</Link>
										</td>

										{/* Customer */}
										<td className="px-5 py-4.5 align-middle">
											<div className="flex items-center gap-2">
												<User className="h-4 w-4 text-ink-muted" />
												<span className="font-semibold text-ink">
													{deal.customerName}
												</span>
											</div>
										</td>

										{/* Vehicle */}
										<td className="px-5 py-4.5 align-middle">
											<div className="flex flex-col gap-0.5">
												<div className="flex items-center gap-1.5 text-xs text-ink">
													<Car className="h-3.5 w-3.5 text-ink-muted" />
													<span>{deal.vehicleReg}</span>
												</div>
											</div>
										</td>

										{/* Dealer */}
										<td className="px-5 py-4.5 align-middle">
											<div className="flex items-center gap-2 text-xs">
												<Building2 className="h-4 w-4 text-ink-muted" />
												<span className="text-ink">{deal.dealerName}</span>
											</div>
										</td>

										{/* Amount */}
										<td className="px-5 py-4.5 align-middle">
											<span className="font-bold text-brand-navy">
												£{deal.financeAmount.toLocaleString()}
											</span>
										</td>

										{/* Checks breakdown */}
										<td className="px-5 py-4.5 align-middle">
											<div className="flex items-center gap-3">
												<div className="flex gap-1">
													{/* Fails */}
													{checkCounts.fail > 0 ? (
														<span className="inline-flex items-center rounded-md bg-danger/10 px-1.5 py-0.5 text-xs font-semibold text-danger border border-danger/10">
															{checkCounts.fail} F
														</span>
													) : null}
													{/* Needs Review */}
													{checkCounts.needs_review > 0 ? (
														<span className="inline-flex items-center rounded-md bg-warning/10 px-1.5 py-0.5 text-xs font-semibold text-warning border border-warning/10">
															{checkCounts.needs_review} R
														</span>
													) : null}
													{/* Passes / Resolved */}
													{checkCounts.pass + checkCounts.resolved > 0 ? (
														<span className="inline-flex items-center rounded-md bg-success/10 px-1.5 py-0.5 text-xs font-semibold text-success border border-success/10">
															{checkCounts.pass + checkCounts.resolved} P
														</span>
													) : null}
													{/* Pending Updates */}
													{checkCounts.pending_update > 0 ? (
														<span className="inline-flex items-center rounded-md bg-brand-blue/10 px-1.5 py-0.5 text-xs font-semibold text-brand-blue border border-brand-blue/10 animate-pulse">
															{checkCounts.pending_update} U
														</span>
													) : null}
												</div>
											</div>
										</td>

										{/* Status Pill */}
										<td className="px-5 py-4.5 align-middle">
											<DashboardStatusPill status={deal.status} />
										</td>

										{/* Action */}
										<td className="px-5 py-4.5 align-middle text-right">
											<Link
												to="/deal/$dealId"
												params={{ dealId: deal.id }}
												className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
													deal.status === "Paid out"
														? "border-brand-blue/20 bg-brand-blue/5 text-brand-blue hover:bg-brand-blue/10"
														: deal.status === "Ready"
															? "border-success/30 bg-success/5 text-success hover:bg-success/10"
															: "border-border bg-surface text-brand-navy hover:bg-surface-2"
												}`}
											>
												{deal.status === "Paid out"
													? "Review"
													: deal.status === "Ready"
														? "Open"
														: "Reconcile"}
											</Link>
										</td>
									</tr>
								);
							})}

							{filteredDeals.length === 0 ? (
								<tr>
									<td
										colSpan={8}
										className="px-5 py-12 text-center text-sm text-ink-muted"
									>
										No applications matching the filters.
									</td>
								</tr>
							) : null}
						</tbody>
					</table>
				</div>
			</section>
		</div>
	);
}

function getCheckBreakdown(deal: Deal) {
	const counts = {
		fail: 0,
		needs_review: 0,
		missing: 0,
		pass: 0,
		resolved: 0,
		pending_update: 0,
	};
	for (const c of deal.checks) {
		counts[c.status]++;
	}
	return counts;
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
