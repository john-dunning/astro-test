import { getCollection } from "astro:content";

const SortFunctions = {
	alphabetical(a, b)
	{
		return Intl.Collator().compare(a.data.name, b.data.name);
	},

	dateDescending(a, b)
	{
		const { data: { date: dateA } } = a;
		const { data: { date: dateB } } = b;

		return dateA > dateB
			? -1
			: dateB < dateA
				? 1
				: 0;
	},
} as const;

export async function getCommands(
	sort: keyof typeof SortFunctions = "alphabetical")
{
	const commands = await getCollection("commands");
	const sorter = SortFunctions[sort];

	if (!sorter) {
		throw new Error(`Invalid sort: ${sort}`);
	}

	return commands.sort(sorter);
}
