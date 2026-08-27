import * as THREE from 'three';

export function createStandardMaterial({ color = 0xffffff } = {}) {
	return new THREE.MeshStandardMaterial({ color });
}
