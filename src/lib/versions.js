import { store } from "./serializer";
import { crVersion, locale } from "./stores";
import { getLoader, getZipFiles } from "./importer";
import axios from "axios";

export async function getVersionList() {
    const response = await axios.get("https://raw.githubusercontent.com/CRModders/CosmicArchive/main/versions.json", { responseType: "json" });
    return response.data.versions.filter(version => !!version.client);
}

export async function downloadVersion(version, stateCallback) {
    const response = await axios.get(/*"/Cosmic Reach-0.3.1.jar" ||*/ version.client.url, {
        responseType: "blob",
        onDownloadProgress: (progressEvent) => stateCallback?.("download", progressEvent.loaded, progressEvent.total)
    });
    return response.data;
}

export async function setVersion(version, stateCallback) {
    stateCallback?.("init")
    const loader = getLoader(version.id);

    if (!loader) {
        alert("No loader found for version " + version.id + "! This version is either invalid/unknown or not yet supported.\n\nTarget is to support all versions, so you might succeed by coming back later.");
        return;
    }

    const versionJar = await downloadVersion(version, stateCallback);

    stateCallback?.("extract");

    const files = await getZipFiles(versionJar);

    stateCallback?.("parse")

    store("loadedVersion", null);
    await loader.loadFiles("jar", files);
    crVersion.set(version.id);
    store("loadedVersion", version.id);
}