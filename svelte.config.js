import adapter from '@sveltejs/adapter-auto';
import child_process from 'child_process';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
		version: {
			name: child_process
				.execSync('git rev-parse HEAD')
				.toString().trim(),
			pollInterval: 10000,
		}
	}
};

export default config;
