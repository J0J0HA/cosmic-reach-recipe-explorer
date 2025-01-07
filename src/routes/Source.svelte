<script>
    import { unloadSource } from "$lib/datamods";
    import WaitableImg from "./WaitableIMG.svelte";
    import { FiTrash2 } from "svelte-icons-pack/fi";
    import BasicButton from "./ui/BasicButton.svelte";
    import HorizontalBar from "./ui/HorizontalBar.svelte";

    let { source, disabled } = $props();
</script>

<div class:bordered={true} class="dm-box">
    <WaitableImg
        src={source.icon}
        alt={source.name}
        inProgress={source.editing}
    />
    <div class="metadata">
        <h3 class="name">{source.name}</h3>
        <p>
            Loaded from {source.type} at {new Date(
                source.createdAt,
            ).toLocaleString()}
        </p>
    </div>

    <HorizontalBar align="end" class="buttons">
        <BasicButton
            disabled={source.editing || disabled}
            icon={FiTrash2}
            onclick={async () => {
                await unloadSource(source.sourceId);
                await new Promise(() => {});
            }}>Remove</BasicButton
        >
        <!-- {#if source.editing}
            <button
                {disabled}
                onclick={() => {
                    if (
                        confirm(
                            "This may result in corrupted data, which can only be removed by clearing browser data for this page. Continue?",
                        )
                    ) {
                        unloadSource(source.sourceId);
                    }
                }}>DELETE</button
            >
        {/if} -->
    </HorizontalBar>
</div>

<style>
    .dm-box {
        padding: 10px;
        margin: 10px;

        display: flex;
        flex-direction: row;
        gap: 10px;
        justify-content: stretch;
        align-items: center;
    }

    .metadata {
        height: 100%;
        flex: 1;
    }
    .buttons {
        flex: 0;
    }
</style>
