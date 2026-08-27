import { OrbitControls } from 'jsm/controls/OrbitControls.js';

export function createControls(camera, domElement) {
	const controls = new OrbitControls(camera, domElement);
	controls.enableDamping = true;
	controls.dampingFactor = 0.25;
	return controls;
}
