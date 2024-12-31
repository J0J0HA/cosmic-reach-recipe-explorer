<script>
    import { unloadSource } from "$lib/datamods";
    import WaitableImg from "./WaitableIMG.svelte";

    export let source;
</script>

<div class:bordered={true} class="dm-box">
    <!-- {source.editing} -->
    <WaitableImg src={source.icon} alt={source.name} inProgress={source.editing} />
    <div class="side">
        <h3 class="name">{source.name}</h3>
        <p>
            Loaded from {source.type} at {new Date(
                source.createdAt,
            ).toLocaleString()}
        </p>
        <button
            disabled={source.editing}
            on:click={()=>unloadSource(source.sourceId)}>Unload</button
        >
        {#if source.editing}
            <button on:click={()=> {
                if (confirm("This may result in corrupted data, which can only be removed by clearing browser data for this page. Continue?")) {
                    unloadSource(source.sourceId);
                }
            }}>DELETE</button>
        {/if}
    </div>
</div>

<style>
    .dm-box {
        padding: 10px;
        margin: 10px;

        display: flex;
        flex-direction: row;
        gap: 10px;
    }
</style>
