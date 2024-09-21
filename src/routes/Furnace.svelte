<script>
    import InventoryDisplay from "./InventoryDisplay.svelte";
    import { goto } from "$app/navigation";

    export let input;
    export let fuel;
    export let output;
    export let ticks = null;

    import { getTexture } from "$lib/utils";
</script>

<div class="before-after bordered">
    <div class="oven">
        <InventoryDisplay grid={[[input]]} />
        <a href="/fuel"
            ><img
                src={getTexture("textures/ui/progress-fuel-full.png")}
                alt="flame"
                class="flame"
                draggable="false"
            /></a
        >
        <InventoryDisplay grid={[[fuel]]} />
    </div>

    <img
        src={getTexture("textures/ui/progress-arrow-full.png")}
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
