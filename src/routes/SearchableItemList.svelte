<script>
    import ItemStackDetailDisplay from "./ItemStackDetailDisplay.svelte";
    import { getItemStack } from "$lib/utils";
    import { BlockState } from "$lib/blocks";

    export let itemIds = [];

    let search = "";
    $: cleaned_search = search.trim().toLowerCase().split(" ");
    $: filtered_items = itemIds.filter((itemId) =>
        cleaned_search.every((word) => itemId.toLowerCase().includes(word)),
    );
</script>

<input
    type="text"
    class="search bordered"
    placeholder="Search..."
    on:change={(e) => {
        search = e.target.value;
    }}
    on:keyup={(e) => {
        search = e.target.value;
    }}
/>

<div class="results">
    {#each filtered_items as itemId (itemId)}
        <ItemStackDetailDisplay itemStack={getItemStack(itemId)}>
            <a href="/get/{itemId}">How to get</a>
            &nbsp;|&nbsp;
            <a href="/use/{itemId}">Uses</a>
            {#if getItemStack(itemId).item instanceof BlockState}
                &nbsp;|&nbsp;
                <a href="/states/{itemId}">Other states</a>
            {/if}
        </ItemStackDetailDisplay>
    {/each}
</div>

<style>
    .search {
        display: block;
        border-radius: 10px;
        padding: 10px;
        margin-top: 20px;
        margin-bottom: 20px;
        width: calc(100% - 20px);
    }
    .search:focus {
        outline: 2px solid color-mix(in srgb, var(--outline) 50%, transparent);
    }

    .search:active {
        outline: 2px solid var(--outline);
    }

    .results {
        display: flex;
        flex-direction: column;
    }
</style>
