import { items, blocks, textures } from "./stores";

let current_textures = {};
textures.subscribe((value) => {
    current_textures = value;
})

export class Item {
    constructor(id, properties) {
        this.id = id;
        this.properties = properties;
    }

    isFuel() {
        return this.properties.fuelTicks && this.properties.fuelTicks >= 0;
    }

    getBurnTime() {
        return this.properties.fuelTicks;
    }

    async getImage() {
        if (this.properties.__texture_override) return this.properties.__texture_override;
        return current_textures[this.properties.texture] ? URL.createObjectURL(current_textures[this.properties.texture]) : null;
    }

    getLore() {
        let result = [];
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

function getUnknownItem(forId, count, props) {
    return new ItemStack(new Item(forId, {}), count, { name: `Unknown (${forId})`, ...props });
}

function findMatchingItems(condition) {
    if (condition.id) {
        return [condition.id];
    } else if (condition.__require__) {
        return Object.entries({ ...current_blocks, ...current_items }).filter(entry => {
            return entry[1][condition.__require__]();
        }).map(entry => entry[0])
    } else if (condition.and) {
        const tests = [];
        for (let test of condition.and) {
            tests.push(findMatchingItems(test));
        }
        return tests.reduce((prev, cur) => {
            return prev ? prev.filter((value) => cur.includes(value)) : cur;
        }, Object.keys({ ...current_blocks, ...current_items }))
    } else if (condition.has_tag) {
        return Object.values(current_blocks).filter((block) => block.properties.tags?.includes(condition.has_tag)).map((block) => block.id);
    } else {
        console.error(condition)
        throw new Error(condition);
    }
}

function getItemFilter(filter, count, props) {
    return findMatchingItems(filter).map((item) => getItemStack(item, count, props));
}

const air = new Item("air", { __texture_override: "https://placehold.co/64/0000/0000" });
export class ItemStack {
    constructor(item, count, properties) {
        this.item = item;
        this.count = count;
        this.properties = properties || {};
    }

    isFuel() {
        return this.item.isFuel();
    }

    getBurnTime() {
        return this.item.getBurnTime();
    }

    getName() {
        return this.properties.name || this.item.id;
    }

    getLore() {
        let lore = this.item.getLore();
        if (this.properties.blockState)
            lore.push(`Block State: ${this.properties.blockState}`);
        return lore;
    }
}

export function parseItem(data) {
    let item = new Item(data.id, data.itemProperties);
    return item;
}

let current_items = [];

items.subscribe((value) => {
    current_items = value;
})
let current_blocks = [];

blocks.subscribe((value) => {
    current_blocks = value;
})

export function getItemStack(item, count = 1, properties = {}) {
    if (item === null) return new ItemStack(air, 0);
    if (!(typeof item === 'string' || item instanceof String)) return getItemFilter(item, count, properties);
    if (current_items[item]) {
        return new ItemStack(current_items[item], count, properties);
    } else if (current_blocks[item]) {
        return new ItemStack(current_blocks[item], count, properties);
    } else { return getUnknownItem(item, count, properties); }
}

export function getItemsAsStacks() {
    let itemStacks = [];
    for (let item in current_items) {
        itemStacks.push(getItemStack(item));
    }
    return itemStacks;
}