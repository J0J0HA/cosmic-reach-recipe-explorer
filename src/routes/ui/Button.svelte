<script>
import { Icon } from "svelte-icons-pack";
import { FiLoader } from "svelte-icons-pack/fi";
let {
    children,
    variant = "primary",
    inProgress = false,
    icon = undefined,
    feedbackIcon = undefined,
    feedbackColor = undefined,
    disabled = false,
    button = $bindable(),
    square = false,
    onclick = () => {},
    ...restProps
} = $props();

let feedbackVisible = $state(false);

$effect(() => {
    if (!feedbackVisible) return;
    const id = setTimeout(() => {
        feedbackVisible = false;
    }, 1500);
    return () => {
        clearTimeout(id);
    };
});
</script>

<button
    bind:this={button}
    onclick={() => {
        feedbackVisible = true;
        onclick.bind(button)();
    }}
    {...restProps}
    {disabled}
    class={variant}
    style:padding={icon && !children ? "10px 10px" : "10px 10px"}
    style:background-color={(feedbackVisible && feedbackColor) || null}
>
    {#if inProgress}
        <Icon src={FiLoader} className="loadingWheel" />
    {:else if feedbackVisible}
        <Icon src={feedbackIcon || icon} />
    {:else if icon}
        <Icon src={icon} />
    {/if}
    {#if children}
        {@render children()}
    {/if}
</button>

<style>
    button {
        all: unset;

        display: inline flex;
        gap: 5px;
        border-radius: 5px;
        padding: 5px 10px;
        margin: 5px;
        cursor: pointer;
        border: 1px solid transparent;
        align-items: center;
        justify-content: space-between;

        user-select: none;

        box-sizing: border-box;
    }

    button:focus-visible {
        outline: 2px solid color-mix(in srgb, var(--outline) 50%, transparent);
    }

    .primary {
        color: var(--bg-color);
        background-color: var(--fg-color);
        transition: 100ms background-color ease-out;
    }

    .primary:hover {
        transition: 250ms background-color ease-out;
        background-color: color-mix(in srgb, transparent 25%, var(--fg-color));
    }

    .primary:disabled {
        background-color: color-mix(in srgb, transparent 50%, var(--fg-color));
        color: color-mix(in srgb, transparent 30%, var(--bg-color));
        cursor: default;
    }

    .primary:focus-visible {
        background-color: color-mix(in srgb, transparent 35%, var(--fg-color));
    }

    .secondary {
        background-color: color-mix(in srgb, transparent 90%, var(--fg-color));
        transition: 100ms background-color ease-out;
    }

    .secondary:hover {
        background-color: color-mix(in srgb, transparent 80%, var(--fg-color));
    }

    .secondary:disabled {
        background-color: color-mix(in srgb, transparent 75%, var(--fg-color));
        border: 1px solid color-mix(in srgb, transparent 80%, var(--fg-color));
        color: color-mix(in srgb, transparent 30%, var(--fg-color));
        cursor: default;
    }

    .tertiary {
        border: 1px solid color-mix(in srgb, transparent 80%, var(--fg-color));
        transition: 100ms border-color ease-out;
    }

    .tertiary:hover {
        border-color: color-mix(in srgb, transparent 60%, var(--fg-color));
    }

    .tertiary:disabled {
        background-color: color-mix(in srgb, transparent 80%, var(--fg-color));
        border: 1px solid color-mix(in srgb, transparent 80%, var(--fg-color));
        color: color-mix(in srgb, transparent 30%, var(--fg-color));
        cursor: default;
    }

    .destructive {
        color: var(--fg-color);
        background-color: var(--destructive-color);
        transition: 100ms background-color ease-out;

        font-weight: bolder;
    }

    .destructive:hover {
        transition: 250ms background-color ease-out;
        background-color: color-mix(
            in srgb,
            var(--fg-color) 20%,
            var(--destructive-color)
        );
    }

    .destructive:disabled {
        background-color: color-mix(
            in srgb,
            white 35%,
            var(--destructive-color)
        );
        color: color-mix(in srgb, transparent 30%, var(--fg-color));
    }

    .destructive:focus-visible {
        background-color: color-mix(
            in srgb,
            transparent 40%,
            var(--destructive-color)
        );
    }

    :global(.loadingWheel) {
        animation: spin 2s linear infinite;
    }

    @media (prefers-reduced-motion) {
        button {
            transition: none !important;
        }

        :global(.loadingWheel) {
            animation: none;
        }
    }

    @keyframes spin {
        0% {
            rotate: 0deg;
        }
        100% {
            rotate: 360deg;
        }
    }
</style>
