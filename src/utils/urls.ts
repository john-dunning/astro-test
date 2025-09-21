export const base = (url: string) => url.startsWith("/")
	? (import.meta.env.BASE_URL + url).replace("//", "/")
	: url;
