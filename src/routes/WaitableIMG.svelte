<script>
    export let inProgress = false;
    export let alt = null;
    export let src = null;
</script>

<div class="imgWrap">
    {#if src}
        <img {src} {alt} />
    {/if}
    {#if inProgress}
        <div class="loading">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
        </div>
    {/if}
</div>

<style>
    .imgWrap {
        flex-shrink: 0;
        flex-grow: 0;
        position: relative;
        display: block;
        height: 3em;
        width: 3em;
    }

    .imgWrap > * {
        position: absolute;
        top: 0px;
        left: 0px;
        display: block;
        height: 3em;
        width: 3em;
    }

    .loading {
        overflow: hidden;
        display: block;
        text-wrap: nowrap;
        height: 100%;
        width: 100%;
        padding: 0;
    }

    .loading > .bar {
        display: inline-block;
        --dist: 10%;
        margin: 0;
        margin-left: var(--dist);
        width: var(--dist);
        height: var(--dist);
        border-radius: 25%;
        background-color: var(--border);

        position: relative;
        top: calc(2 * var(--dist));

        outline: 1px solid black;

        animation: 0.75s linear infinite bar alternate;
    }

    @keyframes bar {
        0% {
            translate: translateX(0%);
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
        100% {
            transform: translateX(-400%);
            opacity: 1;
        }
    }
</style>
