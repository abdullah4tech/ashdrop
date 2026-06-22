<script lang="ts">
	/* The Ashdrop mark — a droplet dissolving into ash. Inherits currentColor,
	   so set color where used. `specks` off gives a clean drop for tiny inline
	   wordmark use; on gives the full dissolving version. */
	let {
		size = '1em',
		specks = true,
		class: cls = ''
	}: { size?: string; specks?: boolean; class?: string } = $props();
</script>

<svg
	class={cls}
	width={size}
	height={size}
	viewBox="0 0 32 32"
	fill="none"
	aria-hidden="true"
	style="display:inline-block;vertical-align:middle"
>
	<path
		d="M16 3 C 16 3 23.5 12 23.5 16 a 7.5 7.5 0 0 1 -15 0 C 8.5 12 16 3 16 3 Z"
		fill="currentColor"
	/>
	{#if specks}
		<circle cx="11" cy="26.4" r="1.5" fill="currentColor" opacity="0.8" />
		<circle cx="16.2" cy="28.4" r="1.7" fill="currentColor" opacity="0.6" />
		<circle cx="21" cy="26.4" r="1.4" fill="currentColor" opacity="0.8" />
		<circle cx="16" cy="31" r="0.85" fill="currentColor" opacity="0.35" />
	{/if}
</svg>
