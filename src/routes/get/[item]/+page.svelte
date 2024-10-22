<script>
    import Header from "../../Header.svelte";
    import { getWaysToGet, getItemStack } from "$lib/utils";
    import CraftingRecipe from "../../CraftingRecipe.svelte";
    import ItemStackDetailDisplay from "../../ItemStackDetailDisplay.svelte";

    import { page } from "$app/stores";
    import FurnaceRecipe from "../../FurnaceRecipe.svelte";
    import { db } from "$lib/db";
    import { ItemStack } from "$lib/items";
    import { liveQuery } from "dexie";

    import Body from "../../Body.svelte";
    import ItemStackDisplay from "../../ItemStackDisplay.svelte";

    // $: filtered = getWaysToGet($page.params.item);
    const item = liveQuery(
        () => db.items.where({ fullId: $page.params.item }).first(),
        { initialValue: null },
    );
    const block = liveQuery(
        () => db.blockstates.where({ fullId: $page.params.item }).first(),
        { initialValue: null },
    );
    $: itemStack =
        $item || $block
            ? new ItemStack($item || $block, 1, {})
            : new ItemStack(null);

    const craftingRecipes = liveQuery(() =>
        db.craftingRecipes
            .where("result.fullId")
            .equals($page.params.item)
            .toArray(),
    );

    const furnaceRecipes = liveQuery(
        () =>
            db.furnaceRecipes
                .where("result.fullId")
                .equals($page.params.item)
                .toArray(),
        { initialValue: [] },
    );
</script>

<svelte:head>
    <title>How to make {itemStack?.name} - CR Recipes</title>
</svelte:head>

<Header />
<a href="/">Back to item list</a>
<Body>
    {#if !itemStack}
        <p>Loading...</p>
    {:else}
        <h2>How to get</h2>
        <ItemStackDetailDisplay {itemStack} />

        <div class="center">
            {#each $furnaceRecipes || [] as recipe (recipe.id)}
                <FurnaceRecipe {recipe} />
            {/each}
            {#each $craftingRecipes || [] as recipe (recipe.id)}
                <CraftingRecipe {recipe} />
            {/each}
            {#if !$craftingRecipes?.length && !$furnaceRecipes?.length}
                <p>{$page.params.item} has no recipes.</p>
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
