import { browser } from "$app/environment";
import { replaceState } from "$app/navigation";
import { get, writable } from "svelte/store";
import { loadCRMMmodMetadata, loadDatamodFromCRMM, unloadSource } from "./datamods";
import { db } from "./db";
import { crVersion, locale, ready } from "./stores";
import { getVersionList, setVersion } from "./versions";

export const parsingURL = writable(true);

export async function readURLParams(stateCallback) {
    try {
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
                    version = versionList.find((version) => version.id === targetVersion);
                    break;
            }
            if (version && currentVersion !== version.id) await setVersion(version, stateCallback);
            params.delete("version");
        }

        if (params.has("locale")) {
            const targetLocale = params.get("locale");
            const currentLocale = get(locale);

            if (targetLocale !== currentLocale) {
                const locales = await db.metadata.where({ key: "languages" }).first();

                if (locales.value.some((obj) => obj.key === targetLocale)) {
                    locale.set(targetLocale);
                }
            }
            params.delete("locale");
        }

        const mods = params.getAll("mod");
        const installedMods = await db.loadedSources.toArray();

        for (const mod of mods) {
            if (!installedMods.some((installedMod) => installedMod.sourceId === mod)) {
                if (mod.startsWith("crmm:")) {
                    await loadDatamodFromCRMM((await loadCRMMmodMetadata(mod.slice(5))).project);
                } else {
                    alert(`Mod ${mod} is not installed and cannot be downloaded from CRMM automatically. Therefore, it is missing.`);
                }
            }
        }

        if (params.get("clean") === "true") {
            for (const installedMod of installedMods) {
                if (!mods.includes(installedMod.sourceId)) {
                    await unloadSource(installedMod.sourceId);
                }
            }
            params.delete("clean");
        }

        params.delete("mod");

        setURLParams(params);
    } catch (e) {
        alert(`Failed to load settings from URL:\n${e}`);
    }
    parsingURL.set(false);
}

export function setURLParams(params) {
    replaceState(window.location.toString().split("?")[0] + (params.toString() ? `?${params.toString()}` : ""));
}
