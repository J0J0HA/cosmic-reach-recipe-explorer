<script>
    import Header from "../../Header.svelte";
    import { ItemStack } from "$lib/items";
    import CraftingRecipe from "../../CraftingRecipe.svelte";
    import ItemStackDetailDisplay from "../../ItemStackDetailDisplay.svelte";
    import { getTakeable, makeItemStack } from "$lib/utils";

    import { page } from "$app/stores";
    import FurnaceRecipe from "../../FurnaceRecipe.svelte";
    import FuelRecipe from "../../FuelRecipe.svelte";
    import Body from "../../Body.svelte";

    import { liveQuery } from "dexie";
    import { db } from "$lib/db";

    // $: filtered = getUsesOf($page.params.item);
    // $: itemStack = getItemStack($page.params.item);

    const itemStack = liveQuery(async () => {
        return await makeItemStack(await getTakeable($page.params.item))
    })

    const craftingRecipes = liveQuery(() =>
        db.craftingRecipes
            .where("usedItemsFullIds")
            .equals($page.params.item)
            .toArray(),
    );

    const furnaceRecipes = liveQuery(
        () =>
            db.furnaceRecipes
                .where("usedItem.fullId")
                .equals($page.params.item)
                .toArray(),
        { initialValue: [] },
    );
</script>

<svelte:head>
    <title>Uses of {$itemStack?.name || $page.params.item} - CR Recipes</title>
</svelte:head>


<Header />
<Body>
    <a href="/">Back to item list</a>
    <br><br>
    {#if !$itemStack}
        <p>Loading...</p>
    {:else}
        <h2>Uses of</h2>
        <ItemStackDetailDisplay itemStack={$itemStack} />

        <div class="center">
            {#each $furnaceRecipes || [] as recipe (recipe)}
                <!-- not recipe.id to refresh when db refetched. -->
                <FurnaceRecipe {recipe} />
            {/each}
            {#each $craftingRecipes || [] as recipe (recipe)}
                <!-- not recipe.id to refresh when db refetched. -->
                <CraftingRecipe {recipe} />
            {/each}
            {#if $itemStack?.isFuel}
                <FuelRecipe fuel={$itemStack} />
            {/if}
            {#if !$craftingRecipes?.length && !$furnaceRecipes?.length && !$itemStack?.isFuel}
                <p>{$page.params.item} has no uses.</p>
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
