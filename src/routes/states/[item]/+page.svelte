<script>
    import Header from "../../Header.svelte";
    import { ItemStack } from "$lib/items";
    import { makeItemStack, getTakeable } from "$lib/utils";
    import ItemStackDetailDisplay from "../../ItemStackDetailDisplay.svelte";

    import { page } from "$app/stores";
    import SearchableItemList from "../../SearchableItemList.svelte";
    import Body from "../../Body.svelte";
    import { liveQuery } from "dexie";

    const itemStack = liveQuery(async () => {
        return await makeItemStack(await getTakeable($page.params.item));
    });

    const states = liveQuery(() => {
        return db.blockstates
            .where({ blockId: $page.params.item.split("[")[0] })
            .and((blockState) => blockState.fullId !== $page.params.item)
            .toArray();
    });
</script>

<svelte:head>
    <title
        >Other blockstates of {$itemStack?.name || $page.params.item} - CR Recipes</title
    >
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
        <SearchableItemList takeables={$states || []} />
        {#if !$states?.length}
            <p>{$page.params.item} has no other blockstates.</p>
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
