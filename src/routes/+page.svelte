<script>
    // import CraftingRecipe from "./CraftingRecipe.svelte";
    import Header from "./Header.svelte";
    import SearchableItemList from "./SearchableItemList.svelte";
    import Body from "./Body.svelte";
    import { liveQuery } from "dexie";
    import { db } from "$lib/db.js";
    // $: filtered_blocks = Object.fromEntries(
    //     Object.entries($blocks).filter((val) => {
    //         return val[1].getShowInCatalog();
    //     }),
    // );
    const items = liveQuery(() => db.items.toArray());
    const blockStates = liveQuery(() =>
        db.blockstates.where("showInCatalog").equals(1).toArray(),
    );
</script>

<svelte:head>
    <title>Item overview - CR Recipes</title>
</svelte:head>

<Header />
<Body>
    <h2>Item overview</h2>
    <SearchableItemList takeables={($items || []).concat($blockStates || [])} />
</Body>
