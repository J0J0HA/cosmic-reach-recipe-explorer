<script>
    export let recipe;

    import { makeItemStack, getTakeable } from "$lib/utils";
    import Furnace from "./Furnace.svelte";

    $: inputItem = (async () => {
        return await makeItemStack(await getTakeable(recipe.usedItem.fullId));
    })();
    $: outputItem = (async () => {
        return await makeItemStack(await getTakeable(recipe.result.fullId));
    })();
    $: fuelItem = (async () => {
        return await makeItemStack(
            await getTakeable({ __require__: "isFuel" }),
        );
    })();

    $: promise = Promise.all([inputItem, outputItem, fuelItem]);
</script>

{#await promise}
    <p>Loading...</p>
{:then [input, output, fuel]}
    <Furnace {input} {fuel} {output} />
{:catch error}
    <p>{error.message}</p>
{/await}
