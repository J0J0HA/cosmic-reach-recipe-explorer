<script>
    import { ItemStack } from "$lib/items";
    import { goto } from "$app/navigation";
    export let itemStack = new ItemStack("air", 0);
    export let specialGoto = null;
    if (itemStack instanceof Array && !itemStack) {
        itemStack = new ItemStack("air", 0);
    }
    let iter = 0;
    $: iitemStack = itemStack instanceof Array ? itemStack[iter] : itemStack;
    $: air = iitemStack?.item.id === "air" || iitemStack?.count <= 0;
    setInterval(() => {
        iter = (iter + 1) % itemStack.length;
    }, 1000);
</script>

<button
    class="img-wrapper{air ? ' nohover' : ''}"
    on:click={(e) => {
        e.preventDefault();
        if (air) return false;
        goto(`/get/${iitemStack?.item.id}`);
    }}
    on:auxclick={(e) => {
        e.preventDefault();
        if (air) return false;
        goto(specialGoto || `/states/${iitemStack?.item.id}`);
    }}
    on:contextmenu={(e) => {
        e.preventDefault();
        if (air) return false;
        goto(`/use/${iitemStack?.item.id}`);
    }}
>
    <img
        src={iitemStack?.item.getImage?.()}
        alt={iitemStack?.getName()}
        draggable="false"
    />
    {#if !air}
        <div class="count">
            {iitemStack?.count == 1 ? "" : iitemStack?.count}
        </div>
        <div class="tooltip">
            {iitemStack?.count}x {iitemStack?.getName()}<br />
            <div class="tooltip-lore">
                {@html iitemStack?.getLore().join("<br />")}
            </div>
        </div>
    {/if}
</button>

<style>
    .img-wrapper {
        all: unset;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-width: 60px;
        width: fit-content;
        height: 60px;
        background-color: #dbdbdb;
        user-select: none;

        transition: scale 50ms ease-in;
    }

    .img-wrapper:not(.nohover):hover {
        scale: 1.1;
        background-color: #e6e6e6;
    }

    .img-wrapper:hover .tooltip {
        display: block;
    }

    img {
        width: 50px;
        height: 50px;
        background-color: transparent;
        image-rendering: pixelated;
        overflow: hidden;
    }

    .count {
        font-size: 1.2em;
        font-weight: bold;
        text-shadow: 0px 0px 10px black;
        position: absolute;
        translate: 25px 22.5px;
    }

    .tooltip {
        display: none;
        position: absolute;
        top: 50px;
        left: 50%;
        translate: -15px 10px;
        padding: 5px;
        background-color: #333;
        color: white;
        border-radius: 5px;
        width: fit-content;
        text-wrap: nowrap;
    }

    .tooltip:hover {
        translate: -15px -50%;
    }

    .tooltip-lore {
        font-size: 0.8em;
        color: lightgray;
    }
</style>
