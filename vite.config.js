import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
	plugins: [sveltekit(), nodePolyfills({
		include: ["os"],
		overrides: {
			os: 'empty-polyfill.js'
		}
	})],
});
