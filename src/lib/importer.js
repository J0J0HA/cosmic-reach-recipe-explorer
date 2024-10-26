import * as zip from "@zip.js/zip.js";
import { writable } from "svelte/store";
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
    version: /^0\.(0|1|2)\.\d+[a-z]?$/,
    name: "V1",
    async loadFiles(source, files) {
        // await db.transaction("rw", db.textures, db.models, async () => {
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
        // await db.models.where("source").equals(source).delete();
        // await db.models.bulkPut(
        //     await Promise.all(Object.entries(files).filter(
        //         entry => entry[0].split("/")[1] === "models" && entry[0].endsWith(".json")
        //     ).map(
        //         async entry => {
        //             const data = await entry[1].readJson();
        //             return (
        //                 {
        //                     path: entry[0],
        //                     source,
        //                     data,
        //                     modId: entry[0].split("/")[0],
        //                     subPath: entry[0].split("/").slice(1).join("/"),
        //                 }
        //             )
        //         }
        //     ))
        // );

        // // Items
        // await db.items.where("source").equals(source).delete();
        // await db.items.bulkPut(
        //     await Promise.all(Object.entries(files).filter(
        //         entry => entry[0].split("/")[1] === "items" && entry[0].endsWith(".json")
        //     ).map(
        //         async entry => {
        //             const data = await entry[1].readJson();
        //             const modId = entry[0].split("/")[0];
        //             const subId = data.id.split(":")[1];
        //             if (data.id.split(":")[0] != entry[0].split("/")[0]) {
        //                 console.error("Mod ID mismatch in item", entry[0]);
        //             }
        //             return (
        //                 {
        //                     path: entry[0],
        //                     source,
        //                     fullId: `${modId}:${subId}`,
        //                     data: data.itemProperties,
        //                     modId,
        //                     subId,
        //                     subPath: entry[0].split("/").slice(1).join("/"),
        //                 }
        //             )
        //         }
        //     ))
        // );

        // // Blocks
        // // await db.blocks.where("source").equals(source).delete();
        // await db.blockstates.where("source").equals(source).delete();
        // let a;
        // await db.blockstates.bulkPut(
        //     (await Promise.all(Object.entries(files).filter(
        //         entry => entry[0].split("/")[1] === "blocks" && entry[0].endsWith(".json")
        //     ).map(
        //         async entry => {
        //             const data = await entry[1].readJson();
        //             const modId = entry[0].split("/")[0];
        //             const subId = data.stringId.split(":")[1]
        //             if (data.stringId.split(":")[0] != entry[0].split("/")[0]) {
        //                 console.error("Mod ID mismatch in block", entry[0]);
        //             }
        //             return await Promise.all(Object.entries(data.blockStates).map(
        //                 async ([blockStateName, blockStateData]) => {
        //                     return {
        //                         path: entry[0],
        //                         fullId: `${modId}:${subId}[${blockStateName}]`,
        //                         blockId: `${modId}:${subId}`,
        //                         source,
        //                         data: blockStateData,
        //                         modId,
        //                         subId,
        //                         state: blockStateName,
        //                         showInCatalog: !blockStateData.catalogHidden ? 1 : 0,
        //                     }
        //                 }
        //             ))
        //         }
        //     ))).flat()
        // );

        // // Recipes
        // await db.craftingRecipes.where("source").equals(source).delete();
        // await db.craftingRecipes.bulkPut(
        //     (
        //         await Promise.all(Object.entries(files).filter(
        //             entry => entry[0].split("/")[1] === "recipes" && entry[0].split("/")[2] === "crafting" && entry[0].endsWith(".json")
        //         ).map(
        //             async entry => {
        //                 const data = await entry[1].readJson();
        //                 return (await this.parseCraftingRecipe(data)).map(recipe => ({
        //                     path: entry[0],
        //                     subPath: entry[0].split("/").slice(1).join("/"),
        //                     modId: entry[0].split("/")[0],
        //                     source,
        //                     ...recipe,
        //                     usedItemsFullIds: recipe.usedItems.map(usedItem => usedItem.fullId)
        //                 }));
        //             }
        //         ))
        //     ).flat()
        // );

        // await db.furnaceRecipes.where("source").equals(source).delete();
        // await db.furnaceRecipes.bulkPut(
        //     (
        //         await Promise.all(Object.entries(files).filter(
        //             entry => entry[0].split("/")[1] === "recipes" && entry[0].split("/")[2] === "furnace" && entry[0].endsWith(".json")
        //         ).map(
        //             async entry => {
        //                 const data = await entry[1].readJson();
        //                 return (await this.parseFurnaceRecipe(data)).map(recipe => ({
        //                     path: entry[0],
        //                     subPath: entry[0].split("/").slice(1).join("/"),
        //                     modId: entry[0].split("/")[0],
        //                     source,
        //                     ...recipe,
        //                 }));
        //             }
        //         ))
        //     ).flat()
        // );

        // });
    },
};

function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
        var a = new FileReader();
        a.onload = function (e) { resolve(e.target.result); }
        a.onerror = reject;
        a.readAsDataURL(blob);
    });
}

