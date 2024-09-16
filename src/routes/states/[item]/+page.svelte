<script>
    import Header from "../../Header.svelte";
    import { items, blocks } from "$lib/stores";
    import { getItemStack } from "$lib/utils";
    import ItemStackDetailDisplay from "../../ItemStackDetailDisplay.svelte";

    import { page } from "$app/stores";
    import SearchableItemList from "../../SearchableItemList.svelte";
    import Body from "../../Body.svelte";
    import { reload } from "$lib/stores"; // recieve changes to data
    $: filtered = Object.keys(
        Object.fromEntries(
            Object.entries($items)
                .concat(Object.entries($blocks))
                .filter(
                    (item) =>
                        item[1].id.split("[")[0] ==
                            $page.params.item.split("[")[0] &&
                        item[1].id != $page.params.item,
                ),
        ),
    ) || ($reload && false);
    $: itemStack = getItemStack($page.params.item) || ($reload && false);
</script>

<svelte:head>
    <title>Blockstates of {$page.params.item} - CR Recipes</title>
</svelte:head>

<Header />
<Body>
    <a href="/">Back to item list</a>

    <h2>Other blockstates of</h2>
    <ItemStackDetailDisplay {itemStack} />

    <div class="center">
        <SearchableItemList itemIds={filtered} />
        {#if filtered.length <= 0}
            <p>{$page.params.item} has no other blockstates.</p>
        {/if}
    </div>
</Body>

<style>
    .center {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
</style>
