import { defineConfig } from "astro/config";

export default defineConfig({
	site: "https://www.johndunning.com",
	base: "/",
	compressHTML: false,
	markdown: {
		remarkPlugins: [
			"remark-heading-id",
			"remark-deflist",
		],
		shikiConfig: {
			experimentalThemes: {
				light: "github-light",
				dark: "github-dark",
			},
			langs: [
				"js"
			]
		}
	},
	vite: {
		server: {
			watch: {
				ignored: [
					"**/.idea/**",
					"**/To do.md"
				]
			},
			allowedHosts: [
					// allow a Cloudflare tunnel to access the dev server
				".trycloudflare.com"
			],
		},
		preview: {
			allowedHosts: [
					// allow a Cloudflare tunnel to access the preview server
				".trycloudflare.com"
			]
		}
	}
});
