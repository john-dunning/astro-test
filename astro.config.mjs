import { defineConfig } from "astro/config";

export default defineConfig({
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
			}
		}
	}
});
