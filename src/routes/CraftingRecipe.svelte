<script>
    import InventoryDisplay from "./InventoryDisplay.svelte";

    export let recipe;

    import { textures } from "$lib/stores";

    let current_textures = {};

    textures.subscribe((value) => {
        current_textures = value;
    });
</script>

<div class="before-after">
    <InventoryDisplay grid={recipe.grid} />
    <img
        src={current_textures["textures/ui/progress-arrow-full.png"]}
        alt="makes"
        class="arrow"
        draggable="false"
    />
    <p class="note">
        {#if !recipe.ordered}
            (shapeless)
        {/if}
    </p>
    <InventoryDisplay grid={[[recipe.output]]} />
</div>

<style>
    .before-after {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .note {
        position: absolute;
        translate: 230px 35px;
        user-select: none;
    }

    .arrow {
        width: 50px;
        padding: 10px;
        margin-right: 20px;
        margin-left: 20px;
        image-rendering: pixelated;
    }

    .before-after > * {
        flex-grow: 0;
        flex-shrink: 0;
    }
</style>
