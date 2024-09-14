<script>
    import ItemStackDisplay from "./ItemStackDisplay.svelte";
    export let itemStack;
</script>

<div class="item">
    <div class="leftmost">
        <ItemStackDisplay {itemStack} />
        <div>
            <div class="name">{itemStack.getName()}</div>
            <div class="lore">{@html itemStack.getLore().join("<br />")}</div>
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
        border: 1px solid #dbdbdb;
        border-radius: 5px;
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
