import { browser } from "$app/environment";
import * as zip from "@zip.js/zip.js";
import * as Hjson from "hjson-devvit";
import { writable } from "svelte/store";
import { db } from "./db";
import { patch_files } from "./patches";

export function fileNamesToTree(files) {
    const result = {};
    for (const entry of Object.entries(files)) {
        const path = entry[0].split("/");
        const file = entry[1];
        let current = result;
        for (let i = 0; i < path.length - 1; i++) {
            const part = path[i];
            current[part] = current[part] || {};
            current = current[part];
        }
        current[path[path.length - 1]] = file;
    }
    return result;
}

export async function getZipFiles(file) {
    const zipReader = new zip.ZipReader(new zip.BlobReader(file));
    const entries = await zipReader.getEntries();
    return Object.fromEntries(
        entries.map((ifile) => {
            return [
                ifile.filename,
                {
                    readBlob: async () => {
                        return await ifile.getData(new zip.BlobWriter());
                    },
                    readText: async () => {
                        return await ifile.getData(new zip.TextWriter());
                    },
                    readJson: async () => {
                        const text = await ifile.getData(new zip.TextWriter());
                        return Hjson.parse(text);
                    },
                },
            ];
        }),
    );
}

export async function getFolderFiles(files) {
    return Object.fromEntries(
        Array.prototype.map.call(files, (ifile) => {
            return [
                ifile.webkitRelativePath.split("/").slice(1).join("/"),
                {
                    readBlob: async () => {
                        return ifile;
                    },
                    readText: async () => {
                        return await ifile.text();
                    },
                    readJson: async () => {
                        const text = await ifile.text();
                        return Hjson.parse(text);
                    },
                },
            ];
        }),
    );
}

if (browser) window.db = db;

const memoryFileSystem = writable({});

function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
        const a = new FileReader();
        a.onload = (e) => {
            resolve(e.target.result);
        };
        a.onerror = reject;
        a.readAsDataURL(blob);
    });
}

