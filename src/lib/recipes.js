import { getItemStack } from "./items";

class CraftingRecipe {
    constructor(grid, output, ordered) {
        this.grid = grid;
        this.output = output;
        this.ordered = ordered;
    }

    getInputItems() {
        const result = [];
        for (let row of this.grid) {
            result.push(...row);
        }
        return result;
    }
}


export class FurnaceRecipe {
    constructor(input, output) {
        this.input = input;
        this.output = output;
    }

    doesThisClassTrickSonarlintIntoThinkingItHasNotOnlyAConstructor() {
        return true;
    }
}

export function parseCraftingRecipe(data) {
    const result = [];
    for (let recipe of data.recipes) {
        const output = getItemStack(recipe.output.item, recipe.output.amount);
        if (!recipe.pattern) {
            const usedItems = [];
            for (let entry of recipe.inputs) {
                for (let item in entry) {
                    for (let i = 0; i < entry[item]; i++)
                        usedItems.push(getItemStack(item));
                }
            }
            const grid = []
            for (let x = 0; x < 3; x++) {
                const gridRow = [];
                for (let y = 0; y < 3; y++) {
                    gridRow.push(usedItems.shift() || getItemStack(null));
                }
                grid.push(gridRow);
            }
            result.push(new CraftingRecipe(grid, output, false));

        } else {
            const grid = [];
            for (let row of recipe.pattern) {
                const gridRow = [];
                for (let char of row) {
                    if (char == " ") {
                        gridRow.push(getItemStack(null));
                    } else {
                        gridRow.push(getItemStack(recipe.inputs[char]));
                    }
                }
                while (gridRow.length < 3) {
                    gridRow.push(getItemStack(null));
                }
                grid.push(gridRow);
            }
            while (grid.length < 3) {
                grid.push([getItemStack(null), getItemStack(null), getItemStack(null)]);
            }
            result.push(new CraftingRecipe(grid, output, true));
        }
    }
    return result;
}


export function parseFurnaceRecipe(data) {
    const result = [];
    for (let recipe of Object.entries(data)) {
        const input = getItemStack(recipe[0]);
        const output = getItemStack(recipe[1]);
        result.push(new FurnaceRecipe(input, output));
    }
    return result;
}
