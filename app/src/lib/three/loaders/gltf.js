import { GLTFLoader } from 'jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

export function loadGLTF(url) {
	return new Promise((resolve, reject) => {
		loader.load(url, resolve, undefined, reject);
	});
}
