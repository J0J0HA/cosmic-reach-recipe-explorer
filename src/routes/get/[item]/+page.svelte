<script>
    import JarChooser from "../../JarChooser.svelte";
    import { getWaysToGet } from "$lib/utils";
    import { getItemStack } from "$lib/items";
    import CraftingRecipe from "../../CraftingRecipe.svelte";
    import ItemStackDetailDisplay from "../../ItemStackDetailDisplay.svelte";

    import { page } from "$app/stores";
    import FurnaceRecipe from "../../FurnaceRecipe.svelte";

    import { onchange } from "$lib/stores";
    let filtered = getWaysToGet($page.params.item);
    let itemStack = getItemStack($page.params.item);

    onchange(() => {
        filtered = getWaysToGet($page.params.item);
        itemStack = getItemStack($page.params.item);
    });
    $: filtered = getWaysToGet($page.params.item);
    $: itemStack = getItemStack($page.params.item);
</script>

<JarChooser />
<a href="/">Back to item list</a>

<p>How to get</p>
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

<style>
    .center {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 30px;
        margin-top: 30px;
    }
</style>
