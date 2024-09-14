import * as zip from "@zip.js/zip.js";
import { textures, items, craftingRecipes, blocks, furnaceRecipes, loadedVersion } from "./stores";
import { parseItem } from "./items";
import { parseBlock } from "./blocks";
import { parseCraftingRecipe, parseFurnaceRecipe } from "./recipes";
import { writable } from "svelte/store";


export async function getFilesFromJar(file) {
    let zipReader = new zip.ZipReader(new zip.BlobReader(file));
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
                let text = await ifile.getData(new zip.TextWriter());
                return JSON.parse(text);
            }
        }];
    }))
}

export async function getFilesFromFileList(files) {
    return Object.fromEntries(Array.prototype.filter.call(files, (file) => file.webkitRelativePath.startsWith("mods/assets")).map((ifile) => {
        return [ifile.webkitRelativePath.slice(12), {
            readBlob: async () => {
                return ifile;
            },
            readText: async () => {
                return await ifile.text();
            },
            readJson: async () => {
                let text = await ifile.text();
                return JSON.parse(text);
            },
        }]
    }))
}

export async function categorizeFiles(files) {
    let result = {
        textures: {},
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
            let url = URL.createObjectURL(blob);
            result.textures[path] = url;
        } else if (path.startsWith("build_assets/version.txt")) {
            result.version = await file.readText();
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
            }
            else if (path.startsWith("recipes/crafting/")) {
                result.recipes.crafting.push(jsonData);
            } else if (path.startsWith("recipes/furnace/")) {
                result.recipes.furnace.push(jsonData);
            }
        }
    }
    return result;
}


export const dataModFiles = writable({});
export const jarFiles = writable({});

let currentDataModFiles = {};
let currentJarFiles = {};

async function update() {
    const files = Object.fromEntries(Object.entries(currentJarFiles).concat(Object.entries(currentDataModFiles)));
    const categorizedFiles = await categorizeFiles(files);

    console.log(categorizedFiles)

    textures.set(categorizedFiles.textures);
    const new_items = {};
    for (let item of Object.values(categorizedFiles.items)) {
        new_items[item.id] = parseItem(item);
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

    loadedVersion.set(categorizedFiles.version);
}

dataModFiles.subscribe((value) => {
    currentDataModFiles = value;
    update()
});
jarFiles.subscribe((value) => {
    currentJarFiles = value;
    update()
});