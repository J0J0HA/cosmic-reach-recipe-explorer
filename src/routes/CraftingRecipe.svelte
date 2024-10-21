<script>
    import InventoryDisplay from "./InventoryDisplay.svelte";

    export let recipe;

    import { getTexture } from "$lib/utils";
</script>

<div class="before-after bordered">
    <div class="table">
        <InventoryDisplay grid={recipe.grid} />
    </div>
    <img
        src={getTexture("textures/ui/progress-arrow-full.png")}
        alt="makes"
        class="arrow"
        draggable="false"
    />
    <p class="note">
        {#if !recipe.ordered}
            (shapeless)
        {/if}
    </p>
    <InventoryDisplay grid={[[recipe.output]]} out={true} />
</div>

<style>
    .table {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 222.5px;
    }

    .before-after {
        display: flex;
        flex-direction: row;
        align-items: center;

        padding: 15px;
    }

    .note {
        position: absolute;
        translate: 230px 35px;
        user-select: none;
    }

    .arrow {
        width: 50px;
        padding: 10px;
        --margin-lr: 20px;
    }

    .before-after > * {
        flex-grow: 0;
        flex-shrink: 0;
    }
</style>
