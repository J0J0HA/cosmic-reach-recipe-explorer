<script>
import { Icon } from "svelte-icons-pack";
import { FiLoader } from "svelte-icons-pack/fi";
let { value = $bindable(), icon = undefined, ...restProps } = $props();

let inputElement = $state();
</script>

<div
    onclick={() => {
        inputElement?.focus();
    }}
>
    {#if icon}
        <Icon src={icon} />
    {/if}
    <input type="text" bind:value {...restProps} bind:this={inputElement} />
</div>

<style>
    input {
        all: unset;
    }

    div {
        all: unset;

        display: inline flex;
        gap: 6px;
        border-radius: 4px;
        padding: 6px 8px;
        margin: 4px;
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

    div:focus-visible {
        outline: 2px solid
            color-mix(in srgb, var(--outline) 50%, var(--fg-color));
        background-color: color-mix(in srgb, transparent 35%, var(--fg-color));
    }

    div:hover {
        border-color: color-mix(in srgb, var(--fg-color) 35%, var(--bg-color));
        background-color: color-mix(
            in srgb,
            var(--fg-color) 10%,
            var(--bg-color)
        );
    }

    div:has(> :disabled) {
        border-color: color-mix(in srgb, var(--fg-color) 35%, var(--bg-color));
        background-color: color-mix(
            in srgb,
            var(--fg-color) 25%,
            var(--bg-color)
        );
        cursor: default;
    }
</style>
