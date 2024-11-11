import { loaded, crVersion, locale } from "./stores";
import { get } from "svelte/store";
import { getVersionList, setVersion } from "./versions";
import { store } from "./serializer";
import { db } from "./db";
import { browser } from "$app/environment";

export function removeURLParam(key) {
    const params = new URLSearchParams(window.location.search);
    if (params.has(key)) {
        params.delete(key);
    };
    window.history.pushState(null, "", "?" + params.toString())
}

export function setURLParam(key, value) {
    const params = new URLSearchParams(window.location.search);
    params.set(key, value);
    window.history.pushState(null, "", "?" + params.toString())
}

if (browser) window.setURLParam = setURLParam;

export async function readURLParams(stateCallback) {
    const params = new URLSearchParams(window.location.search);

    await new Promise((resolve) => {
        loaded.subscribe((value) => {
            if (value) {
                resolve();
            }
        });
    });

    stateCallback?.("idle");


    if (params.has("version")) {
        const targetVersion = params.get("version");
        const currentVersion = get(crVersion);

        if (targetVersion == ":any") {
            if (!currentVersion) {
                const allowed = confirm(`This downloads the entire game jar of version ${version.id}.\n\nAre you sure you want to continue?`);
                if (allowed) {
                    const version = (await getVersionList())[0];
                    if (version) {
                        await setVersion(version, stateCallback);
                    } else {
                        alert("Failed: No versions found!");
                    }
                };
            } else {
                setURLParam("version", currentVersion);
            }
        }
        else if (targetVersion == ":latest") {
            const version = (await getVersionList())[0];
            if (version) {
                if (currentVersion != version.id) {
                    const allowed = confirm(`This downloads the entire game jar of version ${version.id}.\n\nAre you sure you want to continue?`);
                    if (allowed) {
                        if (version) {
                            await setVersion(version, stateCallback);
                        } else {
                            alert("Failed: No versions found!");
                            setURLParam("version", currentVersion);
                        }
                    };
                }
            } else {
                alert("Failed: No versions found!");
            }
        } else {
            const version = (await getVersionList()).find(version => version.id == targetVersion);
            if (version) {
                if (currentVersion != version.id) {
                    const allowed = confirm(`This downloads the entire game jar of version ${version.id}.\n\nAre you sure you want to continue?`);
                    if (allowed) {
                        await setVersion(version, stateCallback);
                    }
                }
            } else {
                alert(`Failed: Version ${targetVersion} not found!`);
                setURLParam("version", currentVersion || ":any");
            }
        }

        if (params.has("locale")) {
            const targetLocale = params.get("locale");
            const currentLocale = get(locale);


            if (targetLocale != currentLocale) {
                const locales = await db.metadata.where({ key: "languages" }).first();

                if (locales.value.map(obj => obj.key).includes(targetLocale)) {
                    locale.set(targetLocale);
                    // store("locale", targetLocale);
                    removeURLParam("locale");
                } else {
                    alert(`Failed: Locale ${targetLocale} does not exist`);
                    setURLParam("version", currentLocale);
                }
            }
        }
    }
}
