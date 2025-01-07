<script>
import { db } from "$lib/db";
import { liveQuery } from "dexie";
import InventoryDisplay from "./InventoryDisplay.svelte";

let { input, fuel, output, ticks = null } = $props();

const progressArrow = liveQuery(
    () =>
        db.textures
            .where({
                modId: "base",
                subPath: "textures/ui/progress-arrow-full.png",
            })
            .first(),
    { initialValue: null },
);

const progressFlame = liveQuery(
    () =>
        db.textures
            .where({
                modId: "base",
                subPath: "textures/ui/progress-fuel-full.png",
            })
            .first(),
    { initialValue: null },
);
</script>

<div class="before-after bordered">
    <div class="oven">
        <InventoryDisplay grid={[[input]]} />
        <a href="/fuel"
            ><img
                src={$progressFlame?.data || ""}
                alt="flame"
                class="flame"
                draggable="false"
            /></a
        >
        <InventoryDisplay grid={[[fuel]]} />
    </div>

    <img
        src={$progressArrow?.data || ""}
        alt="makes"
        class="arrow"
        draggable="false"
    />
    {#if ticks}
        <p class="ticks">
            {ticks}
        </p>
        <p class="ticks-label">ticks</p>
    {/if}
    <InventoryDisplay grid={[[output]]} out={true} />
</div>

<style>
    .before-after {
        display: flex;
        flex-direction: row;
        align-items: center;

        padding: 15px;
    }

    .arrow {
        width: 50px;
        padding: 10px;
        --margin-lr: 20px;
    }

    .ticks {
        font-family: monospace;
        position: absolute;
        font-size: 1.3rem;
        translate: 75px 5px;
        width: 72.5px;
        text-align: center;
        user-select: none;
    }

    .ticks-label {
        position: absolute;
        translate: 75px 32.5px;
        width: 72.5px;
        text-align: center;
        user-select: none;
    }

    .oven {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 222.5px;
    }

    .flame {
        height: 50px;
        padding: 10px;
        --margin-tb: 10px;
        --margin-lr: 65px;
    }
</style>
