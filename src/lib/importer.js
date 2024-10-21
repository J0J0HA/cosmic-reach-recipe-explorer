import * as zip from "@zip.js/zip.js";
import { dataModFiles, jarFiles, textures, models, items, craftingRecipes, blocks, furnaceRecipes, loadedVersion, loader, loadTime, lang } from "./stores";
import { Item } from "./items";
import { storeFiles } from "./serializer";
import { BlockState } from "./blocks";
import { parseCraftingRecipe, parseFurnaceRecipe } from "./recipes";
import { writable, get } from "svelte/store";
import * as Hjson from "hjson-devvit";
import { db } from "./db";
import { browser } from "$app/environment"

export function fileNamesToTree(files) {
    let result = {};
    for (let entry of Object.entries(files)) {
        let path = entry[0].split("/");
        let file = entry[1];
        let current = result;
        for (let i = 0; i < path.length - 1; i++) {
            let part = path[i];
            current[part] = current[part] || {};
            current = current[part];
        }
        current[path[path.length - 1]] = file;
    }
    return result;
}

export async function getZipFiles(file) {
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

export async function getFolderFiles(files) {
    return Object.fromEntries(files.map((ifile) => {
        return [ifile.webkitRelativePath, {
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

if (browser) window.db = db;

const memoryFileSystem = writable({});

const V1 = {
    version: /^XXX0\.(0|1|2)\.\d+[a-z]?$/,
    name: "V1",
    loadDatamodFiles(files) {
        fileTree = fileNamesToTree(files);
        memoryFileSystem.set({ ...memoryFileSystem, ...fileTree });
    },
    loadJarFiles(files) {
        fileTree = fileNamesToTree(files);
        memoryFileSystem.set({ ...memoryFileSystem, ...fileTree });
    },
    async categorizeFiles(files) {
        let result = {
            textures: {},
            models: {},
            lang: {},
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
    },
    parseBlock(data) {
        const result = {};
        const baseId = data.stringId;
        for (let _ of Object.entries(data.blockStates)) {
            const blockStateId = _[0];
            const blockState = _[1];

            result[`${baseId}[${blockStateId}]`] = new BlockState(`${baseId}[${blockStateId}]`, blockState);
        }
        return result;
    }
};

function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
        var a = new FileReader();
        a.onload = function(e) {resolve(e.target.result);}
        a.onerror = reject;
        a.readAsDataURL(blob);
    });
}

const V2 = {
    version: /^0\.3\.\d+$/,
    name: "V2",
    async loadFiles(source, files) {
        // await db.transaction("rw", [db.textures, db.models], async () => {
        // Textures
        await db.textures.where("source").equals(source).delete();
        await db.textures.bulkPut(
            await Promise.all(Object.entries(files).filter(
                entry => entry[0].split("/")[1] === "textures" && entry[0].endsWith(".png")
            ).map(
                async entry => (
                    {
                        path: entry[0],
                        source,
                        data: (await blobToDataURL(await entry[1].readBlob())).replace("application/octet-stream", "image/png"),
                        modId: entry[0].split("/")[0],
                        subPath: entry[0].split("/").slice(1).join("/"),
                    }
                )
            ))
        );

        // Models
        await db.models.where("source").equals(source).delete();
        await db.models.bulkPut(
            await Promise.all(Object.entries(files).filter(
                entry => entry[0].split("/")[1] === "models" && entry[0].endsWith(".json")
            ).map(
                async entry => {
                    const data = await entry[1].readJson();
                    return (
                    {
                        path: entry[0],
                        source,
                        data,
                        modId: entry[0].split("/")[0],
                        subPath: entry[0].split("/").slice(1).join("/"),
                    }
                )}
            ))
        );

        // Items
        await db.items.where("source").equals(source).delete();
        await db.items.bulkPut(
            await Promise.all(Object.entries(files).filter(
                entry => entry[0].split("/")[1] === "items" && entry[0].endsWith(".json")
            ).map(
                async entry => {
                    const data = await entry[1].readJson();
                    if (data.id.split(":")[0] != entry[0].split("/")[0]) {
                        console.error("Mod ID mismatch in item", entry[0]);
                    }
                    return (
                    {
                        path: entry[0],
                        source,
                        data,
                        modId: entry[0].split("/")[0],
                        subId: data.id.split(":")[1],
                        subPath: entry[0].split("/").slice(1).join("/"),
                    }
                )}
            ))
        );

        // Blocks
        await db.blocks.where("source").equals(source).delete();
        await db.blockstates.where("source").equals(source).delete();
        await db.blocks.bulkPut(
            await Promise.all(Object.entries(files).filter(
                entry => entry[0].split("/")[1] === "blocks" && entry[0].endsWith(".json")
            ).map(
                async entry => {
                    const data = await entry[1].readJson();
                    if (data.stringId.split(":")[0] != entry[0].split("/")[0]) {
                        console.error("Mod ID mismatch in block", entry[0]);
                    }
                    return (
                    {
                        path: entry[0],
                        source,
                        data,
                        modId: entry[0].split("/")[0],
                        subId: data.stringId.split(":")[1],
                        subPath: entry[0].split("/").slice(1).join("/"),
                    }
                )}
            ))
        );
        // });
    },
    getFilesCombined() {
        return {
            mods: {
                ...get(dataModFiles),
                base: {
                    ...get(jarFiles).base,
                    ...get(dataModFiles).base,
                }
            }
        };
    },
    async categorizeFiles(files) {
        let result = {
            textures: {},
            lang: {},
            models: {},
            items: {},
            blocks: {},
            recipes: {
                crafting: [],
                furnace: [],
            },
        };

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

                if (path.startsWith("lang/")) {
                    result.lang[namespacedPath] = jsonData;
                } else if (path.startsWith("items/")) {
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
        const itemData = data[1];
        if (itemData.itemProperties) {
            const splitTextureId = itemData.itemProperties.texture.split(":", 2);
            const namespace = splitTextureId.length > 1 ? splitTextureId[0] : "base";
            itemData.itemProperties.texture = namespace + ":" + (splitTextureId[1] || splitTextureId[0]);
        }
        let item = new Item(itemData.id, itemData.itemProperties);
        return item;
    },
    parseBlock(data) {
        const result = {};
        const baseId = data.stringId;
        for (let _ of Object.entries(data.blockStates)) {
            const blockStateId = _[0];
            const blockState = _[1];

            result[`${baseId}[${blockStateId}]`] = new BlockState(`${baseId}[${blockStateId}]`, blockState);
        }
        return result;
    }
};

const loaders = [V1, V2];


export function getLoader(version) {
    for (let mloader of loaders) {
        if (mloader.version.test(version)) {
            return mloader;
        }
    }
    return null;
}

async function update() {
    const startTime = performance.now();
    if (!currentJarFiles["build_assets/version.txt"]) {
        console.error("Version could not be determined!");
        return;
    }
    const version = await currentJarFiles["build_assets/version.txt"].readText();

    const chosenLoader = getLoader(version);
    if (!chosenLoader) {
        console.error("No loader found for version", version);
        return;
    }
    console.info("Using loader for version", version);


    const files = Object.fromEntries(Object.entries(chosenLoader.filterJarFiles(currentJarFiles)).concat(Object.entries(currentDataModFiles)));

    const categorizedFiles = await chosenLoader.categorizeFiles(files);

    loadedVersion.set(version);

    const languages = {};
    for (let lang_file of Object.entries(categorizedFiles.lang)) {
        const new_lang = lang_file[0].split("/")[1];
        languages[new_lang] = Object.fromEntries(Object.entries(languages[new_lang] || {}).concat(Object.entries(lang_file[1])));
    }

    lang.set(languages);
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
        Object.assign(new_blocks, chosenLoader.parseBlock(item));
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

