import { textures, translations } from "./stores";
import { get } from 'svelte/store';




export class Item {
    constructor(id, properties) {
        this.id = id;
        this.properties = properties;
    }

    isFuel() {
        return this.properties.fuelTicks && this.properties.fuelTicks >= 0;
    }

    getName() {
        return get(translations)[this.id] || this.id;
    }

    getBurnTime() {
        return this.properties.fuelTicks;
    }

    async getImage() {
        if (this.properties.__texture_override) return this.properties.__texture_override;
        const texture = get(textures)[this.properties.texture];
        return texture ? URL.createObjectURL(texture) : null;
    }

    getLore() {
        let result = [];
        result.push(this.id);
        for (let property in this.properties) {
            if (property == "stackLimit") {
                result.push(`Stack Limit: ${this.properties[property]}`);
            } else if (property == "durability") {
                result.push(`Max Durability: ${this.properties[property]}`);
            } else if (property == "toolSpeed") {
                result.push(`Tool Speed: ${this.properties[property]}`);
            } else if (property == "fuelTicks") {
                result.push(`Burns as fuel: ${this.properties[property]} ticks`);
            } //else {
            //     result += `${property}: ${this.properties[property]}<br>`;
            // }
        }
        return result;
    }
}

export class ItemStack {
    constructor(item, count, properties) {
        this.item = item;
        this.count = count;
        this.properties = properties || {};
    }

    get isFuel() {
        return this.item.isFuel;
    }

    get burnTime() {
        return this.item.burnTime;
    }

    get name() {
        return this.properties.name || this.item.name;
    }

    get lore() {
        let lore = this.item.lore;
        if (this.properties.blockState)
            lore.push(`Block State: ${this.properties.blockState}`);
        return lore;
    }
}