const V1 = {
    version: /^0\.(1|2)\.\d+[a-z]?$/,
    name: "V1",
    async loadFiles(source, files) {
        const modId = source === "jar" ? "base" : "assets";
        // await db.transaction("rw", db.textures, db.models, async () => {
        // Textures
        await this.unloadFiles(source);
        await db.textures.bulkPut(
            await Promise.all(
                Object.entries(files)
                    .filter((entry) => entry[0].startsWith("textures/") && entry[0].endsWith(".png"))
                    .map(async (entry) => ({
                        path: `${modId}/${entry[0]}`,
                        source,
                        data: (await blobToDataURL(await entry[1].readBlob())).replace("application/octet-stream", "image/png"),
                        modId: modId,
                        subPath: entry[0],
                    })),
            ),
        );

        // Models
        await db.models.bulkPut(
            await Promise.all(
                Object.entries(files)
                    .filter((entry) => entry[0].startsWith("models/") && entry[0].endsWith(".json"))
                    .map(async (entry) => {
                        const data = await entry[1].readJson();
                        if (data.textures) {
                            data.textures = Object.fromEntries(
                                Object.entries(data.textures).map(([name, sdata]) => {
                                    if (sdata.fileName) {
                                        sdata.fileName = `${modId}:textures/${entry[0].split("/")[1]}/${sdata.fileName}`;
                                    }
                                    return [name, sdata];
                                }),
                            );
                        }
                        if (data.parent) {
                            data.parent = `${modId}:models/${entry[0].split("/")[1]}/${data.parent}.json`;
                        }
                        return {
                            path: `${modId}/${entry[0]}`,
                            source,
                            data,
                            modId: modId,
                            subPath: entry[0],
                        };
                    }),
            ),
        );

        // Items
        await db.items.bulkPut(
            await Promise.all(
                Object.entries(files)
                    .filter((entry) => entry[0].startsWith("items/") && entry[0].endsWith(".json"))
                    .map(async (entry) => {
                        const data = await entry[1].readJson();
                        const subId = data.id.split(":")[1];
                        if (data.id.split(":")[0] !== modId) {
                            console.error("Mod ID mismatch in item", entry[0]);
                        }
                        return {
                            path: `${modId}/${entry[0]}`,
                            source,
                            fullId: `${modId}:${subId}`,
                            data: data.itemProperties,
                            modId,
                            subId,
                            subPath: entry[0],
                        };
                    }),
            ),
        );

        // Blocks
        await db.blockstates.bulkPut(
            (
                await Promise.all(
                    Object.entries(files)
                        .filter((entry) => entry[0].startsWith("blocks/") && entry[0].endsWith(".json"))
                        .map(async (entry) => {
                            const data = await entry[1].readJson();
                            const subId = data.stringId.split(":")[1];
                            if (data.stringId.split(":")[0] !== modId) {
                                console.error("Mod ID mismatch in block", entry[0]);
                            }
                            return await Promise.all(
                                Object.entries(data.blockStates).map(async ([blockStateName, blockStateData]) => {
                                    if (blockStateData.modelName) {
                                        blockStateData.modelName = `${modId}:models/blocks/${blockStateData.modelName}.json`;
                                    }
                                    return {
                                        path: `${modId}/${entry[0]}`,
                                        fullId: `${modId}:${subId}[${blockStateName}]`,
                                        blockId: `${modId}:${subId}`,
                                        source,
                                        data: blockStateData,
                                        modId,
                                        subId,
                                        state: blockStateName,
                                        showInCatalog: !blockStateData.catalogHidden ? 1 : 0,
                                    };
                                }),
                            );
                        }),
                )
            ).flat(),
        );

        // Recipes
        await db.craftingRecipes.bulkPut(
            (
                await Promise.all(
                    Object.entries(files)
                        .filter((entry) => entry[0].startsWith("recipes/crafting/") && entry[0].endsWith(".json"))
                        .map(async (entry) => {
                            const data = await entry[1].readJson();
                            return (await this.parseCraftingRecipe(data)).map((recipe) => ({
                                path: entry[0],
                                subPath: entry[0].split("/").slice(1).join("/"),
                                modId: entry[0].split("/")[0],
                                source,
                                ...recipe,
                                usedItemsFullIds: recipe.usedItems.map((usedItem) => usedItem.fullId),
                            }));
                        }),
                )
            ).flat(),
        );

        await db.furnaceRecipes.bulkPut(
            (
                await Promise.all(
                    Object.entries(files)
                        .filter((entry) => entry[0].startsWith("recipes/furnace") && entry[0].endsWith(".json"))
                        .map(async (entry) => {
                            const data = await entry[1].readJson();
                            return (await this.parseFurnaceRecipe(data)).map((recipe) => ({
                                path: entry[0],
                                subPath: entry[0].split("/").slice(1).join("/"),
                                modId: entry[0].split("/")[0],
                                source,
                                ...recipe,
                            }));
                        }),
                )
            ).flat(),
        );

        // });
    },
    transformFilePath(path) {
        return path;
    },
    async unloadFiles(source) {
        await db.translations.where("source").equals(source).delete();
        await db.textures.where("source").equals(source).delete();
        await db.models.where("source").equals(source).delete();
        await db.items.where("source").equals(source).delete();
        await db.blockstates.where("source").equals(source).delete();
        await db.craftingRecipes.where("source").equals(source).delete();
        await db.furnaceRecipes.where("source").equals(source).delete();
        await db.ores.where("source").equals(source).delete();
    },
    async parseFurnaceRecipe(data) {
        const result = [];
        for (const recipe of Object.entries(data)) {
            const input = {
                fullId: recipe[0],
                count: 1,
            };
            const output = {
                fullId: recipe[1],
                count: 1,
            };
            result.push({
                usedItem: input,
                result: output,
            });
        }
        return result;
    },
    async parseCraftingRecipe(data) {
        const result = [];
        for (const recipe of data.recipes) {
            const output = {
                fullId: recipe.output.item,
                count: recipe.output.amount,
            };

            if (!recipe.pattern) {
                const usedItems = [];
                for (const entry of recipe.inputs) {
                    for (const item in entry) {
                        for (let i = 0; i < entry[item]; i++)
                            usedItems.push({
                                fullId: item,
                                count: 1,
                            });
                    }
                }
                const grid = [];
                for (let x = 0; x < 3; x++) {
                    const gridRow = [];
                    for (let y = 0; y < 3; y++) {
                        gridRow.push(usedItems.shift() || null);
                    }
                    grid.push(gridRow);
                }
                result.push({
                    patternless: true,
                    usedItems,
                    grid,
                    result: output,
                });
            } else {
                const grid = [];
                const inputs = {};
                for (const [key, value] of Object.entries(recipe.inputs)) {
                    inputs[key] = value || value;
                }
                for (const row of recipe.pattern) {
                    const gridRow = [];
                    for (const char of row) {
                        if (char === " ") {
                            gridRow.push(null);
                        } else {
                            gridRow.push(inputs[char]);
                        }
                    }
                    while (gridRow.length < 3) {
                        gridRow.push(null);
                    }
                    grid.push(gridRow);
                }
                while (grid.length < 3) {
                    grid.push([null, null, null]);
                }
                result.push({
                    patternless: false,
                    usedItems: grid.flat().map((itemId) => ({
                        fullId: itemId,
                        count: 1,
                    })),
                    grid,
                    result: output,
                });
            }
        }
        return result;
    },
    async activate() {
        await this.unloadFiles("static_patch");
    },
};

