import { Vector3 } from 'three';
import arrowUrl from '$lib/assets/arrow.glb';
import { createScene } from './scene.js';
import { createCamera } from './camera.js';
import { createRenderer } from './renderer.js';
import { createControls } from './controls.js';
import { createHemisphereLight, createAmbientLight } from './lights.js';
import { createIcosahedron } from './objects/icosahedron.js';
import { loadGLTF } from './loaders/gltf.js';
import { createStandardMaterial } from './materials.js';
import { applyMaterial } from './utils/applyMaterial.js';
import { createLoop } from './systems/loop.js';
import { createAxesGizmo } from './helpers/axesGizmo.js';
import { createVelocityArrows } from './helpers/velocityArrows.js';
import { createGravityOrbit, circularOrbitSpeed } from './physics/gravity.js';

const VIEW_DIRECTIONS = {
	front: new Vector3(0, 0, 1),
	right: new Vector3(1, 0, 0),
	top: new Vector3(0, 1, 0)
};

export function createWorld(container) {
	const width = container.clientWidth;
	const height = container.clientHeight;

	const scene = createScene();
	const camera = createCamera({ width, height });
	camera.position.z = 6

	const renderer = createRenderer({ width, height });
	container.appendChild(renderer.domElement);

	const controls = createControls(camera, renderer.domElement);

	const mesh = createIcosahedron();
	const wireframe = mesh.children[0];
	scene.add(mesh);

	const hemisphereLight = createHemisphereLight();
	hemisphereLight.visible = false;
	scene.add(hemisphereLight);

	const ambientLight = createAmbientLight();
	scene.add(ambientLight);

	const loop = createLoop({ renderer, scene, camera, controls });

	const axesGizmo = createAxesGizmo(camera, controls);
	loop.overlays.push(axesGizmo);

	let autoRotate = false;
	loop.updatables.push({
		update(delta) {
			if (autoRotate) {
				mesh.rotation.x += 0.6 * delta;
			}
		}
	});

	const mu = 10;
	const orbitRadius = 1.5;
	const baseSpeed = circularOrbitSpeed(mu, orbitRadius);
	let orbit;
	let velocityArrows;
	let orbitEnabled = true;
	let orbitSpeedFactor = 1;
	let onOrbitStopCallback;
	let onSceneChangeCallback;
	loadGLTF(arrowUrl).then((gltf) => {
		const arrow = gltf.scene;
		arrow.position.x += orbitRadius;
		arrow.scale.divideScalar(10);
		applyMaterial(arrow, createStandardMaterial({ color: 0x0000ff }));
		scene.add(arrow);

		orbit = createGravityOrbit(arrow, {
			center: mesh,
			mu,
			initialVelocity: new Vector3(0, 0, -baseSpeed * orbitSpeedFactor),
			collisionRadius: mesh.geometry.parameters.radius,
			onCollision() {
				orbitEnabled = false;
				onOrbitStopCallback?.();
			}
		});
		orbit.setEnabled(orbitEnabled);
		loop.updatables.push(orbit);

		velocityArrows = createVelocityArrows(arrow, orbit.velocity);
		scene.add(velocityArrows.group);
		loop.updatables.push(velocityArrows);

		onSceneChangeCallback?.();
	});

	loop.start();

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
		loop.stop();
		resizeObserver.disconnect();
		axesGizmo.dispose();
		velocityArrows?.dispose();
		controls.dispose();
		renderer.dispose();
		renderer.domElement.remove();
	}

	return {
		scene,
		camera,
		renderer,
		controls,
		mesh,
		dispose,
		setView(name) {
			const direction = VIEW_DIRECTIONS[name];
			if (!direction) return;
			const distance = camera.position.distanceTo(controls.target);
			camera.position.copy(controls.target).addScaledVector(direction, distance);
			camera.lookAt(controls.target);
		},
		setWireframeVisible(visible) {
			wireframe.visible = visible;
		},
		setAutoRotate(value) {
			autoRotate = value;
		},
		setOrbitEnabled(value) {
			orbitEnabled = value;
			orbit?.setEnabled(value);
		},
		resetOrbit() {
			orbit?.reset();
		},
		setOrbitSpeedFactor(value) {
			orbitSpeedFactor = value;
			orbit?.setLaunchSpeed(baseSpeed * value);
			orbit?.reset();
		},
		onOrbitStop(callback) {
			onOrbitStopCallback = callback;
		},
		onSceneChange(callback) {
			onSceneChangeCallback = callback;
		},
		setAmbientLightVisible(visible) {
			ambientLight.visible = visible;
		},
		setHemisphereLightVisible(visible) {
			hemisphereLight.visible = visible;
		},
		setAmbientIntensity(value) {
			ambientLight.intensity = value;
		}
	};
}
