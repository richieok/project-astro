import { Clock } from 'three';

export function createLoop({ renderer, scene, camera, controls }) {
	const clock = new Clock();
	const updatables = [];
	const overlays = [];
	let frameId;

	function tick() {
		frameId = requestAnimationFrame(tick);
		const delta = clock.getDelta();
		for (const updatable of updatables) {
			updatable.update(delta);
		}
		controls.update();
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
