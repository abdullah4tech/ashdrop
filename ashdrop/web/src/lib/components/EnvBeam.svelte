<script lang="ts">
	/* The "how it works" beam: your app's env files flow through Ashdrop and
	   arrive, encrypted, at the recipient. frontend/backend → ashdrop → user. */
	import AnimatedBeam from './AnimatedBeam.svelte';
	import Mark from './Mark.svelte';

	let container = $state<HTMLElement>();
	let frontend = $state<HTMLElement>();
	let backend = $state<HTMLElement>();
	let ashdrop = $state<HTMLElement>();
	let user = $state<HTMLElement>();
</script>

<div class="beam-wrap" bind:this={container}>
	<div class="col col--src">
		<div class="node-group">
			<div class="node" bind:this={frontend}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
					<rect x="4" y="3" width="16" height="18" rx="1.5" />
					<path d="M8 8h5M8 12h8M8 16h6" />
				</svg>
			</div>
			<span class="cap">frontend .env</span>
		</div>
		<div class="node-group">
			<div class="node" bind:this={backend}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
					<rect x="3" y="4" width="18" height="7" rx="1.5" />
					<rect x="3" y="13" width="18" height="7" rx="1.5" />
					<path d="M7 7.5h.01M7 16.5h.01" />
				</svg>
			</div>
			<span class="cap">backend .env</span>
		</div>
	</div>

	<div class="col col--mid">
		<div class="node-group">
			<div class="node node--hub" bind:this={ashdrop}>
				<Mark size="1.9rem" />
			</div>
			<span class="cap">ashdrop</span>
		</div>
	</div>

	<div class="col col--dst">
		<div class="node-group">
			<div class="node" bind:this={user}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
					<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
					<circle cx="12" cy="7" r="4" />
				</svg>
			</div>
			<span class="cap">recipient</span>
		</div>
	</div>

	<AnimatedBeam {container} from={frontend} to={ashdrop} duration={3.5} />
	<AnimatedBeam {container} from={backend} to={ashdrop} duration={3.5} delay={0.5} />
	<AnimatedBeam {container} from={ashdrop} to={user} duration={3} delay={1} />
</div>

<style>
	.beam-wrap {
		position: relative;
		display: flex;
		align-items: stretch;
		justify-content: space-between;
		gap: 1rem;
		width: 100%;
		max-width: 48rem;
		height: 22rem;
		margin: 0 auto;
		padding: 1.5rem clamp(0.5rem, 4vw, 2.5rem);
	}
	.col {
		display: flex;
		flex-direction: column;
		justify-content: center;
		z-index: 1;
	}
	.col--src { gap: 5rem; }

	.node-group {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}
	.node {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3.6rem;
		height: 3.6rem;
		border: 1px solid var(--color-line);
		border-radius: 50%;
		background: var(--color-surf);
		color: var(--color-ink);
	}
	.node svg { width: 1.7rem; height: 1.7rem; }
	.node--hub {
		width: 4.8rem;
		height: 4.8rem;
		border-color: color-mix(in oklab, var(--color-rust) 40%, var(--color-line));
		color: var(--color-rust);
	}
	.cap {
		font-family: var(--font-mono);
		font-size: 0.66rem;
		letter-spacing: 0.02em;
		color: var(--color-muted);
		white-space: nowrap;
	}
</style>
