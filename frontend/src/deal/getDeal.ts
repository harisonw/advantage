import {
	dealerEntityMatch,
	exactMatch,
	fuzzyAddressMatch,
	fuzzyNameMatch,
	Normalizers,
	numericToleranceMatch,
} from "./evaluators";
import type { CheckResult, Deal, DocumentMeta } from "./types";

const documents: DocumentMeta[] = [
	{
		id: "broker-application",
		title: "Broker application",
		source: "CarMoney (via CRM)",
		date: "18/03/2026",
		assetPath: "/docs/01-broker-application.md",
	},
	{
		id: "hp-agreement",
		title: "HP agreement",
		source: "Northgate Motor Finance Ltd",
		date: "20/03/2026",
		assetPath: "/docs/02-hp-agreement.md",
	},
	{
		id: "purchase-invoice",
		title: "Purchase invoice",
		source: "Dealer",
		date: "19/03/2026",
		assetPath: "/docs/03-purchase-invoice.md",
	},
	{
		id: "supplier-declaration",
		title: "Supplier declaration",
		source: "Dealer",
		date: "19/03/2026",
		assetPath: "/docs/04-supplier-declaration.md",
	},
	{
		id: "payment-mandate",
		title: "Payment mandate",
		source: "Customer",
		date: "20/03/2026",
		assetPath: "/docs/05-payment-mandate.md",
	},
	{
		id: "giro-slip",
		title: "Giro slip",
		source: "Dealer",
		date: "19/03/2026",
		assetPath: "/docs/06-giro-slip.md",
	},
	{
		id: "funds-form",
		title: "Funds form",
		source: "Dealer",
		date: "19/03/2026",
		assetPath: "/docs/07-funds-form.md",
	},
	{
		id: "fca-lookup",
		title: "FCA register lookup",
		source: "FCA",
		date: "20/03/2026",
		assetPath: "/docs/08-fca-register.md",
	},
	{
		id: "system-checks",
		title: "System check results",
		source: "Gold Check + HPI",
		date: "20/03/2026",
		assetPath: "/docs/09-system-checks.md",
	},
	{
		id: "previous-application",
		title: "Previous application",
		source: "CarMoney (via CRM)",
		date: "15/01/2025",
		assetPath: "/docs/01-broker-application.md",
	},
];

interface ExtractedDealData {
	customer: {
		brokerName: string;
		hpName: string;
		invoiceName: string;
		mandateName: string;
		brokerAddress: string;
		hpAddress: string;
		invoiceAddress: string;
		prevAddress: string;
		employmentYears: number;
		prevEmploymentYears: number;
	};
	vehicle: {
		makeModel: string;
		year: number;
		regBroker: string;
		regHp: string;
		regInvoice: string;
		mileageBroker: number;
		mileageInvoice: number;
	};
	financial: {
		cashPrice: number;
		deposit: number;
		financeAmount: number;
		monthlyPayment: number;
		apr: number;
		term: number;
		adminFee: number;
		delivery: number;
		extrasCap: number;
		adminFeeCap: number;
		financeCompanyOnInvoice: string;
	};
	dealer: {
		hpDealerName: string;
		invoiceDealerName: string;
		supplierDealerName: string;
		giroPayeeName: string;
		fundsDealerName: string;
	};
	bank: {
		giroSortCode: string;
		giroAccountNumber: string;
		fundsSortCode: string;
		fundsAccountNumber: string;
	};
	fca: {
		firmName: string;
		tradingNames: string[];
		status: string;
		permission: string;
	};
	system: {
		goldResult: string;
		hpiResult: string;
	};
}

