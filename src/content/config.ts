import { z, defineCollection } from "astro:content";

const commands = defineCollection({
	type: "content", // v2.5.0 and later
	schema: z.object({
		fileVersion: z.string(),
		name: z.string(),
		version: z.string(),
		id: z.string().optional(),
		type: z.string(),
		date: z.string(),
		timestamp: z.string(),
		summary: z.string(),
		files: z.array(z.string()),
	}),
});

export const collections = {
	commands
};
