<script lang="ts">
	import { inview } from '$lib/actions/inview';
	import ArrowRight from '$lib/components/ArrowRight.svelte';
	import Github from '$lib/components/Github.svelte';

	const mitigated = [
		{ threat: 'Database or server breach', how: 'Only ciphertext is stored. The key is never sent, so a full dump is noise.' },
		{ threat: 'Network sniffing', how: 'TLS in transit, and the key rides in the URL fragment — never transmitted to any server.' },
		{ threat: 'Replay / re-reading a link', how: 'View-once burn plus a TTL the datastore enforces itself.' },
		{ threat: 'A rogue operator', how: 'Zero-knowledge means even we can\'t read your secret. There\'s nothing to hand over.' }
	];

	const edges = [
		{ threat: 'A compromised device', how: 'If the sender\'s or receiver\'s machine is already owned, no web app can protect the plaintext once it\'s decrypted there.' },
		{ threat: 'Trusting the served JavaScript', how: 'You\'re trusting that the code we serve is the honest code. Mitigations: strict CSP, no third-party scripts on crypto pages, open repo you can audit or self-host.' },
		{ threat: 'A leaked link', how: 'Anyone with the full link can open the secret once. Use a recipient-keyed drop (via your receive address) if the channel isn\'t trustworthy.' }
	];

	const primitives = [
		{ name: 'AES-256-GCM', role: 'Symmetric encryption for the secret payload' },
		{ name: 'ECDH P-256', role: 'Key agreement for recipient-keyed drops' },
		{ name: 'HKDF-SHA-256', role: 'Key derivation from ECDH shared secret' },
		{ name: 'Web Crypto API', role: 'All crypto runs in the browser — no library code touches your plaintext' },
	];
</script>

<svelte:head>
	<title>Security — Ashdrop</title>
	<meta name="description" content="How Ashdrop's zero-knowledge model works, what it protects, and exactly where the edges are." />
</svelte:head>

