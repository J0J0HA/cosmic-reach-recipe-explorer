<script>
    import ItemStackDisplay from "./ItemStackDisplay.svelte";

    export let grid = [];
</script>

<table class="inventory-grid">
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
        background-color: #ececec;
        border-collapse: collapse;
    }

    td {
        border: 1px solid lightgray;
        padding: 5px;
    }

    td:hover {
        background-color: #f9f9f9;
    }
</style>
