<script>
    import { unloadSource } from "$lib/datamods";

    export let source;
    let inProgress = false;
</script>

<div class:bordered={true} class="dm-box">
    <div class="imgWrap">
        {#if inProgress}
            <div class="loading">
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
            </div>
        {/if}
        {#if source.icon}
            <img src={source.icon} alt={source.name} />
        {/if}
    </div>
    <div class="side">
        <h3 class="name">{source.name}</h3>
        <p>Loaded from {source.type} at {new Date(source.createdAt).toLocaleString()}</p>
        <button
            disabled={inProgress}
            on:click={async () => {
                inProgress = true;
                await unloadSource(source.sourceId);
            }}>Unload</button
        >
    </div>
</div>

<style>
    .dm-box {
        padding: 10px;
        margin: 10px;

        display: flex;
        flex-direction: row;
    }

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
