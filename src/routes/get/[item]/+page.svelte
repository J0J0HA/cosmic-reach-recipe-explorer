<script>
    import Header from "../../Header.svelte";
    import { getWaysToGet } from "$lib/utils";
    import { getItemStack } from "$lib/items";
    import CraftingRecipe from "../../CraftingRecipe.svelte";
    import ItemStackDetailDisplay from "../../ItemStackDetailDisplay.svelte";

    import { page } from "$app/stores";
    import FurnaceRecipe from "../../FurnaceRecipe.svelte";

    import { onchange } from "$lib/stores";
    import Body from "../../Body.svelte";

    $: filtered = getWaysToGet($page.params.item);
    $: itemStack = getItemStack($page.params.item);
    onchange(() => {
        filtered = getWaysToGet($page.params.item);
        itemStack = getItemStack($page.params.item);
    });
</script>

<svelte:head>
    <title>How to make {$page.params.item} - CR Recipes</title>
</svelte:head>

<Header />

<Body>
    <a href="/">Back to item list</a>

    <h2>How to get</h2>
    <ItemStackDetailDisplay {itemStack} />

    <div class="center">
        {#each filtered.furnace as recipe}
            <FurnaceRecipe {recipe} />
        {/each}
        {#each filtered.crafting as recipe}
            <CraftingRecipe {recipe} />
        {/each}
        {#if filtered.noUse}
            <p>{$page.params.item} has no recipes.</p>
        {/if}
    </div>
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
