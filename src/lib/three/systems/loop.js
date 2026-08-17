import { Clock } from 'three';

export function createLoop({ renderer, scene, camera, controls }) {
	const clock = new Clock();
	const updatables = [];
	let frameId;

	function tick() {
		frameId = requestAnimationFrame(tick);
		const delta = clock.getDelta();
		for (const updatable of updatables) {
			updatable.update(delta);
		}
		controls.update();
		renderer.render(scene, camera);
	}

	return {
		updatables,
		start: tick,
		stop() {
			cancelAnimationFrame(frameId);
		}
	};
}
