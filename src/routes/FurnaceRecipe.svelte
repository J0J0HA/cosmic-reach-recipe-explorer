<script>
export let recipe;

import { getTakeable, makeItemStack } from "$lib/utils";
import Furnace from "./Furnace.svelte";

import { liveQuery } from "dexie";

const inputItem = liveQuery(async () => {
    return await makeItemStack(await getTakeable(recipe.usedItem.fullId));
});
const outputItem = liveQuery(async () => {
    return await makeItemStack(await getTakeable(recipe.result.fullId));
});
const fuelItem = liveQuery(async () => {
    return await makeItemStack(
        await getTakeable({
            __require__: [
                { key: "isFuel", value: true },
                { key: "showInCatalog", value: 1 },
            ],
        }),
    );
});
</script>

<Furnace input={$inputItem} fuel={$fuelItem} output={$outputItem} />
