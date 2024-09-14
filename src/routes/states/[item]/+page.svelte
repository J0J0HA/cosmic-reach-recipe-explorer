<script>
    import JarChooser from "../../JarChooser.svelte";
    import { items, blocks } from "$lib/stores";
    import { getItemStack } from "$lib/items";
    import ItemStackDetailDisplay from "../../ItemStackDetailDisplay.svelte";

    import { page } from "$app/stores";
    import SearchableItemList from "../../SearchableItemList.svelte";

    let current_items = {};
    let current_blocks = {};

    items.subscribe((value) => {
        current_items = value;
    });
    blocks.subscribe((value) => {
        current_blocks = value;
    });

    import { onchange } from "$lib/stores";

    function getFiltered() {
        return Object.keys(
            Object.fromEntries(
                Object.entries(current_items)
                    .concat(Object.entries(current_blocks))
                    .filter(
                        (item) =>
                            item[1].id.split("[")[0] ==
                                $page.params.item.split("[")[0] &&
                            item[1].id != $page.params.item,
                    ),
            ),
        );
    }

    let filtered = getFiltered();
    let itemStack = getItemStack($page.params.item);

    onchange(() => {
        filtered = getFiltered();
        itemStack = getItemStack($page.params.item);
    });
    $: filtered = getFiltered();
    $: itemStack = getItemStack($page.params.item);
</script>

<svelte:head>
    <title>Blockstates of {$page.params.item} - CR Recipes</title>
</svelte:head>

<JarChooser />
<a href="/">Back to item list</a>

<p>Other blockstates of</p>
<ItemStackDetailDisplay {itemStack} />

<div class="wrapper">
    <div class="center">
        <SearchableItemList itemIds={filtered} />
        {#if filtered.length <= 0}
            <p>{$page.params.item} has no other blockstates.</p>
        {/if}
    </div>
</div>

<style>
    .wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .center {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 60%;
        /* gap: 30px;
        margin-top: 30px; */
    }
</style>
