import { derived, writable, readable, get } from 'svelte/store';
import { storeFiles, loadFiles, loadMeta } from './serializer';
import { getLoader } from './importer';
import { browser } from "$app/environment"

export const lang = writable({});
// export const loader = writable({ name: "VX" });
export const items = writable({});
export const blocks = writable({});
export const craftingRecipes = writable([]);
export const furnaceRecipes = writable([]);
export const textures = writable({});
export const models = writable({});
export const loadedVersion = writable(null);
export const loadTime = writable(0);
export const locale = writable("en_us");


export const dataModFiles = writable({});
export const jarFiles = writable({});

export const loader = derived(loadedVersion, ($loadedVersion) => {
    return getLoader($loadedVersion) || { name: "VX" };
}, {
    name: "VX"
});
export const files = derived([dataModFiles, jarFiles, loader], ([$dataModFiles, $jarFiles, $loader]) => {
    return $loader.getFilesCombined();
}, {});

const loadedDataModFiles = writable(false);
const loadedjarFiles = writable(false);
const loadedLoadedVersion = writable(false);
export const loadedStore = derived([loadedDataModFiles, loadedjarFiles, loadedLoadedVersion], ([$loadedDataModFiles, $loadedjarFiles, $loadedLoadedVersion]) => {
    return $loadedDataModFiles && $loadedjarFiles && $loadedLoadedVersion;
}, false);

if (browser) {
    loadFiles("dataModFiles").then((value) => {
        dataModFiles.set(value);
        loadedDataModFiles.set(true);
    });

    loadFiles("jarFiles").then((value) => {
        console.log("jarFiles", value);
        jarFiles.set(value);
        loadedjarFiles.set(true);
    });

    loadMeta("loadedVersion").then((value) => {
        loadedVersion.set(value);
        loadedLoadedVersion.set(true);
    });
}

export const translations = derived([lang, locale], ([$lang, $locale]) => {
    return $lang[$locale] || {};
}, {});

export const tickTime = readable(0, function start(set) {
    let counter = 0;
    const interval = setInterval(() => {
        counter++;
        set(counter);
    }, 1000);

    return function stop() {
        clearInterval(interval);
    };
});
