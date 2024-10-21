import { storeMeta } from "./serializer";
import { loadedVersion } from "./stores";
import { getLoader, getZipFiles } from "./importer";

export async function getVersionList() {
    const response = await fetch("https://raw.githubusercontent.com/CRModders/CosmicArchive/main/versions.json");
    const data = await response.json();
    return data.versions.filter(version => version.client !== undefined);
}

export async function downloadVersion(version) {
    const response = await fetch("/Cosmic%20Reach-0.3.1.jar" || version.client.url);
    const data = await response.blob();
    return data
}

export async function setVersion(version) {
    const loader = getLoader(version.id);

    if (!loader) {
        alert("No loader found for version " + version.id);
        return;
    }

    const versionJar = await downloadVersion(version);

    const files = await getZipFiles(versionJar);

    // if (await files["build_assets/version.txt"].readText() !== version) {
    //     throw new Error("Version mismatch!");
    // }
    storeMeta("loadedVersion", null);

    await loader.loadFiles("jar", files);
    
    loadedVersion.set(version.id);
    storeMeta("loadedVersion", version.id);
}