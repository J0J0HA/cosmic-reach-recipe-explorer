import { renderBlockModel } from "./rendering";
import { translations } from "./stores";
import { get } from 'svelte/store';

export class BlockState {
    constructor(id, properties) {
        this.id = id;
        this.properties = properties;
    }

    getName() {
        return get(translations)[this.properties.langKey || this.id.split("[")[0]] || this.id;
    }

    isFuel() {
        return this.properties.intProperties?.fuelTicks && this.properties.intProperties?.fuelTicks >= 0;
    }

    getBurnTime() {
        return this.properties.intProperties?.fuelTicks;
    }

    async getImage() {
        const blob = await renderBlockModel(this.properties.modelName);
        if (!blob) return null;
        return URL.createObjectURL(blob);
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
