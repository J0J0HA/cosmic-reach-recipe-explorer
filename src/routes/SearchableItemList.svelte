<script>
    import { ItemStack } from "$lib/items";
    import { locale } from "$lib/stores";
    import ItemStackDetailDisplay from "./ItemStackDetailDisplay.svelte";

    export let takeables = [];

    import { liveQuery } from "dexie";
    const names = liveQuery(async () => {
        return await Promise.all(
            takeables.map(async (takeable) => await takeable.getName($locale)),
        );
    });

    let search = "";
    $: cleaned_search = search.trim().toLowerCase().split(" ");
    $: results = takeables
        .filter((takeable, index) =>
            cleaned_search.every(
                (word) =>
                    takeable.subId.toLowerCase().includes(word) ||
                    $names[index]?.toLowerCase().includes(word),
            ),
        )
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
            style:display={results.includes(takeable.fullId) ? "block" : "none"}
        >
            <ItemStackDetailDisplay itemStack={new ItemStack(takeable, 1, {})}>
                <a href="/get/{takeable.fullId}{window?.location?.search || ''}"
                    >How to get</a
                >
                <!-- &nbsp;|&nbsp; -->
                <!-- <br>
                <br> -->
                <a href="/use/{takeable.fullId}{window?.location?.search || ''}"
                    >Uses</a
                >
                {#if takeable.state}
                    <!-- &nbsp;|&nbsp; -->
                    <!-- <br>
                    <br> -->
                    <a
                        href="/states/{takeable.fullId}{window?.location
                            ?.search || ''}">Other states</a
                    >
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
        gap: 10px;
    }
</style>
