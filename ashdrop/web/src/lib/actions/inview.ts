/* Scroll-reveal action (the skiper31 effect, rebuilt with IntersectionObserver).
   Adds `data-inview="true"` when the element enters the viewport once. */
export function inview(node: HTMLElement, opts: { threshold?: number } = {}) {
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduce) {
		node.setAttribute('data-inview', 'true');
		return;
	}
	node.setAttribute('data-inview', 'false');
	const io = new IntersectionObserver(
		(entries) => {
			for (const e of entries) {
				if (e.isIntersecting) {
					node.setAttribute('data-inview', 'true');
					io.unobserve(node);
				}
			}
		},
		{ threshold: opts.threshold ?? 0.25 }
	);
	io.observe(node);
	return {
		destroy() {
			io.disconnect();
		}
	};
}
