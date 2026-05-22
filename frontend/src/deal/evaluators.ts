import {
	normalizeAccountNumber,
	normalizeAddress,
	normalizeName,
	normalizeReg,
	normalizeSortCode,
} from "./normalize";

export function exactMatch(
	values: string[],
	normalize: (v: string) => string = (v) => v,
): boolean {
	const normalized = values.map((v) => normalize(v));
	if (normalized.length === 0) return true;
	return normalized.every((v) => v === normalized[0]);
}

export function numericToleranceMatch(
	a: number,
	b: number,
	tolerance: number,
): boolean {
	return Math.abs(a - b) <= tolerance;
}

export function fuzzyNameMatch(a: string, b: string): boolean {
	const aTokens = normalizeName(a);
	const bTokens = normalizeName(b);
	if (aTokens.length === 0 || bTokens.length === 0) return false;

	const aLast = aTokens[aTokens.length - 1];
	const bLast = bTokens[bTokens.length - 1];
	if (aLast !== bLast) return false;

	const aFirst = aTokens[0];
	const bFirst = bTokens[0];

	if (aFirst === bFirst) return true;
	if (aFirst[0] && bFirst[0] && aFirst[0] === bFirst[0]) return true;

	return false;
}

export function fuzzyAddressMatch(a: string, b: string): boolean {
	const aTokens = new Set(normalizeAddress(a));
	const bTokens = new Set(normalizeAddress(b));
	if (aTokens.size === 0 || bTokens.size === 0) return false;

	let overlap = 0;
	for (const token of aTokens) {
		if (bTokens.has(token)) overlap += 1;
	}

	const requiredOverlap = Math.min(
		6,
		Math.ceil(Math.min(aTokens.size, bTokens.size) * 0.6),
	);
	return overlap >= requiredOverlap;
}

export function dealerEntityMatch(
	candidate: string,
	firmName: string,
	tradingNames: string[],
): boolean {
	const c = normalizeName(candidate).join(" ");
	const firm = normalizeName(firmName).join(" ");
	if (c === firm) return true;

	for (const t of tradingNames) {
		const trading = normalizeName(t).join(" ");
		if (c === trading) return true;
	}

	// Allow removing common suffixes.
	const stripSuffixes = (v: string) =>
		v
			.replaceAll(/\blimited\b/g, "")
			.replaceAll(/\bltd\b/g, "")
			.replaceAll(/\bgroup\b/g, "group")
			.trim()
			.replaceAll(/\s+/g, " ");

	if (stripSuffixes(c) === stripSuffixes(firm)) return true;

	return false;
}

export const Normalizers = {
	reg: normalizeReg,
	sortCode: normalizeSortCode,
	accountNumber: normalizeAccountNumber,
};
