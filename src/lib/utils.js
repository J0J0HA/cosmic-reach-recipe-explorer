import { items, blocks, craftingRecipes, furnaceRecipes } from "./stores";

let current_items = {};
let current_blocks = {};
let current_craftingRecipes = {};
let current_furnaceRecipes = {};

items.subscribe((value) => {
    current_items = value;
});

blocks.subscribe((value) => {
    current_blocks = value;
})

craftingRecipes.subscribe((value) => {
    current_craftingRecipes = value;
})

furnaceRecipes.subscribe((value) => {
    current_furnaceRecipes = value;
})

export function getUsesOf(itemId) {
    const filteredCraftingRecipes = current_craftingRecipes.filter((recipe) => {
        return recipe.getInputItems().some((itemStack) => (itemStack instanceof Array) ? itemStack.some((subItemStack) => subItemStack.item.id === itemId) : itemStack.item.id === itemId);
    })
    const filteredFurnaceRecipes = current_furnaceRecipes.filter((recipe) => {
        return recipe.input.item.id == itemId;
    })

    const isFuel = current_items[itemId]?.isFuel() || current_blocks[itemId]?.isFuel();

    return {
        crafting: filteredCraftingRecipes,
        furnace: filteredFurnaceRecipes,
        fuel: isFuel,
        noUse: (filteredCraftingRecipes.length <= 0) && (filteredFurnaceRecipes.length <= 0) && !isFuel,
    }
}

export function getWaysToGet(itemId) {
    const filteredCraftingRecipes = current_craftingRecipes.filter((recipe) => {
        return recipe.output.item.id === itemId;
    })
    const filteredFurnaceRecipes = current_furnaceRecipes.filter((recipe) => {
        return recipe.output.item.id === itemId;
    })

    return {
        crafting: filteredCraftingRecipes,
        furnace: filteredFurnaceRecipes,
        noUse: (filteredCraftingRecipes.length <= 0) && (filteredFurnaceRecipes.length <= 0)
    }
}

const textureCache = {};

export function getTexture(textures, texture) {
    const textureBlob = textures[texture];
    if (textureBlob && !textureCache[texture]) {
        textureCache[texture] = URL.createObjectURL(textureBlob);
    }
    return textureCache[texture];
}
