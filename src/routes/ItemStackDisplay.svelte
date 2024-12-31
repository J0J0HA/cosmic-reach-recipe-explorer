<script>
import { goto } from "$app/navigation";
import { ItemStack } from "$lib/items";
import { locale, tickTime } from "$lib/stores";
import { liveQuery } from "dexie";

export let itemStack = undefined;
$: itemStack = itemStack || new ItemStack(null);
$: itemStack = Array.isArray(itemStack) ? itemStack : [itemStack];
$: currentItemStack = itemStack[$tickTime % itemStack.length] || new ItemStack(null);
$: air = currentItemStack?.item === null;

$: names = liveQuery(async () => {
    return await Promise.all(
        itemStack.map(async (subItemStack) => {
            return await subItemStack?.getName?.($locale);
        }),
    );
});
$: currentItemStackName = $names?.[$tickTime % itemStack.length] || currentItemStack.fullId;

let startedTouch = 0;

$: images = liveQuery(async () => {
    return await Promise.all(
        itemStack.map(async (subItemStack) => {
            return await subItemStack?.getImage?.();
        }),
    );
});
</script>

<button
    class="img-wrapper{air ? ' nohover' : ''}"
    on:touchstart={(e) => (startedTouch = Date.now())}
    on:touchend={(e) => {
        const touchedFor = Date.now() - startedTouch;

        if (touchedFor > 250) {
            goto(`/use/${currentItemStack.item.fullId}`);
        } else {
            goto(`/get/${currentItemStack.item.fullId}`);
        }
    }}
    on:mouseup={(e) => {
        e.preventDefault();
        if (air) return false;
        switch (e.button) {
            case 0:
                goto(
                    `/get/${currentItemStack.item.fullId}`,
                );
                break;
            case 1:
                goto(
                    `/states/${currentItemStack.item.fullId}`,
                );
                break;
            case 2:
                goto(
                    `/use/${currentItemStack.item.fullId}`,
                );
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
    {#each itemStack as subItemStack, index}
        <!-- {#await subitemStack.getImage() then image} -->
        <img
            src={$images?.[index]}
            alt={$names?.[index] || subItemStack.fullId}
            draggable="false"
            style:display={index === $tickTime % itemStack.length
                ? "block"
                : "none"}
        />
        <!-- {/await} -->
    {/each}
    {#if !air}
        <div class="count">
            {currentItemStack.count === 1 ? "" : currentItemStack.count}
        </div>
        <div class="tooltip">
            {#if currentItemStack.count !== 1}
                {currentItemStack.count}x
            {/if}
            {currentItemStackName}<br />
            <div class="tooltip-lore">
                {@html currentItemStack.lore.join("<br />")}<br>
                <a href="/image/{currentItemStack.item.fullId}">Generate image</a>
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
        z-index: 9988;
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
        z-index: 9999;
    }

    .tooltip:hover {
        translate: -15px -50%;
    }

    .tooltip-lore {
        font-size: 0.8em;
        color: var(--tooltip-lore);
    }
</style>