export const DEALS_DATA: Record<string, ExtractedDealData> = {
	"AF-2026-00417": {
		customer: {
			brokerName: "Adam Piers",
			hpName: "Adam James Piers",
			invoiceName: "A J Piers",
			mandateName: "A Piers",
			brokerAddress: "14 Birchwood Lane, Solihull, B91 3QR",
			hpAddress: "14 Birchwood Lane, Solihull, B91 3QR",
			invoiceAddress: "14 Birchwood Ln, Solihull, B91 3QR",
			prevAddress: "14 Birchwood Lane, Solihull B91 3QR",
			employmentYears: 3,
			prevEmploymentYears: 2,
		},
		vehicle: {
			makeModel: "Ford Focus ST-Line",
			year: 2021,
			regBroker: "WR21XYZ",
			regHp: "WR21 XYZ",
			regInvoice: "WR21 XYZ",
			mileageBroker: 27000,
			mileageInvoice: 28400,
		},
		financial: {
			cashPrice: 14000,
			deposit: 1500,
			financeAmount: 12500,
			monthlyPayment: 287.43,
			apr: 9.9,
			term: 48,
			adminFee: 295,
			delivery: 150,
			extrasCap: 400,
			adminFeeCap: 350,
			financeCompanyOnInvoice: "Northgate Motor Finance Ltd",
		},
		dealer: {
			hpDealerName: "Midland Motor Group",
			invoiceDealerName: "Midland Cars Direct",
			supplierDealerName: "Midland Motor Group Ltd",
			giroPayeeName: "Midland Motor Group Ltd",
			fundsDealerName: "Midland Motor Group",
		},
		bank: {
			giroSortCode: "20-45-18",
			giroAccountNumber: "41839205",
			fundsSortCode: "20-45-19",
			fundsAccountNumber: "41839205",
		},
		fca: {
			firmName: "Midland Motor Group Ltd",
			tradingNames: ["Midland Cars Direct"],
			status: "Authorised",
			permission: "Credit brokerage",
		},
		system: {
			goldResult: "No issues flagged",
			hpiResult: "Clear",
		},
	},
	"AF-2026-00418": {
		customer: {
			brokerName: "Sarah Jenkins",
			hpName: "Sarah A Jenkins",
			invoiceName: "S Jenkins",
			mandateName: "Sarah Jenkins",
			brokerAddress: "72 Queens Road, Coventry, CV1 3EG",
			hpAddress: "72 Queens Road, Coventry, CV1 3EG",
			invoiceAddress: "72 Queens Rd, Coventry, CV1 3EG",
			prevAddress: "72 Queens Road, Coventry, CV1 3EG",
			employmentYears: 5,
			prevEmploymentYears: 5,
		},
		vehicle: {
			makeModel: "Nissan Qashqai",
			year: 2019,
			regBroker: "GD19LKN",
			regHp: "GD19 LKN",
			regInvoice: "GD19 LKN",
			mileageBroker: 45000,
			mileageInvoice: 45200,
		},
		financial: {
			cashPrice: 10400,
			deposit: 1500,
			financeAmount: 8900,
			monthlyPayment: 215.5,
			apr: 10.9,
			term: 48,
			adminFee: 150,
			delivery: 50,
			extrasCap: 250,
			adminFeeCap: 250,
			financeCompanyOnInvoice: "Northgate Motor Finance Ltd",
		},
		dealer: {
			hpDealerName: "Apex Car Sales",
			invoiceDealerName: "Apex Auto Sales",
			supplierDealerName: "Apex Cars Ltd",
			giroPayeeName: "Apex Cars Ltd",
			fundsDealerName: "Apex Car Sales",
		},
		bank: {
			giroSortCode: "12-34-56",
			giroAccountNumber: "87654321",
			fundsSortCode: "12-34-56",
			fundsAccountNumber: "87654321",
		},
		fca: {
			firmName: "Apex Cars Ltd",
			tradingNames: ["Apex Car Sales"],
			status: "Authorised",
			permission: "Credit brokerage",
		},
		system: {
			goldResult: "No issues flagged",
			hpiResult: "Clear",
		},
	},
	"AF-2026-00419": {
		customer: {
			brokerName: "David Miller",
			hpName: "David Miller",
			invoiceName: "David Miller",
			mandateName: "David Miller",
			brokerAddress: "88 High Street, Solihull, B90 3QA",
			hpAddress: "88 High Street, Solihull, B90 3QA",
			invoiceAddress: "88 High Street, Solihull, B90 3QA",
			prevAddress: "88 High Street, Solihull, B90 3QA",
			employmentYears: 8,
			prevEmploymentYears: 8,
		},
		vehicle: {
			makeModel: "BMW 3 Series",
			year: 2020,
			regBroker: "SF70KOP",
			regHp: "SF70 KOP",
			regInvoice: "SF70 KOP",
			mileageBroker: 12000,
			mileageInvoice: 12000,
		},
		financial: {
			cashPrice: 21750,
			deposit: 2000,
			financeAmount: 19750,
			monthlyPayment: 420.3,
			apr: 8.9,
			term: 60,
			adminFee: 100,
			delivery: 0,
			extrasCap: 200,
			adminFeeCap: 200,
			financeCompanyOnInvoice: "Northgate Motor Finance Ltd",
		},
		dealer: {
			hpDealerName: "Vanguard Autos",
			invoiceDealerName: "Vanguard Autos",
			supplierDealerName: "Vanguard Autos Ltd",
			giroPayeeName: "Vanguard Autos Ltd",
			fundsDealerName: "Vanguard Autos",
		},
		bank: {
			giroSortCode: "30-90-12",
			giroAccountNumber: "11223344",
			fundsSortCode: "30-90-12",
			fundsAccountNumber: "11223344",
		},
		fca: {
			firmName: "Vanguard Autos Ltd",
			tradingNames: ["Vanguard Autos"],
			status: "Authorised",
			permission: "Credit brokerage",
		},
		system: {
			goldResult: "No issues flagged",
			hpiResult: "Clear",
		},
	},
	"AF-2026-00420": {
		customer: {
			brokerName: "Elena Rostova",
			hpName: "Elena Rostova",
			invoiceName: "Elena Rostova",
			mandateName: "Elena Rostova",
			brokerAddress: "32 Park Lane, London, W1K 1QA",
			hpAddress: "32 Park Lane, London, W1K 1QA",
			invoiceAddress: "32 Park Lane, London, W1K 1QA",
			prevAddress: "32 Park Lane, London, W1K 1QA",
			employmentYears: 4,
			prevEmploymentYears: 4,
		},
		vehicle: {
			makeModel: "Audi Q7",
			year: 2022,
			regBroker: "HJ22GFT",
			regHp: "HJ22 GFT",
			regInvoice: "HJ22 GFT",
			mileageBroker: 15200,
			mileageInvoice: 18900,
		},
		financial: {
			cashPrice: 35200,
			deposit: 4000,
			financeAmount: 31200,
			monthlyPayment: 610.15,
			apr: 7.9,
			term: 60,
			adminFee: 150,
			delivery: 50,
			extrasCap: 300,
			adminFeeCap: 300,
			financeCompanyOnInvoice: "Northgate Motor Finance Ltd",
		},
		dealer: {
			hpDealerName: "Prestige Carriage Co",
			invoiceDealerName: "Prestige Carriage Co",
			supplierDealerName: "Prestige Carriage Co Ltd",
			giroPayeeName: "Prestige Carriage Co Ltd",
			fundsDealerName: "Prestige Carriage Co",
		},
		bank: {
			giroSortCode: "20-11-22",
			giroAccountNumber: "99887766",
			fundsSortCode: "20-11-22",
			fundsAccountNumber: "99887755",
		},
		fca: {
			firmName: "Prestige Carriage Co Ltd",
			tradingNames: ["Prestige Carriage Co"],
			status: "Authorised",
			permission: "Credit brokerage",
		},
		system: {
			goldResult: "No issues flagged",
			hpiResult: "Clear",
		},
	},
	"AF-2026-00421": {
		customer: {
			brokerName: "Marcus Vance",
			hpName: "Marcus Vance",
			invoiceName: "Marcus Vance",
			mandateName: "Marcus Vance",
			brokerAddress: "12 West Road, Bristol, BS1 4TB",
			hpAddress: "12 West Road, Bristol, BS1 4TB",
			invoiceAddress: "12 West Road, Bristol, BS1 4TB",
			prevAddress: "12 West Road, Bristol, BS1 4TB",
			employmentYears: 2,
			prevEmploymentYears: 2,
		},
		vehicle: {
			makeModel: "Vauxhall Corsa",
			year: 2018,
			regBroker: "LN18PVM",
			regHp: "LN18 PVM",
			regInvoice: "LN18 PVM",
			mileageBroker: 68000,
			mileageInvoice: 68150,
		},
		financial: {
			cashPrice: 7400,
			deposit: 1000,
			financeAmount: 6400,
			monthlyPayment: 145.2,
			apr: 11.9,
			term: 48,
			adminFee: 50,
			delivery: 50,
			extrasCap: 150,
			adminFeeCap: 150,
			financeCompanyOnInvoice: "Northgate Motor Finance Ltd",
		},
		dealer: {
			hpDealerName: "Westside Car Mart",
			invoiceDealerName: "Westside Car Mart",
			supplierDealerName: "Westside Car Mart Ltd",
			giroPayeeName: "Westside Car Mart Ltd",
			fundsDealerName: "Westside Car Mart",
		},
		bank: {
			giroSortCode: "40-50-60",
			giroAccountNumber: "55667788",
			fundsSortCode: "40-50-60",
			fundsAccountNumber: "55667788",
		},
		fca: {
			firmName: "Westside Car Mart Ltd",
			tradingNames: ["Westside Car Mart"],
			status: "Authorised",
			permission: "Credit brokerage",
		},
		system: {
			goldResult: "No issues flagged",
			hpiResult: "Clear",
		},
	},
};

