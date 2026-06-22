/* Tiny .env parser/serializer — just enough to power the key-picker safety step. */

export interface EnvPair {
	key: string;
	value: string;
}

export function parseEnv(text: string): EnvPair[] {
	const out: EnvPair[] = [];
	for (const raw of text.split(/\r?\n/)) {
		const line = raw.trim();
		if (!line || line.startsWith('#')) continue;
		const eq = line.indexOf('=');
		if (eq === -1) continue;
		const key = line
			.slice(0, eq)
			.trim()
			.replace(/^export\s+/, '');
		let value = line.slice(eq + 1).trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}
		if (key) out.push({ key, value });
	}
	return out;
}

export function buildEnv(pairs: EnvPair[]): string {
	return pairs.map((p) => `${p.key}=${p.value}`).join('\n') + '\n';
}

/** Mask a secret-ish value for display: keep a hint, hide the rest. */
export function maskValue(v: string): string {
	if (v.length <= 6) return '•'.repeat(v.length || 3);
	return v.slice(0, 3) + '•'.repeat(Math.min(12, v.length - 3));
}
