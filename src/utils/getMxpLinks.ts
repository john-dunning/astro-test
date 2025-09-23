import { GoogleDriveAPI } from "./GoogleDriveAPI.ts";

const baseName = (name: string) => name.replace(/\.mxp$/, "");

let linkMap: Map<string, string>;

export async function getMxpLinks()
{
	if (!linkMap) {
		const folderID = import.meta.env.GDRIVE_DL_FOLDER;

		if (!folderID) {
			throw new Error("GDRIVE_DL_FOLDER not set");
		}

		let credentials: object;

		try {
			credentials = JSON.parse(import.meta.env.GDRIVE_API_KEY);
		} catch (e) {
			throw new Error("GDRIVE_API_KEY is not a valid JSON object", { cause: e });
		}

		const drive = new GoogleDriveAPI({ credentials });
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