function check(id: string, partial: Omit<CheckResult, "id">): CheckResult {
	return { id, ...partial };
}

const checkStatusOverrides = new Map<string, CheckStatus>();
const dealStatusOverrides = new Map<string, Deal["status"]>();

export function resolveCheckInStore(dealId: string, checkId: string): void {
	checkStatusOverrides.set(`${dealId}:${checkId}`, "resolved");
}

export function pendingUpdateCheckInStore(
	dealId: string,
	checkId: string,
): void {
	checkStatusOverrides.set(`${dealId}:${checkId}`, "pending_update");
}

export function setDealStatusInStore(
	dealId: string,
	status: Deal["status"],
): void {
	dealStatusOverrides.set(dealId, status);
}

export function getDeal(id: string = "AF-2026-00417"): Deal {
	const extracted = DEALS_DATA[id] || DEALS_DATA["AF-2026-00417"];
	const checks: CheckResult[] = [];

	// Customer
	const employmentPass =
		extracted.customer.employmentYears ===
			extracted.customer.prevEmploymentYears ||
		extracted.customer.employmentYears ===
			extracted.customer.prevEmploymentYears + 1;

	checks.push(
		check("employment-duration", {
			title: "Employment duration matches previous application",
			category: "Customer",
			checkType: "exact",
			status: employmentPass ? "pass" : "fail",
			rule: "Match between broker application and previous application (accounting for elapsed time where applicable).",
			explanation: employmentPass
				? "Employment duration is consistent with the previous approved application."
				: "Employment duration differs from the previous approved application.",
			evidence: [
				{
					sourceLabel: "Broker application",
					documentId: "broker-application",
					value: `${extracted.customer.employmentYears} years`,
				},
				{
					sourceLabel: "Previous application",
					documentId: "previous-application",
					value: `${extracted.customer.prevEmploymentYears} years`,
					note: "Previous application values are verified against historical CRM records.",
				},
			],
			pasDraft: employmentPass
				? undefined
				: {
						to: "Broker",
						title: "Employment duration mismatch",
						body: `The current application shows ${extracted.customer.employmentYears} years at current employer, but the previous approved application shows ${extracted.customer.prevEmploymentYears} years. Please confirm the correct start date or duration.`,
					},
		}),
	);

	const customerNamePass =
		fuzzyNameMatch(extracted.customer.brokerName, extracted.customer.hpName) &&
		fuzzyNameMatch(
			extracted.customer.brokerName,
			extracted.customer.invoiceName,
		) &&
		fuzzyNameMatch(
			extracted.customer.brokerName,
			extracted.customer.mandateName,
		);

	checks.push(
		check("customer-name", {
			title: "Customer name refers to the same person",
			category: "Customer",
			checkType: "fuzzy",
			status: customerNamePass ? "pass" : "needs_review",
			rule: "Fuzzy match across documents, allowing initials and missing middle names.",
			explanation: customerNamePass
				? "Name variants look consistent across the pack."
				: "Name variants need a quick human review.",
			evidence: [
				{
					sourceLabel: "Broker application",
					documentId: "broker-application",
					value: extracted.customer.brokerName,
				},
				{
					sourceLabel: "HP agreement",
					documentId: "hp-agreement",
					value: extracted.customer.hpName,
				},
				{
					sourceLabel: "Purchase invoice",
					documentId: "purchase-invoice",
					value: extracted.customer.invoiceName,
				},
				{
					sourceLabel: "Payment mandate",
					documentId: "payment-mandate",
					value: extracted.customer.mandateName,
				},
			],
		}),
	);

	const addressPass =
		fuzzyAddressMatch(
			extracted.customer.brokerAddress,
			extracted.customer.hpAddress,
		) &&
		fuzzyAddressMatch(
			extracted.customer.brokerAddress,
			extracted.customer.invoiceAddress,
		) &&
		fuzzyAddressMatch(
			extracted.customer.brokerAddress,
			extracted.customer.prevAddress,
		);

	checks.push(
		check("customer-address", {
			title: "Customer address refers to the same place",
			category: "Customer",
			checkType: "fuzzy",
			status: addressPass ? "pass" : "needs_review",
			rule: "Fuzzy match across documents, allowing abbreviations like Ln/Lane.",
			explanation: addressPass
				? "Address variants look consistent across the pack."
				: "Address variants need a quick human review.",
			evidence: [
				{
					sourceLabel: "Broker application",
					documentId: "broker-application",
					value: extracted.customer.brokerAddress,
				},
				{
					sourceLabel: "HP agreement",
					documentId: "hp-agreement",
					value: extracted.customer.hpAddress,
				},
				{
					sourceLabel: "Purchase invoice",
					documentId: "purchase-invoice",
					value: extracted.customer.invoiceAddress,
				},
			],
		}),
	);

	// Vehicle
	const regPass = exactMatch(
		[
			extracted.vehicle.regBroker,
			extracted.vehicle.regHp,
			extracted.vehicle.regInvoice,
		],
		Normalizers.reg,
	);

	checks.push(
		check("vehicle-registration", {
			title: "Vehicle registration matches",
			category: "Vehicle",
			checkType: "exact",
			status: regPass ? "pass" : "fail",
			rule: "Exact match across sources, ignoring spacing.",
			explanation: regPass
				? "Registration matches after normalizing spacing."
				: "Registration differs across documents.",
			evidence: [
				{
					sourceLabel: "Broker application",
					documentId: "broker-application",
					value: extracted.vehicle.regBroker,
					normalized: Normalizers.reg(extracted.vehicle.regBroker),
				},
				{
					sourceLabel: "HP agreement",
					documentId: "hp-agreement",
					value: extracted.vehicle.regHp,
					normalized: Normalizers.reg(extracted.vehicle.regHp),
				},
				{
					sourceLabel: "Purchase invoice",
					documentId: "purchase-invoice",
					value: extracted.vehicle.regInvoice,
					normalized: Normalizers.reg(extracted.vehicle.regInvoice),
				},
			],
		}),
	);

	const mileagePass = numericToleranceMatch(
		extracted.vehicle.mileageBroker,
		extracted.vehicle.mileageInvoice,
		2000,
	);

	checks.push(
		check("vehicle-mileage", {
			title: "Vehicle mileage within tolerance",
			category: "Vehicle",
			checkType: "tolerance",
			status: mileagePass ? "pass" : "fail",
			rule: "Numeric tolerance, within 2,000 miles between sources.",
			explanation: mileagePass
				? "Mileage difference is within the acceptable tolerance."
				: "Mileage difference exceeds the acceptable tolerance.",
			evidence: [
				{
					sourceLabel: "Broker application",
					documentId: "broker-application",
					value: `${extracted.vehicle.mileageBroker.toLocaleString()} miles`,
				},
				{
					sourceLabel: "Purchase invoice",
					documentId: "purchase-invoice",
					value: `${extracted.vehicle.mileageInvoice.toLocaleString()} miles`,
				},
			],
		}),
	);

	// Financial
	const combinedExtras =
		extracted.financial.adminFee + extracted.financial.delivery;
	const extrasPass = combinedExtras <= extracted.financial.extrasCap;

	checks.push(
		check("invoice-extras-cap", {
			title: "Invoice extras within policy cap",
			category: "Financial",
			checkType: "policy",
			status: extrasPass ? "pass" : "fail",
			rule: `Policy rule: combined invoice extras must be ≤ £${extracted.financial.extrasCap}.`,
			explanation: extrasPass
				? "Extras are within policy."
				: "Extras exceed policy and need a revised invoice.",
			evidence: [
				{
					sourceLabel: "Purchase invoice (admin fee)",
					documentId: "purchase-invoice",
					value: `£${extracted.financial.adminFee}`,
				},
				{
					sourceLabel: "Purchase invoice (delivery)",
					documentId: "purchase-invoice",
					value: `£${extracted.financial.delivery}`,
				},
				{
					sourceLabel: "Combined extras",
					documentId: "purchase-invoice",
					value: `£${combinedExtras} (cap £${extracted.financial.extrasCap})`,
				},
			],
			pasDraft: {
				to: "Broker",
				title: "Invoice extras exceed policy cap",
				body: `The invoice shows £${combinedExtras} of extras (admin £${extracted.financial.adminFee} + delivery £${extracted.financial.delivery}), which exceeds the £${extracted.financial.extrasCap} cap. Please provide a revised invoice within policy.`,
			},
		}),
	);

	checks.push(
		check("invoice-finance-company", {
			title: "Invoice addressed to the correct finance company",
			category: "Financial",
			checkType: "exact",
			status:
				extracted.financial.financeCompanyOnInvoice ===
				"Northgate Motor Finance Ltd"
					? "pass"
					: "fail",
			rule: "Exact match: invoice must state Northgate Motor Finance Ltd as the finance company.",
			explanation: "Invoice finance company line is present and correct.",
			evidence: [
				{
					sourceLabel: "Purchase invoice",
					documentId: "purchase-invoice",
					value: extracted.financial.financeCompanyOnInvoice,
				},
			],
		}),
	);

	// Dealer & payee
	const dealerPass = [
		extracted.dealer.hpDealerName,
		extracted.dealer.invoiceDealerName,
		extracted.dealer.supplierDealerName,
		extracted.dealer.giroPayeeName,
		extracted.dealer.fundsDealerName,
	].every((name) =>
		dealerEntityMatch(name, extracted.fca.firmName, extracted.fca.tradingNames),
	);

	checks.push(
		check("dealer-entity", {
			title: "Dealer names resolve to the same firm",
			category: "Dealer & Payee",
			checkType: "entity_resolution",
			status: dealerPass ? "pass" : "needs_review",
			rule: "Entity resolution using FCA firm name and trading names.",
			explanation: dealerPass
				? "Dealer name variants match the FCA record."
				: "Dealer name variants need a quick human review.",
			evidence: [
				{
					sourceLabel: "HP agreement",
					documentId: "hp-agreement",
					value: extracted.dealer.hpDealerName,
				},
				{
					sourceLabel: "Purchase invoice",
					documentId: "purchase-invoice",
					value: extracted.dealer.invoiceDealerName,
				},
				{
					sourceLabel: "Supplier declaration",
					documentId: "supplier-declaration",
					value: extracted.dealer.supplierDealerName,
				},
				{
					sourceLabel: "FCA firm record",
					documentId: "fca-lookup",
					value: `${extracted.fca.firmName} (trading as ${extracted.fca.tradingNames.join(", ")})`,
				},
			],
		}),
	);

	const sortCodePass = exactMatch(
		[extracted.bank.giroSortCode, extracted.bank.fundsSortCode],
		Normalizers.sortCode,
	);

	checks.push(
		check("bank-sort-code", {
			title: "Sort code matches between payment instructions",
			category: "Dealer & Payee",
			checkType: "exact",
			status: sortCodePass ? "pass" : "fail",
			rule: "Exact match between giro slip and funds form (6 digits).",
			explanation: sortCodePass
				? "Sort code matches across payment instructions."
				: "Sort code differs between giro slip and funds form.",
			evidence: [
				{
					sourceLabel: "Giro slip",
					documentId: "giro-slip",
					value: extracted.bank.giroSortCode,
					normalized: Normalizers.sortCode(extracted.bank.giroSortCode),
				},
				{
					sourceLabel: "Funds form",
					documentId: "funds-form",
					value: extracted.bank.fundsSortCode,
					normalized: Normalizers.sortCode(extracted.bank.fundsSortCode),
				},
			],
			pasDraft: {
				to: "Dealer",
				title: "Sort code mismatch",
				body: `The giro slip shows sort code ${extracted.bank.giroSortCode}, but the funds form shows ${extracted.bank.fundsSortCode}. Please confirm the correct sort code and provide a corrected funds form or giro slip.`,
			},
		}),
	);

	const accountNumberPass = exactMatch(
		[extracted.bank.giroAccountNumber, extracted.bank.fundsAccountNumber],
		Normalizers.accountNumber,
	);

	checks.push(
		check("bank-account-number", {
			title: "Account number matches between payment instructions",
			category: "Dealer & Payee",
			checkType: "exact",
			status: accountNumberPass ? "pass" : "fail",
			rule: "Exact match between giro slip and funds form (8 digits).",
			explanation: "Account number matches across payment instructions.",
			evidence: [
				{
					sourceLabel: "Giro slip",
					documentId: "giro-slip",
					value: extracted.bank.giroAccountNumber,
				},
				{
					sourceLabel: "Funds form",
					documentId: "funds-form",
					value: extracted.bank.fundsAccountNumber,
				},
			],
		}),
	);

	const bankPass = id !== "AF-2026-00417" && id !== "AF-2026-00420";

	checks.push(
		check("bank-verification", {
			title: "EXAMPLE NEW AUTOMATED STEP: Dealer Confirmation of Payee check",
			category: "Dealer & Payee",
			checkType: "system_lookup",
			status: bankPass ? "pass" : "fail",
			rule: "System lookup: Bank account details must verify against registered payee name.",
			explanation: bankPass
				? "Sort code and account number verified successfully with the payee name."
				: id === "AF-2026-00417"
					? "Verification failed: Sort code mismatch for the payee."
					: "Verification failed: Account number mismatch for the payee.",
			evidence: [
				{
					sourceLabel: "Payee Name",
					documentId: "giro-slip",
					value: extracted.dealer.giroPayeeName,
				},
				{
					sourceLabel: "Bank Verification Lookup",
					documentId: "system-checks",
					value: bankPass
						? "Verified - Account details match payee name"
						: id === "AF-2026-00417"
							? "Failed - Sort code mismatch"
							: "Failed - Account number mismatch",
				},
			],
			pasDraft: bankPass
				? undefined
				: {
						to: "Dealer",
						title: "Bank details verification failure",
						body:
							id === "AF-2026-00417"
								? `The bank verification service flagged a sort code mismatch for account details provided for payee ${extracted.dealer.giroPayeeName}. Please check and confirm the correct sort code.`
								: `The bank verification service flagged an account number mismatch for account details provided for payee ${extracted.dealer.giroPayeeName}. Please check and confirm the correct bank account number.`,
					},
		}),
	);

	// System
	const systemPass =
		extracted.system.goldResult === "No issues flagged" &&
		extracted.system.hpiResult === "Clear";

	checks.push(
		check("system-checks", {
			title: "System checks clear",
			category: "System",
			checkType: "system_lookup",
			status: systemPass ? "pass" : "fail",
			rule: "Gold Check and HPI must not flag issues.",
			explanation: systemPass
				? "Gold Check and HPI are clear."
				: "One or more system checks flagged an issue.",
			evidence: [
				{
					sourceLabel: "Gold Check",
					documentId: "system-checks",
					value: extracted.system.goldResult,
				},
				{
					sourceLabel: "HPI / Vehicle finance",
					documentId: "system-checks",
					value: extracted.system.hpiResult,
				},
			],
		}),
	);

	// Apply check status overrides from store
	for (const c of checks) {
		const key = `${id}:${c.id}`;
		const override = checkStatusOverrides.get(key);
		if (override) {
			c.status = override;
		}
	}

	// Calculate overall status based on checklist counts
	const counts = {
		fail: 0,
		needs_review: 0,
		missing: 0,
		pass: 0,
		resolved: 0,
		pending_update: 0,
	};
	for (const c of checks) {
		counts[c.status]++;
	}

	const overall =
		dealStatusOverrides.get(id) ||
		(counts.fail > 0
			? "Blocked"
			: counts.needs_review + counts.missing + counts.pending_update > 0
				? "Needs review"
				: "Ready");

	const getDocumentsForDeal = (dealId: string): DocumentMeta[] => {
		const isOriginal = dealId === "AF-2026-00417";
		return documents.map((d) => ({
			...d,
			assetPath: isOriginal ? d.assetPath : `mock://${dealId}/${d.id}`,
		}));
	};

	return {
		id,
		customerName: extracted.customer.brokerName,
		dealerName: extracted.dealer.hpDealerName,
		vehicleReg: Normalizers.reg(extracted.vehicle.regBroker),
		financeAmount: extracted.financial.financeAmount,
		status: overall as Deal["status"],
		checks,
		documents: getDocumentsForDeal(id),
	};
}

