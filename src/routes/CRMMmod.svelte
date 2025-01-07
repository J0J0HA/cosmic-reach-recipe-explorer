<script>
    import { loadDatamodFromCRMM, unloadSource } from "$lib/datamods";
    import WaitableImg from "./WaitableIMG.svelte";
    import { FiDownload, FiRefreshCcw, FiTrash } from "svelte-icons-pack/fi";
    import BasicButton from "./ui/BasicButton.svelte";
    import TextInput from "./ui/TextInput.svelte";
    import HorizontalBar from "./ui/HorizontalBar.svelte";

    let { hit, isInstalled, disabled } = $props();
</script>

<div class:bordered={true} class="dm-box">
    <WaitableImg
        src={hit.icon}
        alt={hit.name}
        inProgress={isInstalled?.editing}
    />
    <div class="metadata">
        <h3 class="name">{hit.name}</h3>
        <p>
            [{hit.type.join(", ")}]
            <br />
            Last update: {new Date(hit.dateUpdated).toLocaleString()}
            {#if isInstalled}
                <br />
                Last updated locally: {new Date(
                    isInstalled.createdAt,
                ).toLocaleString()}
            {/if}
        </p>
    </div>
    <HorizontalBar align="start" class="buttons">
        <BasicButton
            disabled={isInstalled?.editing || disabled}
            icon={isInstalled ? FiRefreshCcw : FiDownload}
            class={isInstalled &&
            new Date(hit.dateUpdated) > new Date(isInstalled.createdAt)
                ? "highlight"
                : null}
            onclick={async () => {
                await loadDatamodFromCRMM(hit);
            }}
        >
            {isInstalled ? "Update" : "Download"}
        </BasicButton>
        {#if isInstalled}
            <BasicButton
                icon={FiTrash}
                disabled={isInstalled.editing || disabled}
                onclick={async () => {
                    await unloadSource("crmm:" + hit.slug);
                }}
            >
                Remove
            </BasicButton>
        {/if}</HorizontalBar
    >
</div>

<style>
    .dm-box {
        padding: 10px;

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
