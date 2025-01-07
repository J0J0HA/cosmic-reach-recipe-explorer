<script>
    import { loadDatamodFromCRMM, unloadSource } from "$lib/datamods";
    import WaitableImg from "./WaitableIMG.svelte";

    let { hit, isInstalled, disabled } = $props();
</script>

<div class:bordered={true} class="dm-box">
    <WaitableImg
        src={hit.icon}
        alt={hit.name}
        inProgress={isInstalled?.editing}
    />
    <div class="side">
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
        <button
            disabled={isInstalled?.editing || disabled}
            class:highlight={isInstalled &&
                new Date(hit.dateUpdated) > new Date(isInstalled.createdAt)}
            onclick={async () => {
                await loadDatamodFromCRMM(hit);
            }}
        >
            {isInstalled ? "Update" : "Load"}
        </button>
        {#if isInstalled}
            <button
                disabled={isInstalled.editing || disabled}
                onclick={async () => {
                    await unloadSource("crmm:" + hit.slug);
                }}
            >
                Remove
            </button>
        {/if}
    </div>
</div>

<style>
    .dm-box {
        padding: 10px;

        display: flex;
        flex-direction: row;
        gap: 10px;
    }
</style>