export function getDeals(): Deal[] {
	return Object.keys(DEALS_DATA).map((id) => getDeal(id));
}

export function getMockDocumentMarkdown(dealId: string, docId: string): string {
	const extracted = DEALS_DATA[dealId];
	if (!extracted) return "# Document not found";

	const customer = extracted.customer;
	const vehicle = extracted.vehicle;
	const financial = extracted.financial;
	const dealer = extracted.dealer;
	const bank = extracted.bank;
	const fca = extracted.fca;
	const system = extracted.system;

	const nameParts = customer.brokerName.split(" ");
	const firstName = nameParts[0] || "";
	const lastName = nameParts.slice(1).join(" ") || "";

	switch (docId) {
		case "broker-application":
			return `# 01 - Broker Application

**Source:** CarMoney (via CRM)

**Date submitted:** 18/03/2026

**Application reference:** ${dealId}

---

## Customer Details

| Field | Value |
| --- | --- |
| First name | ${firstName} |
| Surname | ${lastName} |
| Date of birth | 15/03/1988 |
| Address | ${customer.brokerAddress} |
| Employment status | Full-time |
| Time at current employer | ${customer.employmentYears} years |

## Vehicle Details

| Field | Value |
| --- | --- |
| Make / Model | ${vehicle.makeModel} |
| Year | ${vehicle.year} |
| Registration | ${vehicle.regBroker} |
| Mileage | ${vehicle.mileageBroker.toLocaleString()} |

## Financial Details

| Field | Value |
| --- | --- |
| Cash price | £${financial.cashPrice.toLocaleString()} |
| Deposit | £${financial.deposit.toLocaleString()} |
| Amount to finance | £${financial.financeAmount.toLocaleString()} |
| Monthly payment | £${financial.monthlyPayment} |
| APR | ${financial.apr}% |

## Previous Application

This customer has a previous approved application details on file:

| Field | Previous value |
| --- | --- |
| Name | ${customer.brokerName} |
| Address | ${customer.prevAddress} |
| Time at current employer | ${customer.prevEmploymentYears} years |
`;

		case "hp-agreement":
			return `# 02 - HP Agreement

**Generated by:** Northgate Motor Finance Ltd

**Agreement reference:** HP-${dealId.split("-").pop()}

**Date:** 20/03/2026

---

## Hirer Details

| Field | Value |
| --- | --- |
| Full name | ${customer.hpName} |
| Date of birth | 15/03/1988 |
| Address | ${customer.hpAddress} |

## Vehicle Details

| Field | Value |
| --- | --- |
| Make / Model | ${vehicle.makeModel} |
| Year | ${vehicle.year} |
| Registration | ${vehicle.regHp} |

## Financial Details

| Field | Value |
| --- | --- |
| Cash price | £${financial.cashPrice.toLocaleString()} |
| Deposit | £${financial.deposit.toLocaleString()} |
| Advance (amount financed) | £${financial.financeAmount.toLocaleString()} |
| Monthly payment | £${financial.monthlyPayment} |
| APR | ${financial.apr}% |
| Term | ${financial.term} months |

## Dealer

| Field | Value |
| --- | --- |
| Dealer name | ${dealer.hpDealerName} |
`;

		case "purchase-invoice":
			return `# 03 - Purchase Invoice

**Invoice Ref:** INV-${dealId.split("-").pop()}

**Date:** 19/03/2026

**Invoice To:**
Northgate Motor Finance Ltd
P.O. Box 4220
Solihull

---

## Customer Details

| Field | Value |
| --- | --- |
| Name | ${customer.invoiceName} |
| Address | ${customer.invoiceAddress} |

## Vehicle details

| Field | Value |
| --- | --- |
| Vehicle description | ${vehicle.makeModel} |
| Registration | ${vehicle.regInvoice} |
| Mileage | ${vehicle.mileageInvoice.toLocaleString()} |

## Financial Summary

| Field | Value |
| --- | --- |
| Cash price | £${financial.cashPrice.toLocaleString()} |
| Less Deposit | -£${financial.deposit.toLocaleString()} |
| Add Admin Fee | £${financial.adminFee} |
| Add Delivery Charge | £${financial.delivery} |
| **Balance Payable** | **£${(financial.financeAmount + financial.adminFee + financial.delivery).toLocaleString()}** |

## Dealer Bank details

| Field | Value |
| --- | --- |
| Bank name | Barclays Business Bank |
| Account name | ${dealer.invoiceDealerName} |
| Sort Code | ${bank.giroSortCode} |
| Account number | ${bank.giroAccountNumber} |
`;

		case "supplier-declaration":
			return `# 04 - Supplier Declaration

**Dealer:** ${dealer.supplierDealerName}

**Date:** 19/03/2026

---

I declare that I have supplied the vehicle below to the customer listed, under the terms of the hire purchase agreement.

## Customer

| Field | Value |
| --- | --- |
| Name | ${customer.hpName} |
| Address | ${customer.hpAddress} |

## Vehicle

| Field | Value |
| --- | --- |
| Registration | ${vehicle.regHp} |
| Make/Model | ${vehicle.makeModel} |

**Signed:** Midland Motor Group Payout Team
`;

		case "payment-mandate":
			return `# 05 - Payment Mandate (Direct Debit)

**Account Holder:** ${customer.mandateName}

**Date:** 20/03/2026

---

Please pay Northgate Motor Finance Ltd Direct Debits from the account detailed in this Instruction subject to the safeguards assured by the Direct Debit Guarantee.

| Field | Value |
| --- | --- |
| Sort Code | ${bank.giroSortCode} |
| Account Number | ${bank.giroAccountNumber} |
`;

		case "giro-slip":
			return `# 06 - Giro Slip

**Payee:** ${dealer.giroPayeeName}

---

**Bank Giro Credit**

| Field | Value |
| --- | --- |
| Sort Code | ${bank.giroSortCode} |
| Account Number | ${bank.giroAccountNumber} |
`;

		case "funds-form":
			return `# 07 - Funds Form

**Dealer:** ${dealer.fundsDealerName}

---

**Funds Transfer Instruction Form**

Please dispatch funds via Chaps/Faster Payment to:

| Field | Value |
| --- | --- |
| Account Name | ${dealer.fundsDealerName} |
| Sort Code | ${bank.fundsSortCode} |
| Account Number | ${bank.fundsAccountNumber} |
`;

		case "fca-lookup":
			return `# 08 - FCA Register Lookup

**FCA Register Lookup Result**

**Date of Lookup:** 20/03/2026

---

## Firm Details

| Field | Value |
| --- | --- |
| Firm Name | ${fca.firmName} |
| Trading Names | ${fca.tradingNames.join(", ")} |
| Current Status | ${fca.status} |
| Permitted Activities | ${fca.permission} |
`;

		case "system-checks": {
			const dealBankPass =
				dealId !== "AF-2026-00417" && dealId !== "AF-2026-00420";
			const bankVerificationResult = dealBankPass
				? "Verified - Account details match payee name"
				: dealId === "AF-2026-00417"
					? "Failed - Sort code mismatch"
					: "Failed - Account number mismatch";

			return `# 09 - System Check Results

**Date of run:** 20/03/2026

---

## Gold Check

| Field | Value |
| --- | --- |
| Check Type | Gold Check Standard |
| Result | ${system.goldResult} |

## HPI / Finance Check

| Field | Value |
| --- | --- |
| Check Type | HPI Active Finance Lookup |
| Result | ${system.hpiResult} |

## Bank Verification

| Field | Value |
| --- | --- |
| Check Type | Bank Verification Service |
| Result | ${bankVerificationResult} |
`;
		}

		case "previous-application":
			return getMockDocumentMarkdown(dealId, "broker-application");

		default:
			return `# Document Details
Unknown document type.`;
	}
}
