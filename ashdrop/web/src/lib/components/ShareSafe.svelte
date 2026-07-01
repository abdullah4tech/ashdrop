<script lang="ts">
	/* Chat mockup: you paste an Ashdrop link into WhatsApp, but the chat app
	   only ever sees an opaque reference — the key never travels with it. */
</script>

<div class="chat">
	<div class="chat-head">
		<span class="wa" aria-hidden="true">
			<svg viewBox="0 0 24 24" fill="currentColor">
				<path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.8 14.02c-.24.68-1.42 1.31-1.95 1.35-.5.04-.5.37-3.16-.66-2.67-1.03-4.35-3.77-4.48-3.95-.13-.18-1.07-1.42-1.07-2.71 0-1.29.68-1.92.92-2.19.24-.26.53-.33.71-.33.18 0 .35 0 .5.01.16.01.38-.06.59.45.24.58.82 2 .89 2.14.07.14.12.31.02.49-.09.18-.14.29-.27.45-.13.16-.28.35-.4.47-.13.13-.27.28-.12.54.15.26.66 1.09 1.42 1.76.97.87 1.79 1.14 2.05 1.27.26.13.41.11.56-.07.15-.18.65-.76.82-1.02.17-.26.35-.22.59-.13.24.09 1.52.72 1.78.85.26.13.43.19.5.3.07.11.07.64-.17 1.32z" />
			</svg>
		</span>
		<span class="who">Dev team</span>
	</div>

	<div class="thread">
		<div class="bubble">here's the prod <code>.env</code> you asked for 👇</div>
		<div class="bubble bubble--link">
			<span class="url">ashdrop.app/s/9f2a…</span>
			<span class="lock" title="encrypted">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<rect x="4" y="10" width="16" height="10" rx="1.5" />
					<path d="M8 10V7a4 4 0 0 1 8 0v3" />
				</svg>
			</span>
		</div>
	</div>

	<div class="scan">
		<span class="scan-dot"></span>
		What WhatsApp sees: an opaque link — no secret, no key.
	</div>
</div>

<style>
	.chat {
		max-width: 24rem;
		margin: 0 auto;
		border: 1px solid var(--color-line);
		background: var(--color-bg);
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.chat-head {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--color-line);
		background: var(--color-surf);
	}
	.wa {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.6rem;
		height: 1.6rem;
		color: #25d366;
	}
	.wa svg { width: 1.6rem; height: 1.6rem; }
	.who {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 0.9rem;
		color: var(--color-ink);
	}

	.thread {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.5rem;
		padding: 1.1rem 1rem;
	}
	.bubble {
		max-width: 85%;
		padding: 0.55rem 0.8rem;
		border-radius: 0.9rem 0.9rem 0.2rem 0.9rem;
		background: color-mix(in oklab, var(--color-rust) 12%, var(--color-surf));
		font-size: 0.85rem;
		line-height: 1.5;
		color: var(--color-ink);
	}
	.bubble code {
		font-family: var(--font-mono);
		font-size: 0.85em;
	}
	.bubble--link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-mono);
	}
	.url {
		font-size: 0.8rem;
		color: var(--color-rust);
		text-decoration: underline;
		text-underline-offset: 2px;
	}
	.lock {
		display: inline-flex;
		flex-shrink: 0;
		color: var(--color-muted);
	}
	.lock svg { width: 0.95rem; height: 0.95rem; }

	.scan {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.7rem 1rem;
		border-top: 1px solid var(--color-line);
		background: var(--color-surf);
		font-family: var(--font-mono);
		font-size: 0.68rem;
		color: var(--color-muted);
		line-height: 1.4;
	}
	.scan-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--color-rust);
		flex-shrink: 0;
	}
</style>
