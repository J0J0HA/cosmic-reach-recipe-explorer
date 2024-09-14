import { writable } from 'svelte/store';

export const items = writable({});
export const blocks = writable({});
export const craftingRecipes = writable([]);
export const furnaceRecipes = writable([]);
export const textures = writable({});

export function onchange(callback) {
    items.subscribe(callback);
    blocks.subscribe(callback);
    craftingRecipes.subscribe(callback);
    furnaceRecipes.subscribe(callback);
    textures.subscribe(callback);
}