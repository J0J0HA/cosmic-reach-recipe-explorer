<script>
    import InventoryDisplay from "./InventoryDisplay.svelte";
    export let itemStack;
</script>

<div class="item bordered">
    <div class="leftmost">
        <InventoryDisplay grid={[[itemStack]]} />
        <div>
            <div class="name">{itemStack.name}</div>
            <div class="lore">{@html itemStack.lore.join("<br />")}</div>
        </div>
    </div>
    <div class="rightmost">
        <slot />
    </div>
</div>

<style>
    .item {
        display: flex;
        flex-direction: row;
        justify-content: left;
        align-items: center;
        justify-content: space-between;
        padding: 10px;
        margin: 5px;
    }

    .name,
    .lore {
        margin-left: 10px;
    }

    .name {
        text-overflow: ellipsis;
        overflow: hidden;
        width: 20rem;
    }

    .lore {
        font-size: 0.8em;
    }

    .leftmost {
        display: flex;
        flex-direction: row;
        justify-content: left;
        align-items: center;
    }

    .rightmost {
        display: flex;
        flex-direction: row;
        justify-content: right;
        align-items: center;
    }
</style>
