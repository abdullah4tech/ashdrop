<script lang="ts">
	import { onMount } from 'svelte';
	import { generateAndSaveKeyPair, myPublicKeyB64 } from '$lib/crypto';
	import ArrowRight from '$lib/components/ArrowRight.svelte';

	let pubKey = $state<string | null>(null);
	let receiveLink = $state('');
	let copied = $state(false);
	let generating = $state(false);
	let showRegen = $state(false);

	onMount(() => {
		const existing = myPublicKeyB64();
		if (existing) {
			pubKey = existing;
			receiveLink = `${location.origin}/drop-for/${existing}`;
		}
	});

	async function generate() {
		generating = true;
		pubKey = await generateAndSaveKeyPair();
		receiveLink = `${location.origin}/drop-for/${pubKey}`;
		generating = false;
		showRegen = false;
	}

	async function copy() {
		await navigator.clipboard.writeText(receiveLink);
		copied = true;
		setTimeout(() => (copied = false), 1800);
	}
</script>

<svelte:head><title>My receive address — Ashdrop</title></svelte:head>

<main>
	{#if pubKey}
		<div class="hero">
			<p class="eyebrow">end-to-end encrypted · browser-keyed</p>
			<h1>Your receive address.</h1>
			<p class="sub">Share this with anyone who needs to send you a secret. Only this browser can decrypt what they drop.</p>
		</div>

		<div class="linkrow">
			<input class="linkinput" readonly value={receiveLink} onclick={(e) => e.currentTarget.select()} />
			<button class="cta-sm" onclick={copy}>{copied ? 'Copied' : 'Copy'}</button>
		</div>

		<div class="notice">
			Your decryption key lives only in this browser's storage. Clearing site data or switching browsers means you can't open drops sent to this address. Regenerating creates a new address — anything sent to the old one becomes unreadable.
		</div>

		{#if showRegen}
			<div class="regen-box">
				<p>This will replace your key. Pending drops sent to your current address will be permanently lost.</p>
				<div class="regen-row">
					<button class="danger" onclick={generate} disabled={generating}>
						{generating ? 'Generating…' : 'Yes, regenerate'}
					</button>
					<button class="ghost" onclick={() => (showRegen = false)}>Cancel</button>
				</div>
			</div>
		{:else}
			<button class="ghost" onclick={() => (showRegen = true)}>Regenerate address</button>
		{/if}
	{:else}
		<div class="hero">
			<p class="eyebrow">zero-knowledge · no account needed</p>
			<h1>Get your receive address.</h1>
			<p class="sub">Your browser generates a keypair. Anyone who visits your receive link can drop a secret that only you can open.</p>
		</div>

		<div class="steps">
			<div class="step"><span class="n">1</span><span>Generate your address here — once</span></div>
			<div class="step"><span class="n">2</span><span>Share your receive link anywhere — it's a public key, not a secret</span></div>
			<div class="step"><span class="n">3</span><span>They visit it, drop a secret, share the drop link</span></div>
			<div class="step"><span class="n">4</span><span>Only this browser can decrypt it</span></div>
		</div>

		<button class="cta" onclick={generate} disabled={generating}>
			{generating ? 'Generating…' : 'Generate my receive address'}
		<span class="btn-icon"><ArrowRight size="0.9rem" /></span>
		</button>
	{/if}
</main>

<style>
	main {
		max-width: 42rem;
		margin: 0 auto;
		padding: 3.5rem 1.5rem 6rem;
	}

	.hero { margin-bottom: 2.4rem; }
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
		font-size: clamp(2rem, 5vw, 3rem);
		font-weight: 800;
		letter-spacing: -0.04em;
		line-height: 1.0;
		margin: 0 0 0.9rem;
	}
	.sub {
		font-size: 0.96rem;
		color: var(--color-muted);
		margin: 0;
		line-height: 1.6;
	}

	.linkrow {
		display: flex;
		border: 1px solid var(--color-line);
		margin-bottom: 1.2rem;
	}
	.linkinput {
		flex: 1;
		min-width: 0;
		padding: 0.8rem 1rem;
		border: 0;
		outline: none;
		background: var(--color-surf);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--color-ink);
	}
	.cta-sm {
		padding: 0.8rem 1.2rem;
		border: 0;
		border-left: 1px solid var(--color-line);
		background: var(--color-ink);
		color: var(--color-bg);
		font-family: var(--font-mono);
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
		transition: background 0.12s;
	}
	.cta-sm:hover { background: var(--color-rust); }

	.notice {
		border: 1px solid var(--color-line);
		border-left: 3px solid var(--color-line);
		padding: 0.9rem 1rem;
		font-size: 0.82rem;
		color: var(--color-muted);
		line-height: 1.6;
		margin-bottom: 1.4rem;
		background: var(--color-surf);
	}

	.regen-box {
		border: 1px solid var(--color-line);
		padding: 1rem 1.2rem;
		background: var(--color-surf);
		margin-bottom: 1rem;
		font-size: 0.85rem;
		color: var(--color-ink);
	}
	.regen-box p { margin: 0 0 1rem; }
	.regen-row { display: flex; gap: 0.6rem; }

	.cta {
		display: flex;
		align-items: center;
		gap: 0;
		width: 100%;
		padding: 0.95rem 1.2rem;
		border: 0;
		background: var(--color-ink);
		color: var(--color-bg);
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 0.95rem;
		letter-spacing: -0.01em;
		cursor: pointer;
		transition: background 0.12s;
	}
	.cta:hover:not(:disabled) { background: var(--color-rust); }
	.cta:disabled { opacity: 0.5; cursor: progress; }

	.danger {
		padding: 0.65rem 1.1rem;
		border: 0;
		background: #c0392b;
		color: #fff;
		font-family: var(--font-mono);
		font-size: 0.82rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.12s;
	}
	.danger:hover:not(:disabled) { background: #a93226; }
	.danger:disabled { opacity: 0.6; cursor: progress; }

	.ghost {
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--color-muted);
		font-size: 0.85rem;
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.ghost:hover { color: var(--color-ink); }

	.steps {
		display: flex;
		flex-direction: column;
		gap: 0;
		margin-bottom: 2rem;
		border: 1px solid var(--color-line);
	}
	.step {
		display: flex;
		align-items: baseline;
		gap: 1rem;
		padding: 0.9rem 1rem;
		border-bottom: 1px solid var(--color-line);
		font-size: 0.9rem;
		color: var(--color-ink);
	}
	.step:last-child { border-bottom: 0; }
	.n {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		font-weight: 700;
		color: var(--color-rust);
		flex-shrink: 0;
		width: 1.2rem;
	}
</style>
