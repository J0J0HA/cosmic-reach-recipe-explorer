import { getFolderFiles, getLoader, getZipFiles } from "./importer";
import { get } from "svelte/store";
import { crVersion } from "./stores";
import { db } from "./db";

export async function loadDatamodsFromFolder(folder) {
    const name = folder[0].webkitRelativePath.split("/")[0];
    const createdAt = Date.now()
    const sourceId = "folder:" + name + "@" + createdAt;
    const files = await getFolderFiles(folder);

    db.loadedSources.put({
        sourceId,
        name,
        type: "folder",
        createdAt,
    });

    await getLoader(get(crVersion)).loadFiles(
        sourceId,
        files,
    );
}

export async function loadDatamodFromZIP(zip) {
    const name = zip.name.split(".")[0];
    const createdAt = Date.now();
    const sourceId = "zip:" + zip.name + "@" + createdAt;
    const files = await getZipFiles(zip);

    db.loadedSources.put({
        sourceId,
        name,
        type: "ZIP file",
        createdAt,
    });

    await getLoader(get(crVersion)).loadFiles(
        sourceId,
        files,
    );
}


export async function loadDatamodFromCRMM(id) {
    const metadata = await fetch(`https://api.crmm.tech/api/project/${id}`);

    if (!metadata.success) alert(`Failed loading mod: ${metadata.message}`);

    const createdAt = Date.now();

    const name = metadata.project.name || "Unnamed Project";
    const sourceId = "crmm:" + id;
    const files = await getZipFiles(folder);

    db.loadedSources.put({
        sourceId,
        name,
        type: "crmm.tech",
        createdAt,
    });

    await getLoader(get(crVersion)).loadFiles(
        sourceId,
        files,
    );
}

export async function listCRMMmods(query) {
    const urlparams = new URLSearchParams("type=datamod");
    if (query) urlparams.set("q", query);
    const results = await fetch(`https://api.crmm.tech/api/search?` + urlparams.toString());

    if (!results.success) alert(`Failed loading mods: ${results.message}`);

    return results.hits;
}

export async function unloadSource(source) {
    await getLoader(get(crVersion)).unloadFiles(source);
    await db.loadedSources.where("sourceId").equals(source).delete();
}