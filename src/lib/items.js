import { db } from "./db";

export class ItemStack {
    constructor(item, count, properties) {
        if (typeof item === "string")
            item = {
                async getImage() {
                    return (await db.textures.where({ subPath: "textures/blocks/debug.png", modId: "base" }).first())?.data;
                },
                fullId: item,
                isFuel: false,
                burnTime: 0,
                name: item,
                lore: ["Unknown"],
            };
        this.item = item;
        this.count = count;
        this.properties = properties || {};
    }

    async getImage(highQual) {
        if (this.item === null) return "https://placehold.co/64/0000/0000";
        return await this.item.getImage(highQual);
    }

    get fullId() {
        if (this.item === null) return "::air";
        return this.item.fullId;
    }

    get isFuel() {
        if (this.item === null) return false;
        return this.item.isFuel;
    }

    get burnTime() {
        if (this.item === null) return 0;
        return this.item.burnTime;
    }

    async getName(locale) {
        if (this.item === null) return "";
        if (!this.item.getName) return "Whut?";
        return this.properties.name || (await this.item.getName(locale));
    }

    get lore() {
        if (this.item === null) return [""];
        let lore = this.item?.lore || [];
        if (this.properties.blockState) lore.push(`Block State: ${this.properties.blockState}`);
        return lore;
    }
}
