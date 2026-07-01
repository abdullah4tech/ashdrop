<script lang="ts">
	/* Native Svelte port of magicui's AnimatedBeam — draws a curved SVG path
	   between two elements inside a shared container, with a gradient band
	   travelling along it (SMIL, no JS raf loop). No framer-motion. */

	let {
		container,
		from,
		to,
		curvature = 0,
		reverse = false,
		duration = 4,
		delay = 0,
		pathColor = 'var(--color-line)',
		pathWidth = 2,
		pathOpacity = 1,
		beamColor = 'var(--color-rust)',
		startXOffset = 0,
		startYOffset = 0,
		endXOffset = 0,
		endYOffset = 0
	}: {
		container?: HTMLElement;
		from?: HTMLElement;
		to?: HTMLElement;
		curvature?: number;
		reverse?: boolean;
		duration?: number;
		delay?: number;
		pathColor?: string;
		pathWidth?: number;
		pathOpacity?: number;
		beamColor?: string;
		startXOffset?: number;
		startYOffset?: number;
		endXOffset?: number;
		endYOffset?: number;
	} = $props();

	const id = `beam-${beamId++}`;
	const reduce =
		typeof window !== 'undefined' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	let d = $state('');
	let w = $state(0);
	let h = $state(0);

	// forward: band sweeps left→right; reverse: right→left
	const grad = $derived(
		reverse ? { x1: '90%;-10%', x2: '100%;0%' } : { x1: '10%;110%', x2: '0%;100%' }
	);

	function measure() {
		if (!container || !from || !to) return;
		const c = container.getBoundingClientRect();
		const a = from.getBoundingClientRect();
		const b = to.getBoundingClientRect();
		w = c.width;
		h = c.height;
		const sx = a.left - c.left + a.width / 2 + startXOffset;
		const sy = a.top - c.top + a.height / 2 + startYOffset;
		const ex = b.left - c.left + b.width / 2 + endXOffset;
		const ey = b.top - c.top + b.height / 2 + endYOffset;
		const cy = (sy + ey) / 2 - curvature;
		d = `M ${sx},${sy} Q ${(sx + ex) / 2},${cy} ${ex},${ey}`;
	}

	$effect(() => {
		if (!container || !from || !to) return;
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(container);
		return () => ro.disconnect();
	});
</script>

{#if d}
	<svg
		class="beam"
		width={w}
		height={h}
		viewBox="0 0 {w} {h}"
		fill="none"
		aria-hidden="true"
	>
		<path {d} stroke={pathColor} stroke-width={pathWidth} stroke-opacity={pathOpacity} stroke-linecap="round" />
		{#if !reduce}
			<path {d} stroke="url(#{id})" stroke-width={pathWidth} stroke-linecap="round" />
			<defs>
				<linearGradient
					id={id}
					gradientUnits="objectBoundingBox"
					x1={grad.x1.split(';')[0]}
					x2={grad.x2.split(';')[0]}
					y1="0%"
					y2="0%"
				>
					<animate attributeName="x1" values={grad.x1} dur="{duration}s" begin="{delay}s" repeatCount="indefinite" />
					<animate attributeName="x2" values={grad.x2} dur="{duration}s" begin="{delay}s" repeatCount="indefinite" />
					<stop stop-color={beamColor} stop-opacity="0" />
					<stop stop-color={beamColor} />
					<stop offset="32.5%" stop-color={beamColor} />
					<stop offset="100%" stop-color={beamColor} stop-opacity="0" />
				</linearGradient>
			</defs>
		{/if}
	</svg>
{/if}

<script lang="ts" module>
	let beamId = 0;
</script>

<style>
	.beam {
		position: absolute;
		inset: 0;
		pointer-events: none;
		transform-origin: center;
	}
</style>
