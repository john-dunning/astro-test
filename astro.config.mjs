import { defineConfig } from "astro/config";

export default defineConfig({
	markdown: {
		remarkPlugins: [
			"remark-heading-id",
			"remark-deflist",
		],
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
