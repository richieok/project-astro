import { existsSync } from 'node:fs';
import { networkInterfaces } from 'node:os';
import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// The control-panel QR code has to encode an address a phone can dial, and the
// browser only ever knows the hostname that was typed into the address bar.
// Resolve it here instead, on the machine that can actually see its interfaces.
function resolveControlHost() {
	// Set by dev.sh, which runs on the host and passes it in through compose.
	if (process.env.CONTROL_HOST) return process.env.CONTROL_HOST;

	// In a container the only interface we can see is Docker's bridge, which is
	// useless to a phone — and since the bridge pool is 172.16/12, a real LAN
	// address can look exactly like one. Better to return nothing than a guess.
	if (existsSync('/.dockerenv')) return '';

	for (const addresses of Object.values(networkInterfaces())) {
		for (const address of addresses ?? []) {
			if (address.family === 'IPv4' && !address.internal) return address.address;
		}
	}
	return '';
}

// Vite picks up VITE_-prefixed vars off process.env, so this reaches the client
// as import.meta.env.VITE_CONTROL_HOST without a .env file in the mix.
process.env.VITE_CONTROL_HOST = resolveControlHost();

export default defineConfig({
	assetsInclude: ['**/*.glb'],
	resolve: {
		alias: {
			jsm: 'three/examples/jsm'
		}
	},
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			adapter: adapter()
		})
	]
});
