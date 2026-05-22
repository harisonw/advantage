const whitespace = /\s+/g;
const punctuation = /[^a-z0-9\s]/g;

export function normalizeReg(value: string): string {
	return value.replaceAll(whitespace, "").toUpperCase();
}

export function normalizeSortCode(value: string): string {
	return value.replaceAll(/[^0-9]/g, "");
}

export function normalizeAccountNumber(value: string): string {
	return value.replaceAll(/[^0-9]/g, "");
}

export function normalizeMoneyToPence(value: string): number | null {
	const cleaned = value.replaceAll(/[^0-9.-]/g, "");
	if (!cleaned) return null;
	const num = Number.parseFloat(cleaned);
	if (!Number.isFinite(num)) return null;
	return Math.round(num * 100);
}

export function normalizeText(value: string): string {
	return value
		.trim()
		.toLowerCase()
		.replaceAll(punctuation, "")
		.replaceAll(whitespace, " ");
}

export function normalizeName(value: string): string[] {
	const normalized = normalizeText(value);
	return normalized.split(" ").filter(Boolean);
}

export function normalizeAddress(value: string): string[] {
	const normalized = normalizeText(value)
		.replaceAll(/\bln\b/g, "lane")
		.replaceAll(/\brd\b/g, "road")
		.replaceAll(/\bst\b/g, "street")
		.replaceAll(/\bave\b/g, "avenue")
		.replaceAll(/\bdr\b/g, "drive");

	return normalized.split(" ").filter(Boolean);
}
