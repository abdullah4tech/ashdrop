/*
  Client-side zero-knowledge crypto. AES-256-GCM via the Web Crypto API.

  Two modes:
  1. Normal drop — random AES key, goes in the URL fragment.
  2. Recipient-keyed drop — ECDH P-256: sender generates an ephemeral keypair,
     derives a shared AES key from (sender ephemeral private + recipient public),
     stores the ephemeral public key on the server. The recipient's browser derives
     the same key from (recipient private + sender ephemeral public). The drop link
     contains no key material at all — only the secret ID.
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

// ── Normal drops (AES-256-GCM, key in URL fragment) ──────────────────────────

export interface Sealed {
	ciphertext: string;
	iv: string;
	key: string; // base64url — goes in the URL fragment only
}

export async function encryptSecret(plaintext: string): Promise<Sealed> {
	const rawKey = crypto.getRandomValues(new Uint8Array(32));
	const iv = crypto.getRandomValues(new Uint8Array(12));
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
	const pt = await crypto.subtle.decrypt(
		{ name: 'AES-GCM', iv: b64urlToBuf(iv) },
		key,
		b64urlToBuf(ciphertext)
	);
	return decoder.decode(pt);
}

// ── Recipient-keyed drops (ECDH P-256 + HKDF + AES-256-GCM) ─────────────────

const STORAGE_PRIV = 'ashdrop-priv-jwk';
const STORAGE_PUB  = 'ashdrop-pub-b64';

/** Generate a new ECDH keypair, persist it to localStorage, return the public key (base64url). */
export async function generateAndSaveKeyPair(): Promise<string> {
	const kp = await crypto.subtle.generateKey(
		{ name: 'ECDH', namedCurve: 'P-256' },
		true,
		['deriveKey', 'deriveBits']
	);
	const privJwk = await crypto.subtle.exportKey('jwk', kp.privateKey);
	const pubRaw = new Uint8Array(await crypto.subtle.exportKey('raw', kp.publicKey));
	const pubB64 = bytesToB64url(pubRaw);
	localStorage.setItem(STORAGE_PRIV, JSON.stringify(privJwk));
	localStorage.setItem(STORAGE_PUB, pubB64);
	return pubB64;
}

/** Returns the stored public key (base64url), or null if none generated yet. */
export function myPublicKeyB64(): string | null {
	return localStorage.getItem(STORAGE_PUB);
}

export function hasMyKeyPair(): boolean {
	return !!localStorage.getItem(STORAGE_PRIV);
}

async function loadMyPrivateKey(): Promise<CryptoKey> {
	const raw = localStorage.getItem(STORAGE_PRIV);
	if (!raw) throw new Error('No private key in this browser. Visit /me to set up a receive address.');
	return crypto.subtle.importKey(
		'jwk',
		JSON.parse(raw),
		{ name: 'ECDH', namedCurve: 'P-256' },
		false,
		['deriveKey', 'deriveBits']
	);
}

async function deriveAesKey(
	myPrivate: CryptoKey,
	theirPublicRaw: ArrayBuffer,
	usage: KeyUsage
): Promise<CryptoKey> {
	const theirPub = await crypto.subtle.importKey(
		'raw',
		theirPublicRaw,
		{ name: 'ECDH', namedCurve: 'P-256' },
		false,
		[]
	);
	const sharedBits = await crypto.subtle.deriveBits(
		{ name: 'ECDH', public: theirPub },
		myPrivate,
		256
	);
	const hkdfKey = await crypto.subtle.importKey('raw', sharedBits, 'HKDF', false, ['deriveKey']);
	return crypto.subtle.deriveKey(
		{
			name: 'HKDF',
			hash: 'SHA-256',
			salt: new Uint8Array(32),
			info: encoder.encode('ashdrop-ecdh-v1')
		},
		hkdfKey,
		{ name: 'AES-GCM', length: 256 },
		false,
		[usage]
	);
}

export interface RecipientSealed {
	ciphertext: string;
	iv: string;
	ephemeralPub: string; // sender's ephemeral public key — stored on server, never secret
}

/** Encrypt plaintext to a recipient's public key. No private key needed from sender. */
export async function encryptForRecipient(
	plaintext: string,
	recipientPubB64: string
): Promise<RecipientSealed> {
	const ephemKp = await crypto.subtle.generateKey(
		{ name: 'ECDH', namedCurve: 'P-256' },
		true,
		['deriveKey', 'deriveBits']
	);
	const aesKey = await deriveAesKey(ephemKp.privateKey, b64urlToBuf(recipientPubB64), 'encrypt');
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, encoder.encode(plaintext));
	const ephemPubRaw = new Uint8Array(await crypto.subtle.exportKey('raw', ephemKp.publicKey));
	return {
		ciphertext: bytesToB64url(new Uint8Array(ct)),
		iv: bytesToB64url(iv),
		ephemeralPub: bytesToB64url(ephemPubRaw)
	};
}

/** Decrypt a recipient-keyed drop using the private key stored in this browser. */
export async function decryptWithMyKey(
	ciphertext: string,
	iv: string,
	ephemeralPubB64: string
): Promise<string> {
	const myPriv = await loadMyPrivateKey();
	const aesKey = await deriveAesKey(myPriv, b64urlToBuf(ephemeralPubB64), 'decrypt');
	const pt = await crypto.subtle.decrypt(
		{ name: 'AES-GCM', iv: b64urlToBuf(iv) },
		aesKey,
		b64urlToBuf(ciphertext)
	);
	return decoder.decode(pt);
}
