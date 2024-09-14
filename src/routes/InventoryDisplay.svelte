<script>
    import ItemStackDisplay from "./ItemStackDisplay.svelte";

    export let grid = [];
    export let out = false;
</script>

<table class="inventory-grid{out ? ' output' : ''}">
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
        border: 3px solid var(--slot-color);
        box-shadow: inset 0px 0px 5px 2px color-mix(in srgb, var(--slot-color) 60%, transparent);
        padding: 5px;
    }

    td:hover {
        background-color: color-mix(in srgb, transparent 75%, var(--slot-hover-effect));
    }
</style>
