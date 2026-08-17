import { Vector3 } from 'three';

// Speed for a circular orbit at distance r around a body with
// gravitational parameter mu (v² = μ/r).
export function circularOrbitSpeed(mu, r) {
	return Math.sqrt(mu / r);
}

export function createGravityOrbit(
	body,
	{ center, mu = 10, initialVelocity, collisionRadius = 0, onCollision }
) {
	const initialPosition = body.position.clone();
	const launchVelocity = initialVelocity.clone();
	const velocity = launchVelocity.clone();
	const acceleration = new Vector3();
	let enabled = true;

	function collided() {
		return collisionRadius > 0 && body.position.distanceTo(center.position) <= collisionRadius;
	}

	function reset() {
		body.position.copy(initialPosition);
		velocity.copy(launchVelocity);
	}

	return {
		velocity,
		update(delta) {
			if (!enabled) return;
			// a = μ·r̂/r², integrated with semi-implicit Euler
			acceleration.copy(center.position).sub(body.position);
			const r = acceleration.length();
			acceleration.multiplyScalar(mu / (r * r * r));
			velocity.addScaledVector(acceleration, delta);
			body.position.addScaledVector(velocity, delta);
			if (collided()) {
				enabled = false;
				onCollision?.();
			}
		},
		setEnabled(value) {
			// Restarting after a crash relaunches from the initial state,
			// otherwise the collision would re-trigger immediately.
			if (value && collided()) reset();
			enabled = value;
		},
		setLaunchSpeed(speed) {
			launchVelocity.setLength(speed);
		},
		reset
	};
}
