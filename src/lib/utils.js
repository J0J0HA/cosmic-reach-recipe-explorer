import { db } from "./db";
import { ItemStack } from "./items";

export async function getTakeable(fullId) {
    if (fullId.__require__) {
        return mergeByKey(
            ((await db.blockstates.toArray()) || [])
                .filter((block) =>
                    fullId.__require__.every((condition) =>
                        condition.value ? block[condition.key] === condition.value : block[condition.key],
                    ),
                )
                .concat(((await db.items.toArray()) || []).filter((item) => item[fullId.__require__])),
            (obj) => obj.fullId,
            ([a, b]) => b.source === "jar",
        );
    }
    if (fullId.has_tag) {
        return mergeByKey(
            (await db.blockstates.where("data.tags").equals(fullId.has_tag).toArray()) || [],
            (obj) => obj.fullId,
            ([a, b]) => b.source === "jar",
        );
    }
    const item = await db.items.where({ fullId }).toArray();
    const blockState = await db.blockstates.where({ fullId }).toArray();
    return mergeByKey(
        item.concat(blockState),
        (obj) => obj.fullId,
        ([a, b]) => b.source === "jar",
    )[0];
}

export async function makeItemStack(takeable, count) {
    if (!takeable) return new ItemStack(null, 0);
    if (Array.isArray(takeable)) {
        return takeable.map((item) => new ItemStack(item, count || 1));
    }
    return new ItemStack(takeable, count || 1);
}

export function filterUnique(array, key) {
    return array.reduce((foundElements, itemToCheck) => {
        if (foundElements.some((existingElement) => existingElement[key] === itemToCheck[key])) arr.push(itemToCheck);
        return foundElements;
    }, []);
}

// it works, at least.
function merge(ia, ib, prioA, deepMerge) {
    let [a, b] = [ia, ib];
    if (prioA) [a, b] = [b, a]; // swap to prio a
    if (typeof a !== typeof b) throw new Error("Items to be merged must be of same type.");
    if (typeof a === "number" && typeof b === "number") return b;
    if ((typeof a === "string" || a instanceof String) && (typeof b === "string" || b instanceof String)) return b;
    if (deepMerge) {
        // Arrays are combined
        if (Array.isArray(a) && Array.isArray(b)) return a.concat(b);
        // Objects are merged, b overrides a.
        const startObj = {};
        // carry over prototype (ia is always prioritized because reduce is used and ia is older, ib may not have prototype)
        Object.setPrototypeOf(startObj, Object.getPrototypeOf(ia));
        return Object.entries(a)
            .concat(Object.entries(b))
            .reduce((merged, [key, toMerge]) => {
                if (!merged[key]) merged[key] = toMerge;
                else merged[key] = merge(merged[key], toMerge);
                return merged;
            }, startObj);
    }
    return b;
}

export function mergeByKey(array, key, prioritizeA, deepMerge = true) {
    return Object.values(
        array.reduce((mergedItems, itemToMerge) => {
            const keyVal = key(itemToMerge);
            if (!mergedItems[keyVal]) mergedItems[keyVal] = itemToMerge;
            else mergedItems[keyVal] = merge(mergedItems[keyVal], itemToMerge, prioritizeA, deepMerge);
            return mergedItems;
        }, {}),
    );
}
