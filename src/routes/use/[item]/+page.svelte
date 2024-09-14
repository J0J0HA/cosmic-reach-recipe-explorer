<script>
    import JarChooser from "../../JarChooser.svelte";
    import { craftingRecipes } from "$lib/stores";
    import { getItemStack } from "$lib/items";
    import CraftingRecipe from "../../CraftingRecipe.svelte";
    import ItemStackDetailDisplay from "../../ItemStackDetailDisplay.svelte";
    import { getUsesOf } from "$lib/utils";

    import { page } from "$app/stores";
    import FurnaceRecipe from "../../FurnaceRecipe.svelte";
    import FuelRecipe from "../../FuelRecipe.svelte";

    import { onchange } from "$lib/stores";
    let filtered = getUsesOf($page.params.item);
    let itemStack = getItemStack($page.params.item);

    onchange(() => {
        filtered = getUsesOf($page.params.item);
        itemStack = getItemStack($page.params.item);
    });
    $: filtered = getUsesOf($page.params.item);
    $: itemStack = getItemStack($page.params.item);
</script>

<svelte:head>
    <title>Uses of {$page.params.item} - CR Recipes</title>
</svelte:head>

<JarChooser />
<a href="/">Back to item list</a>

<p>Uses of</p>
<ItemStackDetailDisplay {itemStack} />

<div class="center">
    {#if filtered.fuel}
        <FuelRecipe fuel={itemStack} />
    {/if}
    {#each filtered.furnace as recipe}
        <FurnaceRecipe {recipe} />
    {/each}
    {#each filtered.crafting as recipe}
        <CraftingRecipe {recipe} />
    {/each}
    {#if filtered.noUse}
        <p>{$page.params.item} cannot be used for any recipes.</p>
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
