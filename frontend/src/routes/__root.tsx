import {
	createRootRoute,
	Link,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";

import "../styles.css";

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	const routerState = useRouterState();
	const dealMatch = routerState.matches.find(
		(m) => m.routeId === "/deal/$dealId",
	);
	const dealId = dealMatch
		? (dealMatch.params as { dealId?: string }).dealId
		: null;

	return (
		<div className="min-h-dvh bg-surface text-ink">
			<header className="border-b border-border bg-surface">
				<div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
					<Link
						to="/"
						className="flex items-center gap-3 hover:opacity-90 focus:outline-none"
					>
						<img
							src="/advantage-logo.svg"
							alt="Advantage Finance"
							className="h-8 w-auto"
						/>
						<div className="text-sm text-ink-muted">
							Reconciliation workspace
						</div>
					</Link>

					<div className="text-right">
						<div className="text-sm font-semibold text-brand-navy">
							{dealId || "All Applications"}
						</div>
						<div className="text-xs text-ink-muted">
							Payout checks prototype
						</div>
					</div>
				</div>
			</header>

			<main className="mx-auto w-full max-w-6xl px-6 py-6">
				<Outlet />
			</main>
		</div>
	);
}
