<script>
    import { getTakeable, makeItemStack } from "$lib/utils";
    import Furnace from "./Furnace.svelte";
    import { liveQuery } from "dexie";

    let { recipe } = $props();

    let inputItem = $derived(
        liveQuery(
            async () => {
                return await makeItemStack(
                    await getTakeable(recipe.usedItem.fullId),
                );
            },
            {},
            [recipe.usedItem.fullId],
        ),
    );
    const outputItem = $derived(liveQuery(
        async () => {
            return await makeItemStack(await getTakeable(recipe.result.fullId));
        },
        {},
        [recipe.usedItem.fullId],
    ));
    const fuelItem = liveQuery(
        async () => {
            return await makeItemStack(
                await getTakeable({
                    __require__: [
                        { key: "isFuel", value: true },
                        { key: "showInCatalog", value: 1 },
                    ],
                }),
            );
        }
    );
</script>

<Furnace input={$inputItem} fuel={$fuelItem} output={$outputItem} />
