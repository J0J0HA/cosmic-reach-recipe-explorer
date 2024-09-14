<script>
    import InventoryDisplay from "./InventoryDisplay.svelte";

    export let recipe;

    import { textures } from "$lib/stores";
    import { getItemStack } from "$lib/items";

    let current_textures = {};

    textures.subscribe((value) => {
        current_textures = value;
    });
</script>

<div class="before-after">
    <div class="oven">
        <InventoryDisplay grid={[[recipe.input]]} />
        <img
            src={current_textures["textures/ui/progress-fuel-full.png"]}
            alt="flame"
            class="flame"
            draggable="false"
        />
        <InventoryDisplay grid={[[getItemStack({ __require__: "isFuel" })]]} />
    </div>

    <img
        src={current_textures["textures/ui/progress-arrow-full.png"]}
        alt="makes"
        class="arrow"
        draggable="false"
    />
    <InventoryDisplay grid={[[recipe.output]]} />
</div>

<style>
    .before-after {
        display: flex;
        flex-direction: row;
        align-items: center;
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
