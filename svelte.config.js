// import adapter from '@sveltejs/adapter-auto'
// import adapterStatic from '@sveltejs/adapter-static'
import adapter from '@sveltejs/adapter-vercel'
import { vitePreprocess } from '@sveltejs/kit/vite'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.

		// adapter: adapter({
		// 	pages: "build",
		// 	assets: "build",
		// 	fallback: "index.html",
		// 	precompress: true,
		// 	strict: true
		// })
		adapter: adapter({
			// pages: './.firebase/public',
			// assets: './.firebase/public',
			precompress: false,
			fallback: 'index.html',
		}),
		alias: {
			$components: './src/components',
			$game: './src/game',
			$lib: './src/lib',
			$routes: './src/routes',
			$src: './src',
			$stores: './src/stores',
		},
	},
}

export default config
