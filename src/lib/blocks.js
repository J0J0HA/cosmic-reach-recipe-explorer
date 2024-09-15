import { renderBlockModel } from "./rendering";
import { models, textures } from "./stores";

export class BlockState {
    constructor(id, properties) {
        this.id = id;
        this.properties = properties;

        this.textureCache = null;

        models.subscribe(() => {
            this.textureCache = null;
        })
        textures.subscribe(() => {
            this.textureCache = null;
        })
    }


    isFuel() {
        return this.properties.intProperties?.fuelTicks && this.properties.intProperties?.fuelTicks >= 0;
    }

    getBurnTime() {
        return this.properties.intProperties?.fuelTicks;
    }

    async getImage() {
        let blob;
        if (this.textureCache) {
            blob = this.textureCache;
        } else {
            blob = await renderBlockModel(this.properties.modelName);
        }
        this.textureCache = blob;
        if (blob) {
            return URL.createObjectURL(blob);
        }
        return null;
    }

    getShowInCatalog() {
        return !this.properties.catalogHidden;
    }

    getLore() {
        let result = [];
        for (let property in this.properties) {
            if (property == "dropId") {
                result.push(`Drops: ${this.properties[property]}`);
            } else if (property == "catalogHidden") {
                result.push(`Hidden: ${this.properties[property]}`);
            } else if (property == "tags") {
                result.push(`Tags: ${this.properties[property].join(", ")}`);
            }
        }
        for (let property in this.properties.intProperties) {
            if (property == "fuelTicks") {
                result.push(`Burns as fuel: ${this.properties.intProperties[property]} ticks`);
            }
        }
        return result;
    }
}

export function parseBlock(data) {
    const result = {};
    const baseId = data.stringId;
    for (let _ of Object.entries(data.blockStates)) {
        const blockStateId = _[0];
        const blockState = _[1];

        result[`${baseId}[${blockStateId}]`] = new BlockState(`${baseId}[${blockStateId}]`, blockState);
    }
    return result;
}