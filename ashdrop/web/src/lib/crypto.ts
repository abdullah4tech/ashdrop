/*
  Client-side zero-knowledge crypto. AES-256-GCM via the Web Crypto API.
  The key is generated here, used here, and only ever leaves in the URL
  fragment — it never touches the network in a server-readable form.
*/

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToB64url(bytes: Uint8Array): string {
	let bin = '';
	for (const b of bytes) bin += String.fromCharCode(b);
	return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlToBuf(s: string): ArrayBuffer {
	let t = s.replace(/-/g, '+').replace(/_/g, '/');
	while (t.length % 4) t += '=';
	const bin = atob(t);
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	return out.buffer;
}

export interface Sealed {
	ciphertext: string; // base64url
	iv: string; // base64url
	key: string; // base64url — goes in the URL fragment only
}

export async function encryptSecret(plaintext: string): Promise<Sealed> {
	const rawKey = crypto.getRandomValues(new Uint8Array(32)); // AES-256
	const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit GCM nonce
	const key = await crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['encrypt']);
	const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(plaintext));
	return {
		ciphertext: bytesToB64url(new Uint8Array(ct)),
		iv: bytesToB64url(iv),
		key: bytesToB64url(rawKey)
	};
}

export async function decryptSecret(
	ciphertext: string,
	iv: string,
	keyB64url: string
): Promise<string> {
	const key = await crypto.subtle.importKey('raw', b64urlToBuf(keyB64url), 'AES-GCM', false, [
		'decrypt'
	]);
	// GCM is authenticated: a tampered ciphertext or wrong key throws here.
	const pt = await crypto.subtle.decrypt(
		{ name: 'AES-GCM', iv: b64urlToBuf(iv) },
		key,
		b64urlToBuf(ciphertext)
	);
	return decoder.decode(pt);
}
