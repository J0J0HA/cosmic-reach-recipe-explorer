<script>
import { Icon } from "svelte-icons-pack";
import { FiChevronDown, FiChevronUp } from "svelte-icons-pack/fi";
import Button from "./Button.svelte";

let {
    options,
    variant = "primary",
    text = undefined,
    icon = undefined,
    disabled = false,
    value = $bindable(null),
    ...restProps
} = $props();

let open = $state(false);
let delayedOpen = $state(false);
let container;
let button = $state();

let updateUntil = $derived((open || true) && Date.now() + 50);

$effect(() => {
    [updateUntil]; // dependency
    if (!container) return;
    const anim = setInterval(() => {
        container.style["padding-right"] = `${button.getBoundingClientRect().width + 10}px`;
        container.style["padding-bottom"] = `${button.getBoundingClientRect().height}px`;
        if (Date.now() > updateUntil) {
            clearInterval(anim);
            delayedOpen = open;
        }
    }, 1);
    return () => {
        clearInterval(anim);
    };
});

let search = $state();
let searchString = $state();
let filteredOptions = $derived(Object.entries(options).filter(([key, val]) => val.includes(searchString || "")));
</script>

<div class="container" bind:this={container}>
    <div class="wrapper">
        <div class="together">
            <div class="button-container" class:open>
                <Button
                    {variant}
                    bind:button
                    onclick={() => {
                        open = !open;
                    }}
                    onkeydown={() => {
                        if (!search.focus)
                        search?.focus?.();
                        search.setSelectionRange(0, search.value.length);
                    }}
                >
                    {#if open}
                        <input
                            bind:this={search}
                            bind:value={searchString}
                            type="text"
                            class="undercover"
                            placeholder={text}
                            onkeydown={(e) => {
                                console.log(e);
                                switch (e.key) {
                                    case "Enter":
                                        if (!filteredOptions) break;
                                        value = filteredOptions[0][0];
                                    case "Escape":
                                        open = false;
                                        break;
                                }
                            }}
                        />
                    {:else}
                        {options?.[value] || text}
                    {/if}
                    <Icon
                        src={open ? FiChevronUp : FiChevronDown}
                        className="icon-down"
                    />
                </Button>
            </div>

            <div class="popout-wrapper" style:display={open ? "flex" : "none"}>
                {#each filteredOptions as [key, val] (key)}
                    <Button
                        variant="secondary"
                        {disabled}
                        onclick={() => {
                            open = false;
                            value = key;
                        }}>{val}</Button
                    >
                {/each}
            </div>
        </div>
    </div>
</div>

<style>
    :global(.icon-down) {
        translate: 0 1px;
    }

    .container {
        position: relative;
    }

    .wrapper {
        position: absolute;
    }

    .together {
        width: max-content;
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: stretch;
    }

    .popout-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0;
        background-color: color-mix(
            in srgb,
            var(--bg-color) 80%,
            var(--fg-color)
        );
        border-radius: 15px;
        padding: 5px;
        max-height: 35dvh;
        overflow-y: auto;
        overflow-x: none;
    }

    .button-container {
        display: flex;
        flex-direction: row;
    }

    input.undercover {
        all: unset;
    }
</style>
