import { browser } from "$app/environment";
import { get } from "svelte/store";
import { db } from "./db";
import { crVersion, ready, locale } from "./stores";
import { getVersionList, setVersion } from "./versions";
import { replaceState } from "$app/navigation";

export async function readURLParams(stateCallback) {
    const params = new URLSearchParams(window.location.search);

    await new Promise((resolve) => {
        ready.subscribe((value) => {
            if (value) resolve();
        });
    });

    if (params.has("version")) {
        const targetVersion = params.get("version");
        const currentVersion = get(crVersion);
        const versionList = await getVersionList();

        let version;

        switch (targetVersion) {
            case ":any":
                if (!currentVersion) version = versionList[0];
                break;
            case ":latest":
                version = versionList[0];
                break;
            default:
                version = versionList.find((version) => version.id == targetVersion);
                break;
        }
        if (
            version &&
            confirm(`This downloads the entire game jar of version ${version.id}.\n\nAre you sure you want to continue?`) &&
            currentVersion != version.id
        )
            await setVersion(version, stateCallback);
    }

    if (params.has("locale")) {
        const targetLocale = params.get("locale");
        const currentLocale = get(locale);

        if (targetLocale != currentLocale) {
            const locales = await db.metadata.where({ key: "languages" }).first();

            if (locales.value.some((obj) => obj.key === targetLocale)) {
                locale.set(targetLocale);
            }
        }
    }

    replaceState(window.location.toString().split("?")[0]);
}
