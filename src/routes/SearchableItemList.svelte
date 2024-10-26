<script>
    import ItemStackDetailDisplay from "./ItemStackDetailDisplay.svelte";
    import { ItemStack } from "$lib/items";

    export let takeables = [];

    let search = "";
    $: cleaned_search = search.trim().toLowerCase().split(" ");
    $: results = takeables
        .filter((takeable) =>
            cleaned_search.every((word) =>
                takeable.subId.toLowerCase().includes(word),
            ),
        ) // https://discord.com/channels/1198501071363002408/1198501071363002410/1299698359111647263
        .map((takeable) => takeable.fullId);
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
    {#each takeables as takeable (takeable.fullId)}
    <!-- This span beacause we don't need to rerender Images then. -->
        <span
            style:display={results.includes(takeable.fullId)
                ? "block"
                : "none"}
        >
            <ItemStackDetailDisplay itemStack={new ItemStack(takeable, 1, {})}>
                <a href="/get/{takeable.fullId}">How to get</a>
                &nbsp;|&nbsp;
                <a href="/use/{takeable.fullId}">Uses</a>
                {#if takeable.state}
                    &nbsp;|&nbsp;
                    <a href="/states/{takeable.fullId}">Other states</a>
                {/if}
            </ItemStackDetailDisplay></span
        >
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
