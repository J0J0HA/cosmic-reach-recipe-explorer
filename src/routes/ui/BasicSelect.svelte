<script>
import { Icon } from "svelte-icons-pack";
import { FiChevronDown, FiChevronUp } from "svelte-icons-pack/fi";
import BasicButton from "./BasicButton.svelte";
import HorizontalBar from "./HorizontalBar.svelte";

let {
    options,
    placeholder = undefined,
    icon = undefined,
    disabled = false,
    value = $bindable(null),
    onchange = undefined,
    ...restProps
} = $props();

let open = $state(false);
</script>

<div
    class="all"
    tabindex="-1"
    onmouseleave={() => {
        open = false;
    }}
>
    <BasicButton
        {icon}
        class="btn"
        {disabled}
        onclick={() => {
            open = !open;
        }}
    >
        <HorizontalBar align="space-between" style="flex-grow:1;" tabindex="-1">
            <span tabindex="-1"
                >{placeholder}{placeholder && value ? ": " : ""}{options?.[
                    value
                ]}</span
            >
            <Icon src={FiChevronDown} />
        </HorizontalBar>
    </BasicButton>

    <div class="items" class:open tabindex="-1">
        <div class="spacer" tabindex="-1"></div>
        <div class="actual-items" tabindex="-1">
            {#each Object.entries(options) as [key, val] (key)}
                <button
                    class="option"
                    onclick={() => {
                        const oldValue = value;
                        value = key;
                        open = false;
                        if (onchange && oldValue !== value) onchange(key);
                    }}>{val}</button
                >
            {/each}
        </div>
    </div>
</div>

<style>
    .all {
        display: flex;
    }

    .all > :global(.btn) {
        flex-grow: 1;
    }

    .items {
        display: none;
        position: absolute;

        background-color: transparent;
        pointer-events: none;
    }

    .items.open {
        display: block;
    }

    .spacer {
        height: calc(1em + 23px);
        width: 0px;
    }

    .actual-items {
        pointer-events: all;
        position: relative;
        left: 4px;
        background-color: var(--bg-color);
        padding: 4px;
        border: 1px solid
            color-mix(in srgb, var(--fg-color) 50%, var(--bg-color));
        border-radius: 4px;
        max-height: calc(10.6 * (1em + 20px));
        overflow-y: scroll;

        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .option {
        all: unset;

        display: flex;
        gap: 6px;
        border-radius: 4px;
        padding: 6px 8px;
        /* margin: 4px; */
        cursor: pointer;
        align-items: center;
        justify-content: start;
        user-select: none;
        box-sizing: border-box;

        color: var(--fg-color);
        border: 1px solid
            color-mix(in srgb, var(--fg-color) 50%, var(--bg-color));
        background-color: color-mix(
            in srgb,
            var(--fg-color) 5%,
            var(--bg-color)
        );
        transition:
            100ms background-color ease-out,
            100ms border-color ease-out,
            100ms color ease-out;
    }

    .option:focus-visible {
        outline: 2px solid
            color-mix(in srgb, var(--outline) 50%, var(--fg-color));
        background-color: color-mix(in srgb, transparent 35%, var(--fg-color));
    }

    .option:hover {
        border-color: color-mix(in srgb, var(--fg-color) 35%, var(--bg-color));
        background-color: color-mix(
            in srgb,
            var(--fg-color) 10%,
            var(--bg-color)
        );
    }

    .option:disabled {
        border-color: color-mix(in srgb, var(--fg-color) 35%, var(--bg-color));
        background-color: color-mix(
            in srgb,
            var(--fg-color) 25%,
            var(--bg-color)
        );
        cursor: default;
    }
</style>
