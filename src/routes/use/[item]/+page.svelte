<script>
    import { locale } from "$lib/stores";
    import { getTakeable, makeItemStack } from "$lib/utils";
    import CraftingRecipe from "../../CraftingRecipe.svelte";
    import Header from "../../Header.svelte";
    import ItemStackDetailDisplay from "../../ItemStackDetailDisplay.svelte";

    import { page } from "$app/stores";
    import Body from "../../Body.svelte";
    import FuelRecipe from "../../FuelRecipe.svelte";
    import FurnaceRecipe from "../../FurnaceRecipe.svelte";

    import { db } from "$lib/db";
    import { liveQuery } from "dexie";

    let itemStack = $derived(
        liveQuery(
            async () => {
                return await makeItemStack(
                    await getTakeable($page.params.item),
                );
            },
            {},
            $page.params.item,
        ),
    );

    let craftingRecipes = $derived(
        liveQuery(
            () =>
                db.craftingRecipes
                    .where("usedItemsFullIds")
                    .equals($page.params.item)
                    .toArray(),
            {},
            $page.params.item,
        ),
    );

    let furnaceRecipes = $derived(
        liveQuery(
            () =>
                db.furnaceRecipes
                    .where("usedItem.fullId")
                    .equals($page.params.item)
                    .toArray(),
            { initialValue: [] },
            $page.params.item,
        ),
    );

    let name = liveQuery(
        async () => {
            return await $itemStack?.getName($locale);
        },
        {},
        [$itemStack, $locale],
    );
</script>

<svelte:head>
    <title>Uses of {$name || $itemStack?.fullId} - CR Recipes</title>
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
                <p>{$name || $itemStack?.fullId} has no uses.</p>
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
