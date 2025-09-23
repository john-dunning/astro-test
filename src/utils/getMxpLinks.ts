import { GoogleDriveAPI } from "./GoogleDriveAPI.ts";

const baseName = (name: string) => name.replace(/\.mxp$/, "");

const credentials = JSON.parse(import.meta.env.GDRIVE_API_KEY);
const folderID = import.meta.env.GDRIVE_DL_FOLDER;

let drive = new GoogleDriveAPI({ credentials });
let linkMap: Map<string, string>;

export async function getMxpLinks()
{
	if (!folderID) {
		throw new Error("GDRIVE_DL_FOLDER not set");
	}

	if (!linkMap) {
		const files = await drive.getFiles({
			folders: [folderID],
			fields: ["id", "name", "webContentLink"]
		});
		const entries: [string, string][] = files.map((f) => [baseName(f.name), f.webContentLink]);

		console.log(`Found ${files.length} .mxp files on Google Drive`);

		linkMap = new Map(entries);
	}

	return linkMap;
}
