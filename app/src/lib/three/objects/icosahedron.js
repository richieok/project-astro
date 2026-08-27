import * as THREE from 'three';

export function createIcosahedron({ radius = 1, detail = 1, color = 0xffffff } = {}) {
	const geometry = new THREE.IcosahedronGeometry(radius, detail);

	const material = new THREE.MeshStandardMaterial({ color, flatShading: true });
	const mesh = new THREE.Mesh(geometry, material);

	const wireframeMaterial = new THREE.MeshBasicMaterial({ color, wireframe: true });
	const wireframe = new THREE.Mesh(geometry, wireframeMaterial);
	wireframe.scale.setScalar(1.001);
	mesh.add(wireframe);

	return mesh;
}
