import { BufferAttribute, BufferGeometry, DynamicDrawUsage, Line, LineBasicMaterial, Vector3 } from 'three';

const MIN_SEGMENT = 0.02;

export function createOrbitTrail(body, { color = 0x88bbff, opacity = 0.35, maxPoints = 2000 } = {}) {
	const positions = new Float32Array(maxPoints * 3);
	const attribute = new BufferAttribute(positions, 3);
	attribute.setUsage(DynamicDrawUsage);

	const geometry = new BufferGeometry();
	geometry.setAttribute('position', attribute);
	geometry.setDrawRange(0, 0);

	const material = new LineBasicMaterial({
		color,
		transparent: true,
		opacity,
		depthWrite: false
	});

	const line = new Line(geometry, material);
	line.name = 'Orbit Trail';
	line.frustumCulled = false;

	const lastPoint = new Vector3(Infinity, Infinity, Infinity);
	let count = 0;

	return {
		line,
		update() {
			if (body.position.distanceToSquared(lastPoint) < MIN_SEGMENT * MIN_SEGMENT) return;
			if (count === maxPoints) {
				positions.copyWithin(0, 3);
				count--;
			}
			body.position.toArray(positions, count * 3);
			lastPoint.copy(body.position);
			count++;
			attribute.needsUpdate = true;
			geometry.setDrawRange(0, count);
		},
		clear() {
			count = 0;
			lastPoint.set(Infinity, Infinity, Infinity);
			geometry.setDrawRange(0, 0);
		},
		setVisible(visible) {
			line.visible = visible;
		},
		dispose() {
			geometry.dispose();
			material.dispose();
			line.removeFromParent();
		}
	};
}
