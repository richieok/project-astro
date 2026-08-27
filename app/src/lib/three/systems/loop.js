import { Clock } from 'three';

// Longest time step the simulation will ever integrate in one frame.
// rAF can stall for seconds without any event firing (window obscured by
// another app, tab switch, breakpoints), so the delta must be clamped
// rather than trusting visibilitychange.
const MAX_DELTA = 1 / 30;

export function createLoop({ renderer, scene, camera, controls, pending }) {
	const clock = new Clock();
	const updatables = [];
	const overlays = [];
	let frameId;

	function applyPendingControl() {
		if (pending.rotateX || pending.rotateY) {
			controls.rotateLeft(pending.rotateX * 0.005);
			controls.rotateUp(pending.rotateY * 0.005);
			pending.rotateX = 0;
			pending.rotateY = 0;
		}
		if (pending.zoomScale !== 1) {
			camera.zoom = Math.min(Math.max(camera.zoom * pending.zoomScale, 0.1), 10);
			camera.updateProjectionMatrix();
			pending.zoomScale = 1;
		}
		controls.update();
	}

	function tick() {
		frameId = requestAnimationFrame(tick);
		const delta = Math.min(clock.getDelta(), MAX_DELTA);
		for (const updatable of updatables) {
			updatable.update(delta);
		}
		applyPendingControl()
		renderer.render(scene, camera);
		for (const overlay of overlays) {
			overlay.render(renderer);
		}
	}

	return {
		updatables,
		overlays,
		start: tick,
		stop() {
			cancelAnimationFrame(frameId);
		}
	};
}
