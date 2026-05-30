import adapter from '@sveltejs/adapter-static';

export default {
	kit: {
		adapter: adapter({
			fallback: 'index.html'
		}),

		paths: {
			base: '/forest-shuffle' // nécessaire pour que ça fonctionne sur GitHub Pages, à la racine du repo
		}
	}
};