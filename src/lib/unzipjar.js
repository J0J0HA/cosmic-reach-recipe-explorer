import * as zip from "@zip.js/zip.js";
import { textures, items, craftingRecipes, blocks, furnaceRecipes } from "./stores";
import { parseItem } from "./items";
import { parseBlock } from "./blocks";
import { parseCraftingRecipe, parseFurnaceRecipe } from "./recipes";

export async function unzipJar(file) {
    let zipReader = new zip.ZipReader(new zip.BlobReader(file));
    let entries = await zipReader.getEntries();
    let result = {
        textures: {},
        items: {},
        blocks: {},
        recipes: {
            crafting: [],
            furnace: [],
        },
    }
    for (let entry of entries) {
        if (entry.filename.startsWith("textures/") && entry.filename.endsWith(".png")) {
            let blob = await entry.getData(new zip.BlobWriter());
            let url = URL.createObjectURL(blob);
            result.textures[entry.filename] = url;
        }
        if (entry.filename.endsWith(".json")) {
            let data = await entry.getData(new zip.TextWriter());

            if (entry.filename.startsWith("items/")) {
                let item = JSON.parse(data);
                result.items[item.id] = item;
            } else if (entry.filename.startsWith("blocks/")) {
                let block = JSON.parse(data);
                result.blocks[block.stringId] = block;
            }
            else if (entry.filename.startsWith("recipes/")) {
                let recipe = JSON.parse(data);
                if (entry.filename.startsWith("recipes/crafting/")) {
                    result.recipes.crafting.push(recipe);
                } else if (entry.filename.startsWith("recipes/furnace/")) {
                    result.recipes.furnace.push(recipe);
                }
            }
        }
    }
    return result;
}
export async function loadFromJar(file) {
    const data = await unzipJar(file);

    textures.set(data.textures);
    const new_items = {};
    for (let item of Object.values(data.items)) {
        new_items[item.id] = parseItem(item);
    }
    items.set(new_items);
    const new_blocks = {};
    for (let item of Object.values(data.blocks)) {
        Object.assign(new_blocks, parseBlock(item));
    }
    blocks.set(new_blocks);
    const new_craftingRecipes = [];
    for (let craftingRecipe of Object.values(data.recipes.crafting)) {
        new_craftingRecipes.push(...parseCraftingRecipe(craftingRecipe));
    }
    craftingRecipes.set(new_craftingRecipes);
    const new_furnaceRecipes = [];
    for (let furnaceRecipe of Object.values(data.recipes.furnace)) {
        new_furnaceRecipes.push(...parseFurnaceRecipe(furnaceRecipe));
    }
    furnaceRecipes.set(new_furnaceRecipes);
}