const V0 = {
    ...V1,
    version: /^0\.0\.\d+[a-z]?$/,
    name: "V0",
    async loadFiles(source, files) {
        // alert("Loading pre 0.1.0 versions will result in no textures displayed, as the game used a uv map which is not implemented here.\n\nImplementation of uv support is planned but low priority.")
        V1.loadFiles(source, files);
    },
};

const V2 = {
    version: /(?:^0\.(?:3|4)\.\d+$)|(?:^0\.(?:3|4)\.2-pre(1|2|5|6|7|8|9|10)$)/,
    name: "0.3 & 0.4 (V2)",
    async unloadFiles(source) {
        await db.translations.where("source").equals(source).delete();
        await db.textures.where("source").equals(source).delete();
        await db.models.where("source").equals(source).delete();
        await db.items.where("source").equals(source).delete();
        await db.blockstates.where("source").equals(source).delete();
        await db.craftingRecipes.where("source").equals(source).delete();
        await db.furnaceRecipes.where("source").equals(source).delete();
        await db.ores.where("source").equals(source).delete();
        await db.renderedModels.clear();
    },
    async activate() {
        await this.loadFiles("static_patch", patch_files);
    },
    async loadFiles(source, files) {
        // await db.transaction("rw", db.textures, db.models, async () => {

        // Unload
        await this.unloadFiles(source);

        // Translations
        const translations = {};
        await Promise.all(
            Object.entries(files)
                .filter((entry) => entry[0].split("/")[1] === "lang" && entry[0].endsWith(".json"))
                .map(async (entry) => {
                    const language = entry[0].split("/")[2];
                    if (language.endsWith(".schema.json")) return null;
                    const data = await entry[1].readJson();
                    translations[language] = Object.assign(translations[language] || {}, data);
                }),
        );

        for (const [langKey, data] of Object.entries(translations)) {
            await db.translations.bulkPut(
                Object.entries(data).map(([translationKey, value]) => {
                    return {
                        langKey,
                        translationKey,
                        source,
                        value,
                    };
                }),
            );
        }

        if (source === "jar")
            await db.metadata.put({
                key: "languages",
                value: Object.entries(translations).map(([key, value]) => ({
                    key,
                    name: value?.metadata?.name || key,
                })),
            });

        // Textures
        await db.textures.bulkPut(
            await Promise.all(
                Object.entries(files)
                    .filter((entry) => entry[0].split("/")[1] === "textures" && entry[0].endsWith(".png"))
                    .map(async (entry) => ({
                        path: entry[0],
                        source,
                        data: (await blobToDataURL(await entry[1].readBlob())).replace("application/octet-stream", "image/png"),
                        modId: entry[0].split("/")[0],
                        subPath: entry[0].split("/").slice(1).join("/"),
                    })),
            ),
        );

        // Models
        await db.models.bulkPut(
            await Promise.all(
                Object.entries(files)
                    .filter((entry) => entry[0].split("/")[1] === "models" && entry[0].endsWith(".json"))
                    .map(async (entry) => {
                        const data = await entry[1].readJson();
                        return {
                            path: entry[0],
                            source,
                            data,
                            modId: entry[0].split("/")[0],
                            subPath: entry[0].split("/").slice(1).join("/"),
                        };
                    }),
            ),
        );

        // Items
        await db.items.bulkPut(
            await Promise.all(
                Object.entries(files)
                    .filter((entry) => entry[0].split("/")[1] === "items" && entry[0].endsWith(".json"))
                    .map(async (entry) => {
                        const data = await entry[1].readJson();
                        const modId = entry[0].split("/")[0];
                        const subId = data.id.split(":")[1];
                        if (data.id.split(":")[0] !== entry[0].split("/")[0]) {
                            console.error("Mod ID mismatch in item", entry[0]);
                        }
                        return {
                            path: entry[0],
                            source,
                            fullId: `${modId}:${subId}`,
                            data: data.itemProperties,
                            modId,
                            subId,
                            subPath: entry[0].split("/").slice(1).join("/"),
                        };
                    }),
            ),
        );

        // Blocks
        await db.blockstates.bulkPut(
            (
                await Promise.all(
                    Object.entries(files)
                        .filter((entry) => entry[0].split("/")[1] === "blocks" && entry[0].endsWith(".json"))
                        .map(async (entry) => {
                            const data = await entry[1].readJson();
                            const modId = entry[0].split("/")[0];
                            const subId = data.stringId.split(":")[1];
                            if (data.stringId.split(":")[0] !== entry[0].split("/")[0]) {
                                console.error("Mod ID mismatch in block", entry[0]);
                            }
                            return await Promise.all(
                                Object.entries(data.blockStates).map(async ([blockStateName, blockStateData]) => {
                                    return {
                                        path: entry[0],
                                        fullId: `${modId}:${subId}[${blockStateName}]`,
                                        blockId: `${modId}:${subId}`,
                                        source,
                                        data: blockStateData,
                                        modId,
                                        subId,
                                        state: blockStateName,
                                        showInCatalog: !blockStateData.catalogHidden ? 1 : 0,
                                    };
                                }),
                            );
                        }),
                )
            ).flat(),
        );

        // Recipes
        await db.craftingRecipes.bulkPut(
            (
                await Promise.all(
                    Object.entries(files)
                        .filter(
                            (entry) =>
                                entry[0].split("/")[1] === "recipes" && entry[0].split("/")[2] === "crafting" && entry[0].endsWith(".json"),
                        )
                        .map(async (entry) => {
                            const data = await entry[1].readJson();
                            return (await this.parseCraftingRecipe(data)).map((recipe) => ({
                                path: entry[0],
                                subPath: entry[0].split("/").slice(1).join("/"),
                                modId: entry[0].split("/")[0],
                                source,
                                ...recipe,
                                usedItemsFullIds: recipe.usedItems.map((usedItem) => usedItem.fullId),
                            }));
                        }),
                )
            ).flat(),
        );

        await db.furnaceRecipes.bulkPut(
            (
                await Promise.all(
                    Object.entries(files)
                        .filter(
                            (entry) =>
                                entry[0].split("/")[1] === "recipes" && entry[0].split("/")[2] === "furnace" && entry[0].endsWith(".json"),
                        )
                        .map(async (entry) => {
                            const data = await entry[1].readJson();
                            return (await this.parseFurnaceRecipe(data)).map((recipe) => ({
                                path: entry[0],
                                subPath: entry[0].split("/").slice(1).join("/"),
                                modId: entry[0].split("/")[0],
                                source,
                                ...recipe,
                            }));
                        }),
                )
            ).flat(),
        );

        // Oreloader ores
        await db.ores.bulkPut(
            await Promise.all(
                Object.entries(files)
                    .filter(
                        (entry) => entry[0].split("/")[1] === "worldgen" && entry[0].split("/")[2] === "ores" && entry[0].endsWith(".json"),
                    )
                    .map(async (entry) => {
                        const data = await entry[1].readJson();
                        return {
                            path: entry[0],
                            subPath: entry[0].split("/").slice(1).join("/"),
                            modId: entry[0].split("/")[0],
                            source,
                            blockId: data?.ore?.blockId,
                            tagsOfBlocksToReplace: data?.ore?.tagsOfBlocksToReplace,
                            data,
                        };
                    }),
            ),
        );

        await db.renderedModels.clear();
        // });
    },
    async parseFurnaceRecipe(data) {
        const result = [];
        for (const recipe of Object.entries(data)) {
            const input = {
                fullId: recipe[0],
                count: 1,
            };
            const output = {
                fullId: recipe[1],
                count: 1,
            };
            result.push({
                usedItem: input,
                result: output,
            });
        }
        return result;
    },
    async parseCraftingRecipe(data) {
        const result = [];
        for (const recipe of data.recipes) {
            const output = {
                fullId: recipe.output.item,
                count: recipe.output.amount,
            };

            if (!recipe.pattern) {
                const usedItems = [];
                for (const entry of recipe.inputs) {
                    for (const item in entry) {
                        for (let i = 0; i < entry[item]; i++)
                            usedItems.push({
                                fullId: item,
                                count: 1,
                            });
                    }
                }
                const usedItemsCopy = usedItems.concat();
                const grid = [];
                for (let x = 0; x < 3; x++) {
                    const gridRow = [];
                    for (let y = 0; y < 3; y++) {
                        gridRow.push(usedItemsCopy.shift() || null);
                    }
                    grid.push(gridRow);
                }
                result.push({
                    patternless: true,
                    usedItems,
                    grid,
                    result: output,
                });
            } else {
                const grid = [];
                const inputs = {};
                for (const [key, value] of Object.entries(recipe.inputs)) {
                    inputs[key] = value || value;
                }
                for (const row of recipe.pattern) {
                    const gridRow = [];
                    for (const char of row) {
                        if (char === " ") {
                            gridRow.push(null);
                        } else {
                            gridRow.push(inputs[char]);
                        }
                    }
                    while (gridRow.length < 3) {
                        gridRow.push(null);
                    }
                    grid.push(gridRow);
                }
                while (grid.length < 3) {
                    grid.push([null, null, null]);
                }
                result.push({
                    patternless: false,
                    usedItems: grid.flat().map((itemId) => ({
                        fullId: itemId,
                        count: 1,
                    })),
                    grid,
                    result: output,
                });
            }
        }
        return result;
    },
};

const loaders = [V0, V1, V2];

export function getLoader(version) {
    for (const mloader of loaders) {
        if (mloader.version.test(version)) {
            return mloader;
        }
    }
    return null;
}
