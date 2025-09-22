import { getCollection, type CollectionEntry } from "astro:content";

type CommandEntry = CollectionEntry<"commands">;
type Sorter = (a: CommandEntry, b: CommandEntry) => number;

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
} satisfies Record<string, Sorter>;

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
