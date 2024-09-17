<script>
    import { goto } from "$app/navigation";
    import { getAir } from "$lib/utils";
    import { tickTime } from "$lib/stores";

    import { reload } from "$lib/stores"; // recieve changes to data
    export let itemStack = undefined;
    $: itemStack = itemStack || getAir();
    $: itemStack = itemStack instanceof Array ? itemStack : [itemStack];
    $: currentItemStack = itemStack[$tickTime % itemStack.length] || getAir();
    $: air = currentItemStack?.item.id === "air";
</script>

<button
    class="img-wrapper{air ? ' nohover' : ''}"
    on:mouseup={(e) => {
        e.preventDefault();
        if (air) return false;
        switch (e.button) {
            case 0:
                goto(`/get/${currentItemStack.item.id}`);
                break;
            case 1:
                goto(`/states/${currentItemStack.item.id}`);
                break;
            case 2:
                goto(`/use/${currentItemStack.item.id}`);
                break;
            default:
                console.warn("How many mouse buttons do you have???");
                break;
        }
    }}
    on:mousedown={(e) => {
        e.preventDefault();
    }}
    on:contextmenu={(e) => e.preventDefault()}
>
    {#each itemStack as subitemStack, index}
        {#await subitemStack.item.getImage() then image}
            <img
                src={image}
                alt={subitemStack.getName()}
                draggable="false"
                style:display={index === $tickTime % itemStack.length
                    ? "block"
                    : "none"}
            />
        {/await}
    {/each}
    {#if !air}
        <div class="count">
            {currentItemStack.count === 1 ? "" : currentItemStack.count}
        </div>
        <div class="tooltip">
            {#if currentItemStack.count !== 1}
                {currentItemStack.count}x
            {/if}
            {currentItemStack.getName()}<br />
            <div class="tooltip-lore">
                {@html currentItemStack.getLore().join("<br />")}
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
        user-select: none;

        transition: scale 50ms ease-in;
    }

    .img-wrapper:not(.nohover):hover {
        scale: 1.1;
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
        background-color: var(--tooltip-back);
        color: var(--tooltip-text);
        border-radius: 5px;
        width: fit-content;
        text-wrap: nowrap;
    }

    .tooltip:hover {
        translate: -15px -50%;
    }

    .tooltip-lore {
        font-size: 0.8em;
        color: var(--tooltip-lore);
    }
</style>
