<script>
import { locale } from "$lib/stores";
import CraftingRecipe from "../../CraftingRecipe.svelte";
import Header from "../../Header.svelte";
import ItemStackDetailDisplay from "../../ItemStackDetailDisplay.svelte";

import { page } from "$app/stores";
import { getTakeable, makeItemStack } from "$lib/utils";
import { liveQuery } from "dexie";

import Body from "../../Body.svelte";

let itemStack = $derived(
    liveQuery(
        async () => {
            return await makeItemStack(await getTakeable($page.params.item));
        },
        {},
        $page.params.item,
    ),
);

let itemName = $derived(
    liveQuery(
        async () => {
            return await $itemStack?.getName($locale);
        },
        {},
        $page.params.item,
    ),
);
let texture = $derived(
    liveQuery(
        async () => {
            return await $itemStack?.getImage?.(true);
        },
        {},
        $page.params.item,
    ),
);
</script>

<svelte:head>
    <title>Image of {$itemName || $itemStack?.fullId} - CR Recipes</title>
</svelte:head>

<Header />
<Body>
    <a href="/">Back to item list</a>
    <br /><br />
    {#if !$itemStack}
        <p>Loading...</p>
    {:else}
        <h2>Image of</h2>
        <ItemStackDetailDisplay itemStack={$itemStack} />

        <div class="center">
            {#if !$texture}
                <p>Generating Image...</p>
            {:else}
                <a href={$texture} download="{$itemName}.png">Download</a>
                <img
                    src={$texture}
                    alt={$itemName}
                    style="width: 80%; aspect-ratio: 1;"
                />
            {/if}
        </div>
    {/if}
</Body>

<style>
    .center {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 30px;
        margin-top: 30px;
    }

    h2 {
        margin-bottom: 5px;
    }
</style>
