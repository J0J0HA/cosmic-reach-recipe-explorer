<script>
    // import CraftingRecipe from "./CraftingRecipe.svelte";
    import JarChooser from "./JarChooser.svelte";
    import { items, blocks } from "$lib/stores";
    import { getItemStack } from "$lib/items";
    import ItemStackDetailDisplay from "./ItemStackDetailDisplay.svelte";
    import SearchableItemList from "./SearchableItemList.svelte";

    let current_items = {};

    items.subscribe((value) => {
        current_items = value;
    });
    let current_blocks = {};

    blocks.subscribe((value) => {
        current_blocks = value;
    });
    $: filtered_blocks = Object.fromEntries(
        Object.entries(current_blocks).filter((val) => {
            return val[1].getShowInCatalog();
        }),
    );
</script>

<svelte:head>
    <title>Item overview - CR Recipes</title>
</svelte:head>

<JarChooser />

<div class="itemListWrapper">
    <div class="itemList">
        <SearchableItemList
            itemIds={Object.keys(current_items).concat(
                Object.keys(filtered_blocks),
            )}
        />
    </div>
</div>

<style>
    .itemListWrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
    }
    .itemList {
        flex-grow: 0;
        flex-shrink: 0;
        width: 60%;
        min-width: 30rem;
    }
</style>
