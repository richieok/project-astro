export function applyMaterial(object, material) {
	object.traverse((child) => {
		if (child.isMesh) {
			child.material = material;
		}
	});
}
