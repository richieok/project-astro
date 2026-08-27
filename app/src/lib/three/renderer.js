import * as THREE from 'three';

export function createRenderer({ width, height, antialias = true } = {}) {
	const renderer = new THREE.WebGLRenderer({ antialias });
	renderer.setSize(width, height);
	return renderer;
}
