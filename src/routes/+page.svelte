<script>
import { db } from "$lib/db.js";
import { mergeByKey } from "$lib/utils";
import { liveQuery } from "dexie";
import Body from "./Body.svelte";
import Header from "./Header.svelte";
import SearchableItemList from "./SearchableItemList.svelte";

const items = liveQuery(() => db.items.toArray());
const blockStates = liveQuery(() => db.blockstates.where("showInCatalog").equals(1).toArray());
</script>

<svelte:head>
    <title>Item overview - CR Recipes</title>
</svelte:head>

<Header />
<Body>
    <h2>Item overview</h2>
    <SearchableItemList
        takeables={mergeByKey(
            ($items || []).concat($blockStates || []),
            (obj) => obj.fullId,
            ([a, b]) => b.source === "jar",
        )}
    />
</Body>
