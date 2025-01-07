<script>
import { Icon } from "svelte-icons-pack";
import { FiAlertCircle, FiCheck, FiLoader } from "svelte-icons-pack/fi";
let { children, icon, onclick: onclickListener, class: klass, disabled, feedbackFor, ...restProps } = $props();

let square = $derived(!children);
let state = $state("idle");

let currentIcon = $derived(
    icon
        ? {
              inProgress: FiLoader,
              succeeded: FiCheck,
              failed: FiAlertCircle,
          }[state] || icon
        : null,
);

let taskEnded = $state(0);

$effect(() => {
    taskEnded; // dependency

    let id;
    if (["failed", "succeeded"].includes(state)) {
        id = setTimeout(() => {
            if (["failed", "succeeded"].includes(state)) {
                state = "idle";
            }
        }, feedbackFor);
    }

    return () => {
        if (id) clearTimeout(id);
    };
});
</script>

<button
    class={state + " " + klass}
    disabled={disabled || state === "inProgress"}
    {...restProps}
    onclick={() => {
        if (!onclickListener) return;
        let perhapsPromise = onclickListener();
        if (!(perhapsPromise instanceof Promise)) return;
        state = "inProgress";
        perhapsPromise
            .then(() => {
                state = "succeeded";
                taskEnded = Date.now();
            })
            .catch(() => {
                state = "failed";
                taskEnded = Date.now();
            });
    }}
    onmouseenter={function () {
        if (this.disabled) return;
        if (["failed", "succeeded"].includes(state)) state = "idle";
    }}
    class:square
>
    {#if currentIcon}
        <Icon src={currentIcon} className="icon" />
    {/if}
    {#if children}
        {@render children()}
    {/if}
</button>

<style>
    button {
        all: unset;

        display: flex;
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

    button.square {
        padding: 8px 8px;
    }

    button:focus-visible {
        outline: 2px solid
            color-mix(in srgb, var(--outline) 50%, var(--fg-color));
        background-color: color-mix(in srgb, transparent 35%, var(--fg-color));
    }

    button:hover {
        border-color: color-mix(in srgb, var(--fg-color) 35%, var(--bg-color));
        background-color: color-mix(
            in srgb,
            var(--fg-color) 10%,
            var(--bg-color)
        );
    }

    button:disabled {
        border-color: color-mix(in srgb, var(--fg-color) 35%, var(--bg-color));
        background-color: color-mix(
            in srgb,
            var(--fg-color) 25%,
            var(--bg-color)
        );
        cursor: default;
    }

    button:disabled:not(.inProgress) {
        color: color-mix(in srgb, var(--fg-color) 80%, var(--bg-color));
    }

    @media (prefers-reduced-motion) {
        button {
            transition: none !important;
        }

        :global(.loadingWheel) {
            animation: none;
        }
    }

    button.succeeded {
        --fg-color: var(--succeeded);
        background-color: color-mix(
            in srgb,
            var(--fg-color) 10%,
            var(--bg-color)
        );
    }

    button.failed {
        --fg-color: var(--failed);
        background-color: color-mix(
            in srgb,
            var(--fg-color) 10%,
            var(--bg-color)
        );
    }

    button.inProgress > :global(.icon) {
        animation: spin 2s linear infinite;
    }

    @media (prefers-reduced-motion) {
        button {
            transition: none !important;
        }

        button.inProgress > :global(.icon) {
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
