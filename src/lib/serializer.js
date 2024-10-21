import * as Hjson from "hjson-devvit";
import { db } from "./db";

async function deconstructTree(tree) {
    let result = {};
    for (let [key, value] of Object.entries(tree)) {
        if (value.readText) {
            result[key] = await value.readText();
        } else {
            result[key] = await deconstructTree(value);
        }
    }
    return result;
}

async function constructTree(tree) {
    let result = {};
    for (let [key, value] of Object.entries(tree)) {
        if (typeof value === "string") {
            result[key] = {
                readBlob: async () => {
                    return new Blob([value], { type: "text/plain" });
                },
                readText: async () => value,
                readJson: async () => {
                    return Hjson.parse(value);
                },
            };
        } else {
            result[key] = await constructTree(value);
        }
    }
    return result;
}

export async function storeFiles(name, files) {
    console.log("Storing", name, files);
    db.jarFiles.add({ name, files });
    localStorage.setItem(name, JSON.stringify(await deconstructTree(files)));
    console.log("Stored", name, files);
};

export async function loadFiles(name) {
    return await constructTree(JSON.parse(localStorage.getItem(name) || "{}"));
};

export async function storeMeta(name, meta) {
    console.log("Storing", name, meta);
    localStorage.setItem(name, JSON.stringify(meta));
    console.log("Stored", name, meta);
};

export async function loadMeta(name) {
    return JSON.parse(localStorage.getItem(name) || "null");
};