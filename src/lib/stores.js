import { browser } from "$app/environment";
import { readable, writable } from "svelte/store";
import { load, store } from "./serializer";

export const crVersion = writable(null);
export const locale = writable("en_us");
export const ready = writable(false);

if (browser) {
    load("locale").then((value) => {
        locale.set(value || "en_us");
    });
    load("loadedVersion").then((value) => {
        crVersion.set(value);
        ready.set(true);
    });
    locale.subscribe((value) => {
        store("locale", value);
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
