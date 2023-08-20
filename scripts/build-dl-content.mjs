import fs from "fs-extra";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";
import { dump } from "js-yaml";
import glob from "fast-glob";

const BRPattern = /<br>/g;
const CommandsPath = "src/content/commands";

function nameVersion(
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

function packageContents(
	files)
{
	const list = files.map((file) => `  * ${file["@"].source}`).join("\n");

	return `# Package contents

${list}
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
	const [name, version] = nameVersion(mxiPath);
	const currentPath = result[name];

	if (!currentPath) {
		result[name] = mxiPath;
	} else {
		const [, currentVersion] = nameVersion(currentPath);

		if (version > currentVersion) {
			result[name] = mxiPath;
		}
	}

	return result;
}, {});

Object.entries(pathsByName).forEach(([name, mxiPath]) => {
	const xml = fs.readFileSync(mxiPath, "utf8");
	const mxi = parser.parse(xml);
	const { "macromedia-extension": extension } = mxi;
	const { "@": metadata, description: { "#text": description }, files, summary } = extension;
	const filePaths = files.file.map((file) => file["@"].source);
	const keyValues = { ...metadata, summary, files: filePaths };
	const mdPath = path.join(CommandsPath, name + ".md");
	const md = description.replace(BRPattern, "");

	fs.ensureDirSync(path.dirname(mdPath));
	fs.writeFileSync(mdPath, frontmatter(keyValues) + md, "utf8");
});
