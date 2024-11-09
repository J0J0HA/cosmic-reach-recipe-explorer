import { db } from "./db";
import { ItemStack } from "./items";

export async function getTakeable(fullId) {
    if (fullId.__require__) {
        return (await db.blockstates.toArray() || [])
            .filter((block) => block[fullId.__require__])
            .concat(
                (await db.items.toArray() || [])
                    .filter((item) => item[fullId.__require__])
            );
    }
    if (fullId.has_tag) {
        return await db.blockstates.where("data.tags").equals(fullId.has_tag).toArray() || [];
    }
    const item = await db.items.where({ fullId }).first();
    const blockState = await db.blockstates.where({ fullId }).first();
    return item || blockState;
}

export async function makeItemStack(takeable, count) {
    if (!takeable) return new ItemStack(null, 0);
    if (takeable instanceof Array) {
        return takeable.map((item) => new ItemStack(item, count || 1));
    }
    return new ItemStack(takeable, count || 1);
}