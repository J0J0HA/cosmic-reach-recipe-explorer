<script>
import { ItemStack } from "$lib/items";
import { locale } from "$lib/stores";
import { setURLParams } from "$lib/urlset";
import ItemStackDetailDisplay from "./ItemStackDetailDisplay.svelte";

import { liveQuery } from "dexie";
let { takeables = [], key = "search" } = $props();
const names = $derived(
    liveQuery(
        async () => {
            return await Promise.all(takeables.map(async (takeable) => await takeable.getName($locale)));
        },
        {},
        [takeables, $locale],
    ),
);

const initialParams = new URLSearchParams(window.location.search);
let first = $state(true);
let search = $state(initialParams.get("search") || "");
$effect(() => {
    if (first) {
        first = false;
    } else {
        const params = new URLSearchParams(window.location.search);
        params.set(key, search);
        if (!search) params.delete(key);
        setURLParams(params);
    }
});
let cleaned_search = $derived(search.trim().toLowerCase().split(" "));
let results = $derived(
    takeables
        .filter((takeable, index) =>
            cleaned_search.every((word) => takeable.fullId.toLowerCase().includes(word) || $names?.[index]?.toLowerCase().includes(word)),
        )
        .map((takeable) => takeable.fullId),
);
</script>

<input
    type="text"
    class="search bordered"
    placeholder="Search..."
    bind:value={search}
/>

<div class="results">
    {#each takeables as takeable (takeable.fullId)}
        <!-- This span beacause we don't need to rerender Images then. -->
        <span
            style:display={results.includes(takeable.fullId) ? "block" : "none"}
        >
            <ItemStackDetailDisplay itemStack={new ItemStack(takeable, 1, {})}>
                <a href="/get/{takeable.fullId}">How to get</a>
                <!-- &nbsp;|&nbsp; -->
                <!-- <br>
                <br> -->
                <a href="/use/{takeable.fullId}">Uses</a>
                {#if takeable.state}
                    <!-- &nbsp;|&nbsp; -->
                    <!-- <br>
                    <br> -->
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
        gap: 10px;
    }
</style>
