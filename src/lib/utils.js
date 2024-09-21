import { Item, ItemStack } from "./items";
import { items, blocks, craftingRecipes, furnaceRecipes, textures } from "./stores";

import { get } from 'svelte/store';

export function getUsesOf(itemId) {
    const filteredCraftingRecipes = get(craftingRecipes).filter((recipe) => {
        return recipe.getInputItems().some((itemStack) => (itemStack instanceof Array) ? itemStack.some((subItemStack) => subItemStack.item.id === itemId) : itemStack.item.id === itemId);
    })
    const filteredFurnaceRecipes = get(furnaceRecipes).filter((recipe) => {
        return recipe.input.item.id == itemId;
    })

    const isFuel = get(items)[itemId]?.isFuel() || get(blocks)[itemId]?.isFuel();

    return {
        crafting: filteredCraftingRecipes,
        furnace: filteredFurnaceRecipes,
        fuel: isFuel,
        noUse: (filteredCraftingRecipes.length <= 0) && (filteredFurnaceRecipes.length <= 0) && !isFuel,
    }
}

const air = new Item("air", { __texture_override: "https://placehold.co/64/0000/0000" });
export function getAir() {
    return new ItemStack(air, 0, {});
}
export function getWaysToGet(itemId) {
    const filteredCraftingRecipes = get(craftingRecipes).filter((recipe) => {
        return recipe.output.item.id === itemId;
    })
    const filteredFurnaceRecipes = get(furnaceRecipes).filter((recipe) => {
        return recipe.output.item.id === itemId;
    })

    return {
        crafting: filteredCraftingRecipes,
        furnace: filteredFurnaceRecipes,
        noUse: (filteredCraftingRecipes.length <= 0) && (filteredFurnaceRecipes.length <= 0)
    }
}

const textureCache = {};

export function getTexture(texture) {
    const textureBlob = get(textures)[texture];
    if (textureBlob && !textureCache[texture]) {
        textureCache[texture] = URL.createObjectURL(textureBlob);
    }
    return textureCache[texture];
}

function findMatchingItems(condition) {
    if (condition.id) {
        return [condition.id];
    } else if (condition.__require__) {
        return Object.entries({ ...get(blocks), ...get(items) }).filter(entry => {
            return entry[1][condition.__require__]();
        }).map(entry => entry[0])
    } else if (condition.and) {
        const tests = [];
        for (let test of condition.and) {
            tests.push(findMatchingItems(test));
        }
        return tests.reduce((prev, cur) => {
            return prev ? prev.filter((value) => cur.includes(value)) : cur;
        }, Object.keys({ ...get(blocks), ...get(items) }))
    } else if (condition.has_tag) {
        return Object.values(get(blocks)).filter((block) => block.properties.tags?.includes(condition.has_tag)).map((block) => block.id);
    } else {
        console.error(condition)
        throw new Error(condition);
    }
}

export function getItemFilter(filter, count, props) {
    return findMatchingItems(filter).map((item) => getItemStack(item, count, props));
}

function getUnknownItem(forId, count, props) {
    return new ItemStack(new Item(forId, {}), count, { name: `Unknown (${forId})`, ...props });
}
export function getItemStack(item, count = 1, properties = {}) {
    if (item === null) return new ItemStack(air, 0);
    if (!(typeof item === 'string' || item instanceof String)) return getItemFilter(item, count, properties);
    if (get(items)[item]) {
        return new ItemStack(get(items)[item], count, properties);
    } else if (get(blocks)[item]) {
        return new ItemStack(get(blocks)[item], count, properties);
    } else { return getUnknownItem(item, count, properties); }
}

export function getItemsAsStacks() {
    let itemStacks = [];
    for (let item in get(items)) {
        itemStacks.push(getItemStack(item));
    }
    return itemStacks;
}


export function getFuels() {
    let itemStacks = [];
    for (let item in get(items)) {
        if (get(items)[item].isFuel()) {
            itemStacks.push(item);
        }
    }
    for (let block in get(blocks)) {
        if (get(blocks)[block].isFuel()) {
            itemStacks.push(block);
        }
    }
    return itemStacks;
}