<main>
	<section class="hero">
		<p class="eyebrow">zero-knowledge · open source · self-destructing</p>
		<h1>The server can't read<br />your secrets.</h1>
		<p class="sub">Everything is encrypted and decrypted in your browser with AES-256-GCM. The server holds ciphertext for a little while and counts views. It has no key and no way to read anything — by design, not by policy.</p>
		<a href="https://github.com/abdullah4tech/ashdrop" target="_blank" rel="noreferrer" class="cta-outline">
			Read the source <span class="btn-icon"><ArrowRight size="0.9rem" /></span>
		</a>
	</section>

	<section class="band" use:inview>
		<p class="section-label">How it works</p>
		<h2>The flow</h2>
		<ol class="flow">
			<li><span class="n">01</span><span>A random 256-bit key and nonce are generated in your browser.</span></li>
			<li><span class="n">02</span><span>Your <code>.env</code> is encrypted locally. Only ciphertext goes to the server.</span></li>
			<li><span class="n">03</span><span>The key is placed in the link's <code>#fragment</code> — browsers never send fragments to servers.</span></li>
			<li><span class="n">04</span><span>The recipient's browser reads the key from the fragment and decrypts locally.</span></li>
			<li><span class="n">05</span><span>On open, the secret is burned: the ciphertext is deleted from the store.</span></li>
		</ol>
	</section>

	<section class="band" use:inview>
		<p class="section-label">Recipient-keyed drops</p>
		<h2>No key in the URL at all.</h2>
		<p class="body-text">For channels you don't trust (WhatsApp, email, Slack), use a recipient-keyed drop. The sender never puts the key anywhere public.</p>
		<ol class="flow">
			<li><span class="n">01</span><span>Bob generates a P-256 keypair in his browser. The private key never leaves his device.</span></li>
			<li><span class="n">02</span><span>Bob shares his receive link — it contains only his public key, not a secret.</span></li>
			<li><span class="n">03</span><span>Alice visits the link and encrypts with ECDH + HKDF into AES-256-GCM. The drop URL has no key fragment.</span></li>
			<li><span class="n">04</span><span>Even if someone intercepts Alice's drop link, they get only ciphertext. Decryption requires Bob's private key.</span></li>
		</ol>
	</section>

	<section class="band" use:inview>
		<p class="section-label">Cryptographic primitives</p>
		<h2>What's under the hood.</h2>
		<div class="table-wrap">
			<table>
				<thead>
					<tr>
						<th>Primitive</th>
						<th>Role</th>
					</tr>
				</thead>
				<tbody>
					{#each primitives as p (p.name)}
						<tr>
							<td class="mono">{p.name}</td>
							<td>{p.role}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section class="band" use:inview>
		<p class="section-label">What this covers</p>
		<h2>Protected threats.</h2>
		<div class="rows">
			{#each mitigated as m (m.threat)}
				<div class="row good">
					<span class="tag">covered</span>
					<div>
						<h3>{m.threat}</h3>
						<p>{m.how}</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<section class="band" use:inview>
		<p class="section-label">Honest limits</p>
		<h2>Where the edges are.</h2>
		<p class="body-text">We'd rather tell you the limits than overclaim. These gaps are inherent to every end-to-end web app.</p>
		<div class="rows">
			{#each edges as e (e.threat)}
				<div class="row edge">
					<span class="tag">your call</span>
					<div>
						<h3>{e.threat}</h3>
						<p>{e.how}</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<section class="band bottom-cta" use:inview>
		<h2>Don't take our word for it.</h2>
		<p class="body-text">The code is open. Audit it, file an issue, or run your own instance.</p>
		<div class="cta-row">
			<a href="https://github.com/abdullah4tech/ashdrop" target="_blank" rel="noreferrer" class="cta-fill">
				<Github size="0.9rem" />Read the code
			</a>
			<a href="/" class="cta-outline">
				Drop a secret <span class="btn-icon"><ArrowRight size="0.9rem" /></span>
			</a>
		</div>
	</section>

	<footer class="foot">
		<span class="brand"><span class="brand-ash">ash</span>drop</span>
		<span class="foot-tag">drop it. it turns to ash.</span>
	</footer>
</main>

<style>
	/* ── Layout ── */
	main {
		max-width: 72rem;
		margin: 0 auto;
		padding: 0 clamp(1.5rem, 5vw, 3rem);
	}

	/* ── Hero ── */
	.hero { padding: 3.5rem 0 3rem; }
	.eyebrow {
		font-family: var(--font-mono);
		font-size: 0.68rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-muted);
		margin: 0 0 1rem;
	}
	h1 {
		font-family: var(--font-display);
		font-size: clamp(2.4rem, 5vw, 3.6rem);
		font-weight: 800;
		letter-spacing: -0.04em;
		line-height: 1.0;
		margin: 0 0 1rem;
	}
	.sub {
		font-size: 0.96rem;
		color: var(--color-muted);
		line-height: 1.65;
		max-width: 48ch;
		margin: 0 0 1.8rem;
	}
	code {
		font-family: var(--font-mono);
		font-size: 0.88em;
		color: var(--color-ink);
	}

	/* ── Bands — no divider ── */
	.band {
		padding: 3rem 0;
		opacity: 0;
		transform: translateY(12px);
		transition: opacity 0.5s ease, transform 0.5s ease;
	}
	.band:global([data-inview='true']) {
		opacity: 1;
		transform: none;
	}
	.section-label {
		font-family: var(--font-mono);
		font-size: 0.68rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-muted);
		margin: 0 0 0.6rem;
	}
	h2 {
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 3vw, 2rem);
		font-weight: 800;
		letter-spacing: -0.03em;
		margin: 0 0 1.4rem;
	}
	.body-text {
		font-size: 0.95rem;
		line-height: 1.65;
		color: var(--color-muted);
		max-width: 52ch;
		margin: 0 0 1.6rem;
	}

	/* ── Flow list ── */
	.flow {
		list-style: none;
		margin: 0;
		padding: 0;
		border: 1px solid var(--color-line);
	}
	.flow li {
		display: flex;
		align-items: baseline;
		gap: 1rem;
		padding: 0.9rem 1rem;
		border-bottom: 1px solid var(--color-line);
		font-size: 0.92rem;
		line-height: 1.55;
		color: var(--color-ink);
	}
	.flow li:last-child { border-bottom: 0; }
	.n {
		font-family: var(--font-mono);
		font-size: 0.68rem;
		font-weight: 700;
		color: var(--color-rust);
		flex-shrink: 0;
		width: 1.6rem;
	}

	/* ── Primitives table ── */
	.table-wrap {
		border: 1px solid var(--color-line);
		overflow: hidden;
	}
	table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
	thead tr { border-bottom: 1px solid var(--color-line); background: var(--color-surf); }
	th {
		text-align: left;
		padding: 0.6rem 1rem;
		font-family: var(--font-mono);
		font-size: 0.68rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-muted);
		font-weight: 600;
	}
	td {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--color-line);
		vertical-align: top;
	}
	tr:last-child td { border-bottom: 0; }
	.mono { font-family: var(--font-mono); font-size: 0.82rem; color: var(--color-rust); white-space: nowrap; }

	/* ── Threat rows ── */
	.rows { display: flex; flex-direction: column; }
	.row {
		display: flex;
		gap: 1.2rem;
		padding: 1.1rem 1rem;
		border: 1px solid var(--color-line);
		border-top: 0;
		background: var(--color-bg);
	}
	.rows .row:first-child { border-top: 1px solid var(--color-line); }
	.row.edge { background: var(--color-surf); }
	.tag {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		white-space: nowrap;
		flex-shrink: 0;
		padding-top: 0.15rem;
		width: 4.5rem;
	}
	.row.good .tag { color: #4a7c59; }
	.row.edge .tag { color: var(--color-rust); }
	.row h3 {
		font-family: var(--font-display);
		font-size: 0.95rem;
		font-weight: 700;
		margin: 0 0 0.25rem;
		color: var(--color-ink);
	}
	.row p {
		font-size: 0.88rem;
		line-height: 1.55;
		color: var(--color-muted);
		margin: 0;
	}

	/* ── Bottom CTA ── */
	.bottom-cta h2 { margin-bottom: 0.6rem; }
	.cta-row { display: flex; gap: 0.8rem; flex-wrap: wrap; margin-top: 1.4rem; }
	.cta-fill {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.75rem 1.3rem;
		border: 0;
		background: var(--color-ink);
		color: var(--color-bg);
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 0.88rem;
		text-decoration: none;
		transition: background 0.12s;
	}
	.cta-fill:hover { background: var(--color-rust); }
	.cta-outline {
		display: inline-flex;
		align-items: center;
		gap: 0;
		padding: 0.75rem 1.3rem;
		border: 1px solid var(--color-line);
		background: transparent;
		color: var(--color-muted);
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 0.88rem;
		text-decoration: none;
		transition: color 0.12s, border-color 0.12s;
	}
	.cta-outline:hover { color: var(--color-ink); border-color: var(--color-ink); }

	/* ── Footer ── */
	.foot {
		padding: 3rem 0 4rem;
		border-top: 1px solid var(--color-line);
		display: flex;
		align-items: center;
		gap: 1.4rem;
	}
	.foot .brand {
		font-family: var(--font-mono);
		font-weight: 700;
		font-size: 0.9rem;
		color: var(--color-ink);
	}
	.foot-tag {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--color-muted);
	}
</style>
