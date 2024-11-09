<script>
    import Header from "../../Header.svelte";
    import CraftingRecipe from "../../CraftingRecipe.svelte";
    import ItemStackDetailDisplay from "../../ItemStackDetailDisplay.svelte";
    import { locale } from "$lib/stores";

    import { page } from "$app/stores";
    import FurnaceRecipe from "../../FurnaceRecipe.svelte";
    import { db } from "$lib/db";
    import { makeItemStack, getTakeable } from "$lib/utils";
    import { liveQuery } from "dexie";

    import Body from "../../Body.svelte";
    import OreDistribution from "../../OreDistribution.svelte";

    $: itemStack = liveQuery(async () => {
        return await makeItemStack(await getTakeable($page.params.item));
    });

    $: craftingRecipes = liveQuery(() =>
        db.craftingRecipes
            .where("result.fullId")
            .equals($page.params.item)
            .toArray(),
    );

    $: furnaceRecipes = liveQuery(
        () =>
            db.furnaceRecipes
                .where("result.fullId")
                .equals($page.params.item)
                .toArray(),
        { initialValue: [] },
    );

    $: ores = liveQuery(() =>
        $page.params.item.split("[")[1] == "default]"
            ? db.ores
                  .where("blockId")
                  .equals($page.params.item.split("[")[0])
                  .toArray()
            : [],
    );

    const name = liveQuery(async () => {
        return await $itemStack?.getName($locale);
    });
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
