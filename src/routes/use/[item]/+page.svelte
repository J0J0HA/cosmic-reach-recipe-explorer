<script>
    import Header from "../../Header.svelte";
    import CraftingRecipe from "../../CraftingRecipe.svelte";
    import ItemStackDetailDisplay from "../../ItemStackDetailDisplay.svelte";
    import { getTakeable, makeItemStack } from "$lib/utils";

    import { page } from "$app/stores";
    import FurnaceRecipe from "../../FurnaceRecipe.svelte";
    import FuelRecipe from "../../FuelRecipe.svelte";
    import Body from "../../Body.svelte";

    import { liveQuery } from "dexie";
    import { db } from "$lib/db";

    $: itemStack = liveQuery(async () => {
        return await makeItemStack(await getTakeable($page.params.item));
    });

    $: craftingRecipes = liveQuery(() =>
        db.craftingRecipes
            .where("usedItemsFullIds")
            .equals($page.params.item)
            .toArray(),
    );

    $: furnaceRecipes = liveQuery(
        () =>
            db.furnaceRecipes
                .where("usedItem.fullId")
                .equals($page.params.item)
                .toArray(),
        { initialValue: [] },
    );

    let name = $page.params.item;

    $: {
        const promise = $itemStack?.getName?.();
        if (promise)
            promise.then((translation) => {
                name = translation.value;
            });
    }
</script>

<svelte:head>
    <title>Uses of {name} - CR Recipes</title>
</svelte:head>

<Header />
<Body>
    <a href="/">Back to item list</a>
    <br /><br />
    {#if !$itemStack}
        <p>Loading...</p>
    {:else}
        <h2>Uses of</h2>
        <ItemStackDetailDisplay itemStack={$itemStack} />

        <div class="center">
            {#if $itemStack?.isFuel}
                <FuelRecipe fuel={$itemStack} />
            {/if}
            {#each $furnaceRecipes || [] as recipe (recipe)}
                <!-- not recipe.id to refresh when db refetched. -->
                <FurnaceRecipe {recipe} />
            {/each}
            {#each $craftingRecipes || [] as recipe (recipe)}
                <!-- not recipe.id to refresh when db refetched. -->
                <CraftingRecipe {recipe} />
            {/each}
            {#if !$craftingRecipes?.length && !$furnaceRecipes?.length && !$itemStack?.isFuel}
                <p>{name} has no uses.</p>
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
