import * as zip from "@zip.js/zip.js";
import { textures, models, items, craftingRecipes, blocks, furnaceRecipes, loadedVersion, loader, loadTime } from "./stores";
import { Item } from "./items";
import { parseBlock } from "./blocks";
import { parseCraftingRecipe, parseFurnaceRecipe } from "./recipes";
import { writable } from "svelte/store";
// import * as Hjson from "hjson";
const Hjson = JSON; // hjson-js stupid.



export async function getFilesFromJar(file) {
    const zipReader = new zip.ZipReader(new zip.BlobReader(file));
    let entries = await zipReader.getEntries();

    return Object.fromEntries(entries.map((ifile) => {
        return [ifile.filename, {
            readBlob: async () => {
                return await ifile.getData(new zip.BlobWriter());
            },
            readText: async () => {
                return await ifile.getData(new zip.TextWriter());
            },
            readJson: async () => {
                const text = await ifile.getData(new zip.TextWriter());
                return Hjson.parse(text);
            }
        }];
    }))
};

export async function getFilesFromFileList(files) {
    let requirement = "mods/";
    if (Array.prototype.some.call(files, (entry) => entry.webkitRelativePath.startsWith("mods/assets"))) {
        requirement = "mods/assets/";
    }
    return Object.fromEntries(Array.prototype.filter.call(files, (file) => file.webkitRelativePath.startsWith(requirement)).map((ifile) => {
        return [ifile.webkitRelativePath.slice(12), {
            readBlob: async () => {
                return ifile;
            },
            readText: async () => {
                return await ifile.text();
            },
            readJson: async () => {
                let text = await ifile.text();
                return Hjson.parse(text);
            },
        }]
    }))
};

const V1 = {
    version: /^0\.(0|1|2)\.\d+[a-z]?$/,
    name: "V1",
    async categorizeFiles(files) {
        let result = {
            textures: {},
            models: {},
            items: {},
            blocks: {},
            version: "none",
            recipes: {
                crafting: [],
                furnace: [],
            },
        }
        for (let entry of Object.entries(files)) {
            let path = entry[0];
            let file = entry[1];
            if (path.startsWith("textures/") && path.endsWith(".png")) {
                let blob = await file.readBlob();
                result.textures[path] = blob;
            }
            if (path.endsWith(".json")) {
                let jsonData;
                try {
                    jsonData = await file.readJson();
                } catch (e) {
                    console.warn("could not load", path, e)
                    continue;
                }

                if (path.startsWith("items/")) {
                    result.items[jsonData.id] = jsonData;
                } else if (path.startsWith("blocks/")) {
                    result.blocks[jsonData.stringId] = jsonData;
                } else if (path.startsWith("models/")) {
                    result.models[path.slice(7 + 7, -5)] = jsonData;
                }
                else if (path.startsWith("recipes/crafting/")) {
                    result.recipes.crafting.push(jsonData);
                } else if (path.startsWith("recipes/furnace/")) {
                    result.recipes.furnace.push(jsonData);
                }
            }
        }
        return result;
    },
    filterJarFiles(files) {
        return files;
    },
    parseItem(data) {
        let item = new Item(data[1].id, data[1].itemProperties);
        return item;
    }
};

