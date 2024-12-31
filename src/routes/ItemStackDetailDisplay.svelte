<script>
import { locale } from "$lib/stores";
import InventoryDisplay from "./InventoryDisplay.svelte";
export let itemStack;

import { liveQuery } from "dexie";
$: itemName = liveQuery(async () => {
    return await itemStack.getName($locale);
});
</script>

<div class="item bordered">
    <div class="leftmost">
        <InventoryDisplay grid={[[itemStack]]} />
        <div class="details">
            <div class="name">{$itemName}</div>
            <div class="lore">{@html itemStack.lore.join("<br />")}</div>
        </div>
    </div>
    <div class="rightmost">
        <slot />
    </div>
</div>

<style>
    .item {
        display: flex;
        flex-direction: row;
        justify-content: left;
        align-items: center;
        justify-content: space-between;
        padding: 10px;
        /* margin: 5px; */
        width: calc(100% - 20px);
        max-width: 100%;
    }

    .name,
    .lore {
        margin-left: 10px;
    }

    .details {
        flex-grow: 1;
        flex-shrink: 1;
        text-overflow: ellipsis;
        overflow: hidden;
        max-width: 100%;
        display: flex;
        flex-direction: column;
    }

    .name {
        flex-grow: 1;
        flex-shrink: 1;
        text-overflow: ellipsis;
        overflow: hidden;
        max-width: 100%;
    }

    .lore {
        flex-grow: 1;
        flex-shrink: 1;
        text-overflow: ellipsis;
        overflow: hidden;
        max-width: 100%;

        font-size: 0.8em;
    }

    .leftmost {
        display: flex;
        flex-direction: row;
        justify-content: left;
        align-items: center;
        flex-grow: 1;
        flex-shrink: 1;
        /* min-width: fit-content; */
        width: 70%; /* I have no idea why this needs to be 70% and not 100%, but it works, so I won't complain. */
    }

    .rightmost {
        display: flex;
        flex-direction: column;
        justify-content: right;
        align-items: center;
        flex-grow: 0;
        flex-shrink: 0;
        align-items: end;
    }

    @media (width < 450px) {
        .item {
            flex-direction: column;
            align-items: start;
        }

        .leftmost {
            width: 100%;
        }

        .rightmost {
            align-self: flex-end;
        }
    }
</style>
