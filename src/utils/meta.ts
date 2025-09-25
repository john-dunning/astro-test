type Attributes = Record<string, string | number | URL>;

const DoubleQuotePattern = /"/g;

function tag(
	name: string,
	attrs: Attributes = {})
{
	return `<${name} ${
		Object.entries(attrs)
			.map(([key, value]) => `${key}="${String(value).replace(DoubleQuotePattern, "'")}"`)
			.join(" ")
	} />`;
}

export function metaTag(
	key: string,
	value: string | number | URL)
{
	return tag("meta", {
		name: key,
		content: value
	});
}

export function ogMetaTag(
	key: string,
	value: string | number | URL)
{
	return tag("meta", {
		property: "og:" + key,
		content: value
	});
}

export function twitterMetaTag(
	key: string,
	value: string | number | URL)
{
	return tag("meta", {
		property: "twitter:" + key,
		content: value
	});
}
