export class BlockState {
    constructor(id, properties) {
        this.id = id;
        this.properties = properties;
    }


    isFuel() {
        return this.properties.intProperties?.fuelTicks && this.properties.intProperties?.fuelTicks >= 0;
    }

    getBurnTime() {
        return this.properties.intProperties?.fuelTicks;
    }

    getImage() {
        return "https://placehold.co/64/0000/000F";// || this.properties.modelName;
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