const V2 = {
    version: /(?:^0\.3\.\d+$)|(?:^0\.3\.2-pre(1|2|5|6|7|8|9|10)$)/,
    name: "0.3 (V2)",
    transformFilePath(path) {
        return path;
    },
    async loadFiles(source, files) {
        // await db.transaction("rw", db.textures, db.models, async () => {

        // Unload
        await db.renderedModels.clear();
        await db.textures.where("source").equals(source).delete();
        await db.models.where("source").equals(source).delete();
        await db.items.where("source").equals(source).delete();
        await db.blockstates.where("source").equals(source).delete();
        await db.craftingRecipes.where("source").equals(source).delete();
        await db.furnaceRecipes.where("source").equals(source).delete();

        // Textures
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
                    )
                }
            ))
        );

        // Items
        await db.items.bulkPut(
            await Promise.all(Object.entries(files).filter(
                entry => entry[0].split("/")[1] === "items" && entry[0].endsWith(".json")
            ).map(
                async entry => {
                    const data = await entry[1].readJson();
                    const modId = entry[0].split("/")[0];
                    const subId = data.id.split(":")[1];
                    if (data.id.split(":")[0] != entry[0].split("/")[0]) {
                        console.error("Mod ID mismatch in item", entry[0]);
                    }
                    return (
                        {
                            path: entry[0],
                            source,
                            fullId: `${modId}:${subId}`,
                            data: data.itemProperties,
                            modId,
                            subId,
                            subPath: entry[0].split("/").slice(1).join("/"),
                        }
                    )
                }
            ))
        );

        // Blocks
        // await db.blocks.where("source").equals(source).delete();
        let a;
        await db.blockstates.bulkPut(
            (await Promise.all(Object.entries(files).filter(
                entry => entry[0].split("/")[1] === "blocks" && entry[0].endsWith(".json")
            ).map(
                async entry => {
                    const data = await entry[1].readJson();
                    const modId = entry[0].split("/")[0];
                    const subId = data.stringId.split(":")[1]
                    if (data.stringId.split(":")[0] != entry[0].split("/")[0]) {
                        console.error("Mod ID mismatch in block", entry[0]);
                    }
                    return await Promise.all(Object.entries(data.blockStates).map(
                        async ([blockStateName, blockStateData]) => {
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
                            }
                        }
                    ))
                }
            ))).flat()
        );

        // Recipes
        await db.craftingRecipes.bulkPut(
            (
                await Promise.all(Object.entries(files).filter(
                    entry => entry[0].split("/")[1] === "recipes" && entry[0].split("/")[2] === "crafting" && entry[0].endsWith(".json")
                ).map(
                    async entry => {
                        const data = await entry[1].readJson();
                        return (await this.parseCraftingRecipe(data)).map(recipe => ({
                            path: entry[0],
                            subPath: entry[0].split("/").slice(1).join("/"),
                            modId: entry[0].split("/")[0],
                            source,
                            ...recipe,
                            usedItemsFullIds: recipe.usedItems.map(usedItem => usedItem.fullId)
                        }));
                    }
                ))
            ).flat()
        );

        await db.furnaceRecipes.bulkPut(
            (
                await Promise.all(Object.entries(files).filter(
                    entry => entry[0].split("/")[1] === "recipes" && entry[0].split("/")[2] === "furnace" && entry[0].endsWith(".json")
                ).map(
                    async entry => {
                        const data = await entry[1].readJson();
                        return (await this.parseFurnaceRecipe(data)).map(recipe => ({
                            path: entry[0],
                            subPath: entry[0].split("/").slice(1).join("/"),
                            modId: entry[0].split("/")[0],
                            source,
                            ...recipe,
                        }));
                    }
                ))
            ).flat()
        );

        // });
    },
    async parseFurnaceRecipe(data) {
        const result = [];
        for (let recipe of Object.entries(data)) {
            const input = {
                fullId: recipe[0],
                count: 1
            };
            const output = {
                fullId: recipe[1],
                count: 1
            };
            result.push({
                usedItem: input,
                result: output
            });
        }
        return result;
    },
    async parseCraftingRecipe(data) {
        const result = [];
        for (let recipe of data.recipes) {
            const output = {
                fullId: recipe.output.item,
                count: recipe.output.amount
            };

            if (!recipe.pattern) {
                const usedItems = [];
                for (let entry of recipe.inputs) {
                    for (let item in entry) {
                        for (let i = 0; i < entry[item]; i++)
                            usedItems.push({
                                fullId: item,
                                count: 1,
                            });
                    }
                }
                const grid = []
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
                    result: output
                });
            } else {
                const grid = [];
                const inputs = {};
                for (let [key, value] of Object.entries(recipe.inputs)) {
                    inputs[key] = value || value;
                }
                for (let row of recipe.pattern) {
                    const gridRow = [];
                    for (let char of row) {
                        if (char == " ") {
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
                    usedItems: grid.flat().map(itemId => ({
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

const loaders = [V1, V2];


export function getLoader(version) {
    for (let mloader of loaders) {
        if (mloader.version.test(version)) {
            return mloader;
        }
    }
    return null;
}
