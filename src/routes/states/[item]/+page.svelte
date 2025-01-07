<script>
import { ItemStack } from "$lib/items";
import { locale } from "$lib/stores";
import { mergeByKey } from "$lib/utils";
import { getTakeable, makeItemStack } from "$lib/utils";
import Header from "../../Header.svelte";
import ItemStackDetailDisplay from "../../ItemStackDetailDisplay.svelte";

import { page } from "$app/stores";
import { liveQuery } from "dexie";
import Body from "../../Body.svelte";
import SearchableItemList from "../../SearchableItemList.svelte";

let itemStack = $derived(
    liveQuery(
        async () => {
            return await makeItemStack(await getTakeable($page.params.item));
        },
        {},
        $page.params.item,
    ),
);

let states = $derived(
    liveQuery(
        () => {
            return db.blockstates
                .where({ blockId: $page.params.item.split("[")[0] })
                .and((blockState) => blockState.fullId !== $page.params.item)
                .toArray();
        },
        {},
        $page.params.item,
    ),
);

let name = $derived(
    liveQuery(
        async () => {
            return await $itemStack?.getName($locale);
        },
        {},
        [$itemStack, $locale],
    ),
);
</script>

<svelte:head>
    <title>
        Other blockstates of {$name || $itemStack?.fullId} - CR Recipes
    </title>
</svelte:head>

<Header />
<Body>
    <a href="/">Back to item list</a>
    <br /><br />

    <h2>Other blockstates of</h2>
    <ItemStackDetailDisplay
        itemStack={$itemStack || new ItemStack($page.params.item, 1)}
    />

    <div class="center">
        <SearchableItemList
            takeables={mergeByKey(
                $states || [],
                (obj) => obj.fullId,
                ([a, b]) => b.source === "jar",
            )}
        />
        {#if !$states?.length}
            <p>{$name || $itemStack?.fullId} has no other blockstates.</p>
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
