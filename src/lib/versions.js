export async function getVersionList() {
    const response = await fetch("https://raw.githubusercontent.com/CRModders/CosmicArchive/main/versions.json");
    const data = await response.json();
    return data.versions;
}

export async function downloadVersion(version) {
    const response = await fetch(version.url);
    const data = await response.blob();
    return data
}
