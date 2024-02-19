import type { ImageMetadata } from "astro";

	// this Vite import method requires that its parameter be a literal string,
	// not even one assembled from other literals
const images = import.meta.glob<{ default: ImageMetadata }>("/src/assets/inc/*.{jpeg,jpg,png,gif}");

export async function getIncImage(
	filename: string = ""): Promise<ImageMetadata | null>
{
	if (filename) {
		const imagePath = "/src/assets/inc/" + filename;

		if (images[imagePath]) {
			return (await images[imagePath]()).default;
		}
	}

	return null;
}
