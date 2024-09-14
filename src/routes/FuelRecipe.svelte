<script>
    import InventoryDisplay from "./InventoryDisplay.svelte";

    export let fuel;

    import { textures } from "$lib/stores";
    import { getItemStack } from "$lib/items";

    const air = getItemStack(null);

    let current_textures = {};

    textures.subscribe((value) => {
        current_textures = value;
    });
</script>

<div class="before-after">
    <div class="oven">
        <InventoryDisplay grid={[[air]]} />
        <img
            src={current_textures["textures/ui/progress-fuel-full.png"]}
            alt="flame"
            class="flame"
            draggable="false"
        />
        <InventoryDisplay grid={[[fuel]]} />
    </div>

    <img
        src={current_textures["textures/ui/progress-arrow-full.png"]}
        alt="makes"
        class="arrow"
        draggable="false"
    />
    <p class="note-up">
        {fuel.getBurnTime()}
    </p>
    <p class="note">ticks</p>
    <InventoryDisplay grid={[[air]]} />
</div>

<style>
    .before-after {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .note-up {
        font-family: monospace;
        position: absolute;
        font-size: 1.3rem;
        translate: 72.5px 5px;
        width: 71px;
        text-align: center;
        user-select: none;
    }

    .note {
        position: absolute;
        translate: 72.5px 32.5px;
        width: 71px;
        text-align: center;
        user-select: none;
    }

    .arrow {
        width: 50px;
        padding: 10px;
        margin-right: 20px;
        margin-left: 20px;
        image-rendering: pixelated;
    }

    .oven {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 215px;
    }

    .flame {
        height: 50px;
        padding: 10px;
        margin-top: 10px;
        margin-bottom: 10px;
        margin-left: 65px;
        margin-right: 65px;
        image-rendering: pixelated;
    }

    .before-after > * {
        flex-grow: 0;
        flex-shrink: 0;
    }
</style>
