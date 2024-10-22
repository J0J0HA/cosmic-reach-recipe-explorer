<script>
    import InventoryDisplay from "./InventoryDisplay.svelte";

    export let recipe;

    import { getTakeable, makeItemStack } from "$lib/utils";
    import { ItemStack } from "$lib/items";

    import { db } from "$lib/db";
    import { liveQuery } from "dexie";
    import { get } from "svelte/store";

    const resultItem = liveQuery(
        () => db.items.where({ fullId: recipe.result.fullId }).first(),
        { initialValue: null },
    );
    const resultBlock = liveQuery(
        () => db.blockstates.where({ fullId: recipe.result.fullId }).first(),
        { initialValue: null },
    );

    $: result = resultItem || resultBlock;

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
                        cell === null
                            ? null
                            : await makeItemStack(await getTakeable(cell)),
                    ),
                ),
        ),
    );

    $: a = setTimeout(async () => await transformedGrid, 0)
</script>

<div class="before-after bordered">
    {#if $result}
        <div class="table">
            {#await transformedGrid}
                <p>Loading...</p>
            {:then transformedGrid}
                <InventoryDisplay grid={transformedGrid} />
            {:catch error}
                <p>{error.message}</p>
            {/await}
            <!-- grid -->
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
            grid={[[new ItemStack($result, recipe.result.count)]]}
            out={true}
        />
    {:else}
        <p>Loading...</p>
    {/if}
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
