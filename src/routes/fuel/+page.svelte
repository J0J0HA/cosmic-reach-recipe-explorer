<script>
    import Header from "../Header.svelte";
    import { getFuels } from "$lib/utils";
    import Body from "../Body.svelte";
    import SearchableItemList from "../SearchableItemList.svelte";

    const items = getFuels();
    console.log(1, 1, 1, items);
</script>

<svelte:head>
    <title>Fuels - CR Recipes</title>
</svelte:head>

<Header />
<Body>
    <a href="/">Back to item list</a>

    <h2>Fuels</h2>

    <div class="center">
        <SearchableItemList itemIds={items} />
        {#if items.length <= 0}
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
