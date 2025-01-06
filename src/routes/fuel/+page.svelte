<script>
import Body from "../Body.svelte";
import Header from "../Header.svelte";
import SearchableItemList from "../SearchableItemList.svelte";

import { db } from "$lib/db";
import { mergeByKey } from "$lib/utils";
import { liveQuery } from "dexie";

const fuels = liveQuery(async () => {
    const items = (await db.items.toArray()) || [];
    const blockStates = (await db.blockstates.toArray()) || [];
    const takeables = items.concat(blockStates);
    const fuels = takeables.filter((takeable) => takeable.isFuel);
    return fuels;
});
</script>

<svelte:head>
    <title>Fuels - CR Recipes</title>
</svelte:head>

<Header />
<Body>
    <a href="/">Back to item list</a>
    <br /><br />

    <h2>Fuels</h2>

    <div class="center">
        <SearchableItemList takeables={mergeByKey(
            $fuels || [],
            (obj) => obj.fullId,
            ([a, b]) => b.source === "jar",
        )} />
        {#if !$fuels?.length}
            <p>There are no fuels.</p>
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
    h2 {
        margin-bottom: 5px;
    }
</style>
