/**
 * Adds the `in` class to the node once it scrolls into view (one-shot).
 * Pair with a CSS transition on the element for a scroll-reveal effect.
 * Respects prefers-reduced-motion by revealing immediately.
 */
export function reveal(node: HTMLElement, threshold = 0.2) {
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		node.classList.add('in');
		return {};
	}

	const io = new IntersectionObserver(
		(entries) => {
			for (const e of entries) {
				if (e.isIntersecting) {
					node.classList.add('in');
					io.disconnect();
				}
			}
		},
		{ threshold }
	);
	io.observe(node);

	return {
		destroy() {
			io.disconnect();
		}
	};
}
