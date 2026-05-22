export type CheckStatus =
	| "pass"
	| "fail"
	| "needs_review"
	| "missing"
	| "resolved"
	| "pending_update";

export type CheckType =
	| "exact"
	| "fuzzy"
	| "tolerance"
	| "policy"
	| "system_lookup"
	| "entity_resolution"
	| "presence"
	| "arithmetic";

export type CheckCategory =
	| "Customer"
	| "Vehicle"
	| "Financial"
	| "Dealer & Payee"
	| "Documents"
	| "System";

export type PasRecipient = "Broker" | "Dealer";

export interface PasDraft {
	to: PasRecipient;
	title: string;
	body: string;
}

export interface EvidenceItem {
	sourceLabel: string;
	documentId: string;
	value: string;
	normalized?: string;
	note?: string;
}

export interface CheckResult {
	id: string;
	title: string;
	category: CheckCategory;
	checkType: CheckType;
	status: CheckStatus;
	rule: string;
	explanation: string;
	evidence: EvidenceItem[];
	pasDraft?: PasDraft;
}

export interface DocumentMeta {
	id: string;
	title: string;
	source?: string;
	date?: string;
	assetPath?: string;
}

export interface Deal {
	id: string;
	customerName: string;
	dealerName: string;
	vehicleReg: string;
	financeAmount: number;
	status: "Blocked" | "Needs review" | "Ready" | "Paid out";
	checks: CheckResult[];
	documents: DocumentMeta[];
}
