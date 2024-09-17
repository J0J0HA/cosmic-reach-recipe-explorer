import { derived, writable, readable } from 'svelte/store';

export const lang = writable({});
export const loader = writable({ name: "VX" });
export const items = writable({});
export const blocks = writable({});
export const craftingRecipes = writable([]);
export const furnaceRecipes = writable([]);
export const textures = writable({});
export const models = writable({});
export const loadedVersion = writable("none");
export const loadTime = writable(0);
export const locale = writable("en_us");

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

export const reload = writable(0);
