import { get } from "svelte/store";
import { db } from "./db";
import { getFolderFiles, getLoader, getZipFiles } from "./importer";
import { crVersion } from "./stores";

export async function loadDatamodsFromFolder(folder) {
    const name = folder[0].webkitRelativePath.split("/")[0];
    const createdAt = Date.now();
    const sourceId = "folder:" + name + "@" + createdAt;
    const files = await getFolderFiles(folder);

    await db.loadedSources.put({
        sourceId,
        name,
        type: "folder",
        createdAt,
        editing: true,
    });

    await getLoader(get(crVersion)).loadFiles(sourceId, files);


    await db.loadedSources.put({
        sourceId,
        name,
        type: "folder",
        createdAt,
        editing: false,
    });
}

export async function loadDatamodFromZIP(zip) {
    const name = zip.name.split(".")[0];
    const createdAt = Date.now();
    const sourceId = "zip:" + zip.name + "@" + createdAt;
    const files = await getZipFiles(zip);


    await db.loadedSources.put({
        sourceId,
        name,
        type: "ZIP file",
        createdAt,
        editing: true,
    });

    await getLoader(get(crVersion)).loadFiles(sourceId, files);

    await db.loadedSources.put({
        sourceId,
        name,
        type: "ZIP file",
        createdAt,
        editing: false,
    });
}

export async function loadDatamodFromCRMM(metadata) {
    const createdAt = Date.now();

    const name = metadata.name || "Unnamed Project";
    const sourceId = "crmm:" + metadata.slug;

    const res = await fetch(`https://api.crmm.tech/api/project/${metadata.slug}/version/latest/primary-file`);

    const files = await getZipFiles(await res.blob());

    await db.loadedSources.put({
        sourceId,
        name,
        type: "crmm.tech",
        createdAt,
        icon: metadata.icon,
        editing: true,
    });

    await getLoader(get(crVersion)).loadFiles(sourceId, files);

    await db.loadedSources.put({
        sourceId,
        name,
        type: "crmm.tech",
        createdAt,
        icon: metadata.icon,
        editing: false,
    });
}

export async function loadCRMMmodMetadata(id) {
    const res = await fetch(`https://api.crmm.tech/api/project/${id}`);
    const metadata = await res.json();
    return metadata;
}

export async function listCRMMmods(query, page) {
    const urlparams = new URLSearchParams();
    if (query) urlparams.set("q", query);
    if (page) urlparams.set("page", page);
    urlparams.set("sortby", "downloads");
    urlparams.set("type", "datamod");
    urlparams.set("limit", "10");
    const datamodRes = await fetch(`https://api.crmm.tech/api/search?` + urlparams.toString());
    const datamodData = await datamodRes.json();
    const datamods = datamodData?.hits || [];
    urlparams.set("type", "resource-pack");
    const respackRes = await fetch(`https://api.crmm.tech/api/search?` + urlparams.toString());
    const respackData = await respackRes.json();
    const respacks = respackData?.hits || [];

    const hits = datamods.concat(respacks).reduce((acc, val) => {
        // unique
        if (!acc.some(v => v.slug === val.slug)) acc.push(val);
        return acc;
    }, []).sort((a, b) => {
        return b.downloads - a.downloads
    })

    if (!hits) alert(`Failed loading mods: ${data.message}`);

    return {
        hits,
        totalHits: Math.max(datamodData.estimatedTotalHits, respackData.estimatedTotalHits),
        passedHits: Math.max(datamodData.offset + datamodData.hits.length, respackData.offset + respackData.hits.length),
    };
}

export async function unloadSource(source) {
    await db.loadedSources.put({
        ...(await db.loadedSources.get(source)),
        sourceId: source,
        editing: true,
    });

    await getLoader(get(crVersion)).unloadFiles(source);
    await db.loadedSources.where("sourceId").equals(source).delete();
}
