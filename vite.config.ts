import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	resolve: {
		alias: {
			'mapbox-gl': 'maplibre-gl'
		}
	},
	server: {
		port: 5174,
		host: true,
		allowedHosts: true
	},
	test: {
		include: ['src/**/*.test.ts'],
		exclude: ['src/tests/e2e/**'],
		environment: 'jsdom'
	}
});
