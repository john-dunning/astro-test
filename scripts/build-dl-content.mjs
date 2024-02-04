import fs from "fs-extra";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";
import { dump } from "js-yaml";
import glob from "fast-glob";

const IncPathMXI = "http://johndunning.com/fireworks/inc";
const IncPathLocal = "/src/assets/inc";
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
		description: {
			"#text": description
		},
	} = extension;
	const filePaths = files.file.map((file) => file["@"].source);
	const mdPath = path.join(CommandsPath, slug + ".md");
	const md = description.replaceAll("<br>", "").replaceAll(IncPathMXI, IncPathLocal);
	const keyValues = {
		slug,
		...metadata,
		summary,
		files: filePaths
	};

	fs.ensureDirSync(path.dirname(mdPath));
	fs.writeFileSync(mdPath, frontmatter(keyValues) + md, "utf8");
});
