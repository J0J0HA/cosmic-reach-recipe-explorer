import { getLoader, getZipFiles } from "./importer";
import { store } from "./serializer";
import { crVersion } from "./stores";
import { setURLParam } from "./urlset";

export async function getVersionList() {
    const res = await fetch("https://raw.githubusercontent.com/CRModders/CosmicArchive/main/versions.json");
    const data = await res.json();
    return data.versions.filter((version) => !!version.client);
}

export async function downloadVersion(version, stateCallback) {
    const res = await fetch(version.client.url);
    const chunks = [];
    const reader = res.body.getReader();

    let downloadProgress = 0;
    let totalSize = Number.parseInt(res.headers.get("Content-Length"));
    if (Number.isNaN(totalSize) || totalSize <= 0) totalSize = version.client.size;

    // Collect downloaded chunks and update the progress bar
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        downloadProgress += value.length;

        stateCallback?.("download", downloadProgress, totalSize);
    }

    const blob = new Blob(chunks);
    return blob;
}

export async function setVersion(version, stateCallback) {
    stateCallback?.("init");

    store("loadedVersion", null);
    crVersion.set(null);
    const loader = getLoader(version.id);
    await loader.activate();

    if (!loader) {
        alert(
            `No loader found for version ${version.id}! This version is either invalid/unknown or not yet supported.\n\nTarget is to support all versions, so you might succeed by coming back later.`,
        );
        return;
    }

    const versionJar = await downloadVersion(version, stateCallback);

    stateCallback?.("extract");

    const files = await getZipFiles(versionJar);

    stateCallback?.("parse");

    await loader.loadFiles("jar", files);
    crVersion.set(version.id);
    store("loadedVersion", version.id);
    setURLParam("version", version.id);
    stateCallback?.("idle");
}
