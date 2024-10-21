<script>
    // import CraftingRecipe from "./CraftingRecipe.svelte";
    import Header from "./Header.svelte";
    import { items, blocks, loadedStore, loadedVersion } from "$lib/stores";
    import SearchableItemList from "./SearchableItemList.svelte";
    import Body from "./Body.svelte";
    $: filtered_blocks = Object.fromEntries(
        Object.entries($blocks).filter((val) => {
            return val[1].getShowInCatalog();
        }),
    );
</script>

<svelte:head>
    <title>Item overview - CR Recipes</title>
</svelte:head>

<Header />
<Body>
    {#if !$loadedStore || !$loadedVersion}
        <p>No version loaded</p>
    {:else}
    <h2>Item overview</h2>
    <SearchableItemList
        itemIds={Object.keys($items).concat(Object.keys(filtered_blocks))}
    />
    {/if}
</Body>
