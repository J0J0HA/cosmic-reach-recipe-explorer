<script>
import { goto } from "$app/navigation";
import { ItemStack } from "$lib/items";
import { locale, tickTime } from "$lib/stores";
import { liveQuery } from "dexie";

let { itemStack: initialItemStack = undefined } = $props();

let finalItemStack = $derived.by(() => {
    const itemStack = initialItemStack || new ItemStack(null);
    return Array.isArray(itemStack) ? itemStack : [itemStack];
});
let currentItemStack = $derived(finalItemStack[$tickTime % finalItemStack.length] || new ItemStack(null));
let isAir = $derived(currentItemStack?.item === null);

let names = $derived(
    liveQuery(
        async () => {
            return await Promise.all(
                finalItemStack.map(async (subItemStack) => {
                    return await subItemStack?.getName?.($locale);
                }),
            );
        },
        {},
        [finalItemStack, $locale],
    ),
);
let currentItemStackName = $derived($names?.[$tickTime % finalItemStack.length] || currentItemStack.fullId);

let startedTouch = $state(0);

let images = $derived(
    liveQuery(
        async () => {
            return await Promise.all(
                finalItemStack.map(async (subItemStack) => {
                    return await subItemStack?.getImage?.();
                }),
            );
        },
        {},
        [finalItemStack],
    ),
);
</script>

<button
    class="img-wrapper{isAir ? ' nohover' : ''}"
    ontouchstart={(e) => (startedTouch = Date.now())}
    ontouchend={(e) => {
        const touchedFor = Date.now() - startedTouch;

        if (touchedFor > 250) {
            goto(`/use/${currentItemStack.item.fullId}`);
        } else {
            goto(`/get/${currentItemStack.item.fullId}`);
        }
    }}
    onmouseup={(e) => {
        e.preventDefault();
        if (isAir) return false;
        switch (e.button) {
            case 0:
                goto(`/get/${currentItemStack.item.fullId}`);
                break;
            case 1:
                goto(`/states/${currentItemStack.item.fullId}`);
                break;
            case 2:
                goto(`/use/${currentItemStack.item.fullId}`);
                break;
            default:
                console.warn("How many mouse buttons do you have???");
                break;
        }
    }}
    onmousedown={(e) => {
        e.preventDefault();
    }}
    oncontextmenu={(e) => e.preventDefault()}
>
    {#each finalItemStack as subItemStack, index}
        <!-- {#await subitemStack.getImage() then image} -->
        <img
            src={$images?.[index]}
            alt={subItemStack.fullId === "::air"
                ? ""
                : $names?.[index] || subItemStack.fullId}
            draggable="false"
            style:display={index === $tickTime % finalItemStack.length
                ? "block"
                : "none"}
        />
        <!-- {/await} -->
    {/each}
    {#if !isAir}
        <div class="count">
            {currentItemStack.count === 1 ? "" : currentItemStack.count}
        </div>
        <div class="tooltip">
            {#if currentItemStack.count !== 1}
                {currentItemStack.count}x
            {/if}
            {currentItemStackName}<br />
            <div class="tooltip-lore">
                {@html currentItemStack.lore.join("<br />")}<br />
                <a href="/image/{currentItemStack.item.fullId}"
                    >Generate image</a
                >
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
