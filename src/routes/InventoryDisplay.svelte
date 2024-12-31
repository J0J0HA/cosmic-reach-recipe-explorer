<script>
import { db } from "$lib/db";
import { liveQuery } from "dexie";
import ItemStackDisplay from "./ItemStackDisplay.svelte";

export let grid = [];
export let out = false;
let bgImage = liveQuery(
    () =>
        db.textures
            .where({
                modId: "base",
                subPath: out ? "textures/ui/container-output.png" : "textures/ui/container.png",
            })
            .first(),
    {
        initialValue: null,
    },
);
let hoverBgImage = liveQuery(
    () =>
        db.textures
            .where({
                modId: "base",
                subPath: out ? "textures/ui/container-output-hovered.png" : "textures/ui/container-hovered.png",
            })
            .first(),
    {
        initialValue: null,
    },
);
</script>

<table
    class="inventory-grid{out ? ' output' : ''}"
    style:--img-slot="url({$bgImage?.data || ''})"
    style:--img-slot-hover="url({$hoverBgImage?.data || ''})"
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
