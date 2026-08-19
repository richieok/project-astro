import { ArrowHelper, Group, Vector3 } from 'three';

const AXES = [
	{ component: 'x', direction: new Vector3(1, 0, 0), color: 0xff4444 },
	{ component: 'y', direction: new Vector3(0, 1, 0), color: 0x44cc44 },
	{ component: 'z', direction: new Vector3(0, 0, 1), color: 0x4488ff }
];

const MIN_LENGTH = 0.01;

export function createVelocityArrows(body, velocity, { scale = 0.25 } = {}) {
	const group = new Group();
	group.name = 'Velocity Vector';
	const flipped = new Vector3();

	const arrows = AXES.map(({ direction, color }) => {
		const arrow = new ArrowHelper(direction, new Vector3(), 1, color);
		group.add(arrow);
		return arrow;
	});

	return {
		group,
		update() {
			group.position.copy(body.position);
			for (let i = 0; i < AXES.length; i++) {
				const { component, direction } = AXES[i];
				const value = velocity[component];
				const length = Math.abs(value) * scale;
				const arrow = arrows[i];
				arrow.visible = length > MIN_LENGTH;
				if (!arrow.visible) continue;
				arrow.setDirection(
					value >= 0 ? direction : flipped.copy(direction).negate()
				);
				arrow.setLength(length, Math.min(0.2 * length, 0.12), 0.06);
			}
		},
		setVisible(visible) {
			group.visible = visible;
		},
		dispose() {
			for (const arrow of arrows) {
				arrow.dispose();
			}
			group.removeFromParent();
		}
	};
}
