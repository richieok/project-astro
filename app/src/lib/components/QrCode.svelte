<script>
	import qrcode from 'qrcode-generator';

	// `margin` is the quiet zone, measured in modules. The spec asks for 4, and
	// scanners get unreliable below that, so it's the default.
	let { text, margin = 4 } = $props();

	const qr = $derived.by(() => {
		const code = qrcode(0, 'M'); // 0 = smallest type number that fits `text`
		code.addData(text);
		code.make();
		return code;
	});

	const count = $derived(qr.getModuleCount());
	const size = $derived(count + margin * 2);

	// One path of 1x1 squares rather than a <rect> per module: a URL this long
	// lights up ~700 modules, and that many elements is a lot of DOM for a
	// picture that never changes once drawn.
	const path = $derived.by(() => {
		let d = '';
		for (let row = 0; row < count; row++) {
			for (let col = 0; col < count; col++) {
				if (qr.isDark(row, col)) d += `M${col + margin} ${row + margin}h1v1h-1z`;
			}
		}
		return d;
	});
</script>

<svg viewBox="0 0 {size} {size}" role="img" aria-label="QR code for {text}">
	<rect width={size} height={size} fill="#fff" />
	<path d={path} fill="#000" />
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: auto;
		border-radius: 0.25rem;
		/* Keep module edges hard instead of letting them blur at odd scales. */
		shape-rendering: crispEdges;
	}
</style>
