import { writable, readable } from 'svelte/store';
import { load } from './serializer';
import { browser } from "$app/environment"

export const crVersion = writable(null);
export const locale = writable("en_us");
export const loaded = writable(false);

if (browser) {
    load("loadedVersion").then((value) => {
        crVersion.set(value);
        loaded.set(true);
    });
}

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
