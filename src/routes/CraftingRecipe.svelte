<script>
import InventoryDisplay from "./InventoryDisplay.svelte";

export let recipe;

import { ItemStack } from "$lib/items";
import { getTakeable, makeItemStack } from "$lib/utils";

import { db } from "$lib/db";
import { liveQuery } from "dexie";

$: resultTakeable = liveQuery(async () => {
    return await makeItemStack(await getTakeable(recipe.result.fullId));
});

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

const transformedGrid = Promise.all(
    recipe.grid.map(
        async (row) =>
            await Promise.all(
                row.map(async (cell) =>
                    cell === null ? null : await makeItemStack(await getTakeable(cell.fullId || cell, cell.count || 1)),
                ),
            ),
    ),
);
</script>

<div class="before-after bordered">
    <div class="table">
        {#await transformedGrid}
            <p>Loading... ({recipe.id})</p>
        {:then transformedGrid}
            <InventoryDisplay grid={transformedGrid} />
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
    <p class="note">
        {#if recipe.patternless}
            (shapeless)
        {/if}
    </p>
    <InventoryDisplay
        grid={[
            [
                new ItemStack(
                    $resultTakeable || recipe.result.fullId,
                    recipe.result.count || 1,
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
