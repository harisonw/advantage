import type { CheckStatus } from "../deal/types";

const labelByStatus: Record<CheckStatus, string> = {
	pass: "Pass",
	fail: "Fail",
	needs_review: "Review",
	missing: "Missing",
	resolved: "Resolved",
	pending_update: "Pending update",
};

export function StatusPill({ status }: { status: CheckStatus }) {
	const styles =
		status === "fail"
			? "bg-danger/10 text-danger"
			: status === "needs_review"
				? "bg-warning/15 text-ink"
				: status === "missing"
					? "bg-warning/20 text-ink"
					: status === "resolved"
						? "bg-surface-2 text-ink-muted"
						: status === "pending_update"
							? "bg-brand-blue/10 text-brand-blue border border-brand-blue/20"
							: "bg-success/10 text-success";

	return (
		<span
			className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${styles}`}
		>
			{labelByStatus[status]}
		</span>
	);
}
