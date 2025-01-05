import { browser } from "$app/environment";
import Dexie from "dexie";
import { renderBlockModel } from "./rendering";

export const db = new Dexie("CosmicReachStore");
db.version(6).stores({
    metadata: "&key",
    translations: "++id, langKey, translationKey, source, [langKey+translationKey]",
    textures: "&[source+path], source, modId, subPath, [modId+subPath]",
    models: "&[source+path], source, modId, subPath, [modId+subPath]",
    craftingRecipes: "++id, source, modId, *usedItemsFullIds, result.fullId",
    furnaceRecipes: "++id, source, modId, usedItem.fullId, result.fullId",
    items: "&[source+path], fullId, source, modId, subId, [modId+subId]",
    blockstates:
        "&[source+path+state], fullId, blockId, source, modId, subId, state, [modId+subId], [modId+subId+state], showInCatalog, *data.tags",
    ores: "&[source+path], fullId, blockId, tagsOfBlocksToReplace, modId, subId, [modId+subId]",
    renderedModels: "&[modId+subPath], modId, subPath",
    loadedSources: "&sourceId",
});

export class BlockStateTakeableAdapter {
    async getName(locale) {
        const langKey = this.data.langKey || this.blockId;
        const translation = await db.translations
            .where({
                langKey: locale,
                translationKey: langKey,
            })
            .first();
        return translation?.value || this.fullId;
    }

    get isFuel() {
        return this.data.intProperties?.fuelTicks && this.data.intProperties?.fuelTicks >= 0;
    }

    get burnTime() {
        return this.data.intProperties?.fuelTicks;
    }

    async getImage(highQual = false) {
        const URI = await renderBlockModel(this.data.modelName, highQual);
        if (!URI) return null;
        return URI;
    }

    get lore() {
        const result = [];
        result.push(this.fullId);
        for (const property in this.data) {
            if (property === "dropId") {
                result.push(`Drops: ${this.data[property]}`);
            } else if (property === "catalogHidden") {
                result.push(`Hidden: ${this.data[property]}`);
            } else if (property === "tags") {
                result.push(`Tags: ${this.data[property].join(", ")}`);
            }
        }
        for (const property in this.data.intProperties) {
            if (property === "fuelTicks") {
                result.push(`Burns as fuel: ${this.data.intProperties[property]} ticks`);
            }
        }
        return result;
    }
}

export class ItemTakeableAdapter {
    get isFuel() {
        return this.data.fuelTicks && this.data.fuelTicks >= 0;
    }

    async getName(locale) {
        const translation = await db.translations
            .where({
                langKey: locale,
                translationKey: this.fullId,
            })
            .first();
        return translation?.value || this.fullId;
    }

    get burnTime() {
        return this.data.fuelTicks;
    }

    get lore() {
        const result = [];
        result.push(this.fullId);
        for (const property in this.data) {
            if (property === "stackLimit") {
                result.push(`Stack Limit: ${this.data[property]}`);
            } else if (property === "durability") {
                result.push(`Max Durability: ${this.data[property]}`);
            } else if (property === "toolSpeed") {
                result.push(`Tool Speed: ${this.data[property]}`);
            } else if (property === "fuelTicks") {
                result.push(`Burns as fuel: ${this.data[property]} ticks`);
            }
        }
        return result;
    }

    async getImage(highQual = false) {
        // if (this.data.__texture_override) return this.data.__texture_override;
        let [modId, subPath] = this.data.texture.split(":");
        if (subPath === undefined) {
            subPath = modId;
            modId = "base";
        }

        const texture = (await db.textures.where({ modId, subPath }).toArray())[0]?.data;
        return texture ? texture : null;
    }
}

db.items.mapToClass(ItemTakeableAdapter);
db.blockstates.mapToClass(BlockStateTakeableAdapter);

// Reset command
if (browser) {
    // I know this is silly, but it is fun.
    const randomString = `R${(Math.random() + 1).toString(36).substring(7)}`;
    window.reset = `Type '${randomString}()' and press enter to reset.`;
    window[randomString] = async () => {
        await db.delete();
        const v = JSON.parse(localStorage.getItem("loadedVersion")) || ":any";
        const l = JSON.parse(localStorage.getItem("locale")) || "";
        localStorage.clear();
        window.location = `?version=${v}&locale=${l}&forceReload=${Date.now()}`;
    };
}
