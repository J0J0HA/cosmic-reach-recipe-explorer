<script>
    import ItemStackDetailDisplay from "./ItemStackDetailDisplay.svelte";
    import { getItemStack } from "$lib/items";
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
    class="search"
    placeholder="Search..."
    on:change={(e) => {
        search = e.target.value;
    }}
    on:keyup={(e) => {
        search = e.target.value;
    }}
/>

{#each filtered_items as itemId}
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

<style>
    .search {
        all: unset;
        display: block;
        border: 1px solid black;
        border-radius: 10px;
        padding: 10px;
        margin-top: 20px;
        margin-bottom: 20px;
        width: calc(100% - 20px);
    }
    .search:focus {
        outline: 2px solid rgba(0, 0, 255, 0.5);
    }

    .search:active {
        outline: 2px solid blue;
    }
</style>
