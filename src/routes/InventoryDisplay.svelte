<script>
    import ItemStackDisplay from "./ItemStackDisplay.svelte";
    import { textures } from "$lib/stores";
    import { getTexture } from "$lib/utils";

    export let grid = [];
    export let out = false;
</script>

<table
    class="inventory-grid{out ? ' output' : ''}"
    style="--img-slot: url({getTexture(
        $textures,
        out ? 'textures/ui/container-output.png' : 'textures/ui/container.png',
    ) || ""});--img-slot-hover: url({getTexture(
        $textures,
        out
            ? 'textures/ui/container-output-hovered.png'
            : 'textures/ui/container-hovered.png',
    ) || ""})"
>
    {#each grid as row}
        <tr>
            {#each row as cell}
                <td><ItemStackDisplay itemStack={cell} /></td>
            {/each}
        </tr>
    {/each}
</table>

<style>
    .inventory-grid {
        border-collapse: collapse;
    }

    .output {
        --slot-color: var(--slot-color--output);
    }

    td {
        background-repeat: no-repeat;
        background-size: cover;
        background-image: var(--img-slot);
        image-rendering: pixelated;
        padding: 5px;
    }

    td:hover {
        background-image: var(--img-slot-hover);
    }
</style>