const V2 = {
    version: /^0\.3\.\d+$/,
    name: "V2",
    async categorizeFiles(files) {
        let result = {
            textures: {},
            models: {},
            items: {},
            blocks: {},
            recipes: {
                crafting: [],
                furnace: [],
            },
        };
        // let namespaces = [];

        // for (let path of Object.keys(files)) {
        //     let namespace = path.split("/")[0];
        //     if (!namespaces.includes(namespace))
        //         namespaces.push(namespace);
        // }

        for (let entry of Object.entries(files)) {
            const gpath = entry[0];
            const namespace = gpath.split("/", 1)[0];
            const path = gpath.slice(namespace.length + 1);
            const namespacedPath = namespace + ":" + path;
            const file = entry[1];

            if (!path) {
                continue;
            }

            if (path.startsWith("textures/") && path.endsWith(".png")) {
                let blob = await file.readBlob();
                result.textures[namespacedPath] = blob;
                if (namespace === "base") {
                    result.textures[path] = blob;
                }
            }
            if (path.endsWith(".json")) {
                let jsonData;
                try {
                    jsonData = await file.readJson();
                } catch (e) {
                    console.warn("could not load", path, e)
                    continue;
                }

                if (path.startsWith("items/")) {
                    result.items[namespacedPath] = jsonData;
                } else if (path.startsWith("blocks/")) {
                    result.blocks[namespacedPath] = jsonData;
                } else if (path.startsWith("models/")) {
                    result.models[namespacedPath] = jsonData;
                    if (namespace === "base") {
                        result.models[path] = jsonData;
                    }
                }
                else if (path.startsWith("recipes/crafting/")) {
                    result.recipes.crafting.push(jsonData);
                } else if (path.startsWith("recipes/furnace/")) {
                    result.recipes.furnace.push(jsonData);
                }
            }
        }
        return result;
    },
    filterJarFiles(files) {
        return Object.fromEntries(Object.entries(files).filter(entry => entry[0].startsWith("base/")));
    },
    parseItem(data) {
        const namespace = data[0].split(":", 1)[0];
        const itemData = data[1];
        itemData.itemProperties.texture = namespace + ":" + itemData.itemProperties.texture;
        let item = new Item(itemData.id, itemData.itemProperties);
        return item;
    }
};

const loaders = [V1, V2];


export const dataModFiles = writable({});
export const jarFiles = writable({});

let currentDataModFiles = {};
let currentJarFiles = {};

async function update() {
    const startTime = performance.now();
    if (!currentJarFiles["build_assets/version.txt"]) {
        console.error("Version could not be determined!");
        return;
    }
    const version = await currentJarFiles["build_assets/version.txt"].readText();

    let chosenLoader;
    for (let mloader of loaders) {
        if (mloader.version.test(version)) {
            chosenLoader = mloader;
            break;
        }
    }
    if (!chosenLoader) {
        console.error("No loader found for version", version);
        return;
    }
    console.info("Using loader for version", version);


    const files = Object.fromEntries(Object.entries(chosenLoader.filterJarFiles(currentJarFiles)).concat(Object.entries(currentDataModFiles)));

    const categorizedFiles = await chosenLoader.categorizeFiles(files);

    loadedVersion.set(version);

    loader.set(chosenLoader);
    textures.set(categorizedFiles.textures);
    models.set(categorizedFiles.models);
    const new_items = {};
    for (let entry of Object.entries(categorizedFiles.items)) {
        let item = chosenLoader.parseItem(entry);
        new_items[item.id] = item;
    }
    items.set(new_items);
    const new_blocks = {};
    for (let item of Object.values(categorizedFiles.blocks)) {
        Object.assign(new_blocks, parseBlock(item));
    }
    blocks.set(new_blocks);
    const new_craftingRecipes = [];
    for (let craftingRecipe of Object.values(categorizedFiles.recipes.crafting)) {
        new_craftingRecipes.push(...parseCraftingRecipe(craftingRecipe));
    }
    craftingRecipes.set(new_craftingRecipes);
    const new_furnaceRecipes = [];
    for (let furnaceRecipe of Object.values(categorizedFiles.recipes.furnace)) {
        new_furnaceRecipes.push(...parseFurnaceRecipe(furnaceRecipe));
    }
    furnaceRecipes.set(new_furnaceRecipes);

    const endTime = performance.now();

    loadTime.set((endTime - startTime) / 1000);
}

dataModFiles.subscribe((value) => {
    currentDataModFiles = value;
    update();
});
jarFiles.subscribe((value) => {
    currentJarFiles = value;
    update();
});