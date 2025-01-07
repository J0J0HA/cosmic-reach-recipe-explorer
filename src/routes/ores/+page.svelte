<script>
    import Body from "../Body.svelte";
    import Header from "../Header.svelte";

    import { db } from "$lib/db";
    import { liveQuery } from "dexie";
    import OreDistribution from "../OreDistribution.svelte";

    const ores = liveQuery(async () => db.ores.toArray());
    let changeDir = $state(false);
    $effect(() => {
        const id = setTimeout(() => {
            changeDir = true;
        }, 4000);
        return () => {
            clearTimeout(id);
        };
    });
</script>

<svelte:head>
    <title>Ores - CR Recipes</title>
</svelte:head>

<Header />
<Body>
    <a href="/">Back to item list</a>
    <br /><br />

    <h2>Ores</h2>

    <div class="center">
        <!-- <SearchableItemList takeables={$ores || []} /> -->
        {#each changeDir ? ($ores || []).reverse() : $ores || [] as ore}
            {JSON.stringify(ore)}
            <OreDistribution {ore} />
        {/each}
        {#if !$ores?.length}
            <p>There are no ores.</p>
        {/if}
    </div>
</Body>

<style>
    .center {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        gap: 10px;
    }
    h2 {
        margin-bottom: 5px;
    }
</style>
