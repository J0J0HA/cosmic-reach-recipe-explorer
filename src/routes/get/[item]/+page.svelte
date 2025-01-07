<script>
import { locale } from "$lib/stores";
import CraftingRecipe from "../../CraftingRecipe.svelte";
import Header from "../../Header.svelte";
import ItemStackDetailDisplay from "../../ItemStackDetailDisplay.svelte";

import { page } from "$app/stores";
import { db } from "$lib/db";
import { getTakeable, makeItemStack } from "$lib/utils";
import { liveQuery } from "dexie";
import FurnaceRecipe from "../../FurnaceRecipe.svelte";

import Body from "../../Body.svelte";
import OreDistribution from "../../OreDistribution.svelte";

let itemStack = $derived(
    liveQuery(
        async () => {
            return await makeItemStack(await getTakeable($page.params.item));
        },
        {},
        $page.params.item,
    ),
);

let craftingRecipes = $derived(
    liveQuery(() => db.craftingRecipes.where("result.fullId").equals($page.params.item).toArray(), {}, $page.params.item),
);

let furnaceRecipes = $derived(
    liveQuery(() => db.furnaceRecipes.where("result.fullId").equals($page.params.item).toArray(), { initialValue: [] }, $page.params.item),
);

// TODO: Only if $page.params.item is default blockstate
let ores = $derived(liveQuery(() => db.ores.where("blockId").equals($page.params.item.split("[")[0]).toArray(), {}, $page.params.item));

let name = $derived(
    liveQuery(
        async () => {
            return await $itemStack?.getName($locale);
        },
        {},
        [$itemStack, $locale],
    ),
);
</script>

<svelte:head>
    <title>How to make {$name || $itemStack?.fullId} - CR Recipes</title>
</svelte:head>

<Header />
<Body>
    <a href="/">Back to item list</a>
    <br /><br />
    {#if !$itemStack}
        <p>Loading...</p>
    {:else}
        <h2>How to get</h2>
        <ItemStackDetailDisplay itemStack={$itemStack} />

        <div class="center">
            {#each $ores || [] as ore (ore)}
                <OreDistribution {ore} />
            {/each}
            {#each $furnaceRecipes || [] as recipe (recipe)}
                <!-- not recipe.id to refresh when db refetched. -->
                <FurnaceRecipe {recipe} />
            {/each}
            {#each $craftingRecipes || [] as recipe (recipe)}
                <!-- not recipe.id to refresh when db refetched. -->
                <CraftingRecipe {recipe} />
            {/each}
            {#if !$ores?.length && !$craftingRecipes?.length && !$furnaceRecipes?.length}
                <p>There are no ways to get {$name || $itemStack?.fullId}.</p>
            {/if}
        </div>
    {/if}
</Body>

<style>
    .center {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 30px;
        margin-top: 30px;
    }

    h2 {
        margin-bottom: 5px;
    }
</style>
