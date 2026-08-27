import * as THREE from 'three';

export function createHemisphereLight(skyColor = 0xffff00, groundColor = 0x00fff0, intensity = 1) {
	return new THREE.HemisphereLight(skyColor, groundColor, intensity);
}

export function createAmbientLight(color = 0xffffff, intensity = 1) {
	return new THREE.AmbientLight(color, intensity);
}
