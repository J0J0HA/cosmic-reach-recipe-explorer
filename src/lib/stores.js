import { writable } from 'svelte/store';

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

export function onchange(callback) {
    lang.subscribe(callback);
    items.subscribe(callback);
    blocks.subscribe(callback);
    craftingRecipes.subscribe(callback);
    furnaceRecipes.subscribe(callback);
    textures.subscribe(callback);
    models.subscribe(callback);
    loadedVersion.subscribe(callback);
}
