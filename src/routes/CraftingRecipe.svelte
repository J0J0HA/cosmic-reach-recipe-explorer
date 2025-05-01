<script>
import InventoryDisplay from "./InventoryDisplay.svelte";

let { recipe } = $props();

import { ItemStack } from "$lib/items";
import { getTakeable, makeItemStack } from "$lib/utils";

import { db } from "$lib/db";
import { liveQuery } from "dexie";

const outputTakeable = $derived(
    liveQuery(
        async () => {
            return await makeItemStack(await getTakeable(recipe.output.fullId), recipe.output.count || 1);
        },
        {},
        [recipe.output.fullId],
    ),
);

const progressArrow = liveQuery(
    () =>
        db.textures
            .where({
                modId: "base",
                subPath: "textures/ui/progress-arrow-full.png",
            })
            .first(),
    { initialValue: null },
);

const chunkArray = (arr, size) => (arr.length > size ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)] : [arr]);

const inputItems = Promise.all(
    recipe.inputs.map(async (input) =>
        input === null ? null : await makeItemStack(await getTakeable(input.fullId || input), input.count || 1),
    ),
);
</script>

<div class="before-after bordered">
    <div class="table">
        {#await inputItems}
            <p>Loading... ({recipe.id})</p>
        {:then inputItems}
            <InventoryDisplay grid={chunkArray(inputItems, 2)} />
        {:catch error}
            <p>{error.message}</p>
        {/await}
    </div>
    <img
        src={$progressArrow?.data || ""}
        alt="makes"
        class="arrow"
        draggable="false"
    />
    <InventoryDisplay
        grid={[
            [
                new ItemStack(
                    $outputTakeable || recipe.output.fullId,
                    recipe.output.count || 1,
                ),
            ],
        ]}
        out={true}
    />
</div>

<style>
    .table {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 222.5px;
    }

    .before-after {
        display: flex;
        flex-direction: row;
        align-items: center;

        padding: 15px;
    }

    .note {
        position: absolute;
        translate: 230px 35px;
        user-select: none;
    }

    .arrow {
        width: 50px;
        padding: 10px;
        --margin-lr: 20px;
    }

    .before-after > * {
        flex-grow: 0;
        flex-shrink: 0;
    }
</style>
