import fs from "fs-extra";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";
import { dump } from "js-yaml";
import glob from "fast-glob";

const HashPattern = /^#/gm;
const IncPathMXI = "http://johndunning.com/fireworks/inc";
const IncPathLocal = "../../assets/inc";
const CommandsPath = "src/content/commands";

function slugVersion(
	mxiPath)
{
	const [name, version] = path.basename(mxiPath, ".mxi").split("-");

	return [name, parseInt(version)];
}

function frontmatter(
	data)
{
		// the dumped data includes a final newline, so put the closing --- right after it
	return `---
${dump(data)}---

`;
}

const parser = new XMLParser({
	attributesGroupName: "@",
	attributeNamePrefix: "",
	ignoreAttributes: false,
	allowBooleanAttributes: true,
	trimValues: true,
});
const mxiFiles = glob.sync("src/dl/*.mxi");
const pathsByName = mxiFiles.reduce((result, mxiPath) => {
	const [slug, version] = slugVersion(mxiPath);
	const currentPath = result[slug];

	if (!currentPath) {
		result[slug] = mxiPath;
	} else {
		const [, currentVersion] = slugVersion(currentPath);

		if (version > currentVersion) {
			result[slug] = mxiPath;
		}
	}

	return result;
}, {});

Object.entries(pathsByName).forEach(([slug, mxiPath]) => {
	const xml = fs.readFileSync(mxiPath, "utf8");
	const mxi = parser.parse(xml);
	const { "macromedia-extension": extension } = mxi;
	const {
		"@": metadata,
		files,
		summary,
		description,
	} = extension;
		// if there's only one file element in the <files> tag, it won't be an array,
		// so convert if necessary.  and older .mxi files may have just a name
		// attribute, not a source.
	const filePaths = [].concat(files.file).map((file) => file["@"].source || file["@"].name);
	const mdPath = path.join(CommandsPath, slug + ".md");
		// if there are no other attributes on the <description> tag, it doesn't
		// seem to get a #text attribute
	const md = (description["#text"] || description)
			// remove the colon in the Release history header to match the other titles
		.replaceAll("# Release history:", "# Release history")
		.replace(HashPattern, "##")
		.replaceAll("<br>", "")
		.replaceAll(IncPathMXI, IncPathLocal);

		// none of the dates was in a proper ISO format, so create a `timestamp` value
		// from them, and then create a `date` string from beginning of that ISO.  we
		// add the metadata values before creating keyValues to control the order of
		// the keys in the frontmatter.
	metadata.timestamp = new Date(metadata.date).toISOString();
	metadata.date = metadata.timestamp.split("T")[0];
	metadata["requires-restart"] = metadata["requires-restart"] === "true";

	const keyValues = {
		slug,
		fileVersion: path.basename(mxiPath, ".mxi"),
		...metadata,
		summary,
		files: filePaths
	};

	fs.ensureDirSync(path.dirname(mdPath));
	fs.writeFileSync(mdPath, frontmatter(keyValues) + md, "utf8");
});

console.log(`Converted ${Object.keys(pathsByName).length} .mxi files to .md`);
