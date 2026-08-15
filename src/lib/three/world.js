import arrowUrl from '$lib/assets/arrow.glb';
import { createScene } from './scene.js';
import { createCamera } from './camera.js';
import { createRenderer } from './renderer.js';
import { createControls } from './controls.js';
import { createHemisphereLight } from './lights.js';
import { createIcosahedron } from './objects/icosahedron.js';
import { loadGLTF } from './loaders/gltf.js';
import { createStandardMaterial } from './materials.js';
import { applyMaterial } from './utils/applyMaterial.js';

export function createWorld(container) {
	const width = container.clientWidth;
	const height = container.clientHeight;

	const scene = createScene();
	const camera = createCamera({ width, height });

	const renderer = createRenderer({ width, height });
	container.appendChild(renderer.domElement);

	const controls = createControls(camera, renderer.domElement);

	const mesh = createIcosahedron();
	scene.add(mesh);

	const light = createHemisphereLight();
	scene.add(light);

	loadGLTF(arrowUrl).then((gltf) => {
		gltf.scene.position.x += 1.5;
		gltf.scene.scale.divideScalar(10);
		applyMaterial(gltf.scene, createStandardMaterial({ color: 0x0000ff }));
		scene.add(gltf.scene);
	});

	let frameId;
	function animate() {
		frameId = requestAnimationFrame(animate);
		mesh.rotation.x += 0.01;
		controls.update();
		renderer.render(scene, camera);
	}
	animate();

	function onResize() {
		const w = container.clientWidth;
		const h = container.clientHeight;
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		renderer.setSize(w, h);
	}
	const resizeObserver = new ResizeObserver(onResize);
	resizeObserver.observe(container);

	function dispose() {
		cancelAnimationFrame(frameId);
		resizeObserver.disconnect();
		controls.dispose();
		renderer.dispose();
		renderer.domElement.remove();
	}

	return { scene, camera, renderer, controls, mesh, dispose };
}
