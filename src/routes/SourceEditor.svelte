<script>
    import {
        listCRMMmods,
        loadDatamodFromCRMM,
        loadDatamodFromZIP,
        loadDatamodsFromFolder,
    } from "$lib/datamods.js";
    import { db } from "$lib/db";
    import { liveQuery } from "dexie";
    import {
        FiEdit,
        FiFolderPlus,
        FiFilePlus,
        FiDownloadCloud,
        FiXCircle,
        FiSearch,
        FiChevronLeft,
        FiChevronRight,
    } from "svelte-icons-pack/fi";
    import Source from "./Source.svelte";
    import BasicButton from "./ui/BasicButton.svelte";
    import TextInput from "./ui/TextInput.svelte";
    import HorizontalBar from "./ui/HorizontalBar.svelte";

    import { browser } from "$app/environment";
    import CrmMmod from "./CRMMmod.svelte";

    let canLoadFolders = $state(false);
    if (browser) {
        canLoadFolders = !!window.DataTransferItem.prototype.webkitGetAsEntry;
    }

    let { disabled, forceOpen } = $props();
    let dialog = $state();
    let crmmDialog = $state();
    let inProgress = $state();

    const sources = liveQuery(() => db.loadedSources.toArray());

    let crmmSearchI = $state();
    let crmmSearchO = $state();
    let crmmSearchPage = $state(1);

    let includeVersion;

    setInterval(() => {
        if (crmmSearchI !== crmmSearchO) {
            crmmSearchPage = 1;
            crmmSearchO = crmmSearchI;
        }
    }, 1000);
</script>

<BasicButton
    disabled={!dialog || forceOpen}
    icon={FiEdit}
    onclick={() => {
        if (dialog) dialog.showModal();
    }}>Change datamods</BasicButton
>
<dialog bind:this={dialog} class="bordered" open={forceOpen}>
    <h1>{forceOpen ? "Loading datamods..." : "Edit datamod sources"}</h1>
    {#if !forceOpen}
        <p>
            You can add data mods from you mod folder, zipped or not, zipped and
            unzipped data mods and directly from crmm.tech.
        </p>

        <BasicButton
            icon={FiXCircle}
            {disabled}
            onclick={() => dialog.close()}
            style="position: absolute; right: 15px; top:15px;">Exit</BasicButton
        >
        <HorizontalBar>
            <input
                id="dir-chooser"
                type="file"
                directory
                mozdirectory
                webkitdirectory
                multiple
                hidden
                onchange={async (event) => {
                    await loadDatamodsFromFolder(event.target.files);
                    inProgress = false;
                }}
                onabort={() => {
                    inProgress = false;
                }}
                oncancel={() => {
                    inProgress = false;
                }}
                onerror={() => {
                    inProgress = false;
                }}
            />

            <input
                id="zip-chooser"
                type="file"
                hidden
                disabled={inProgress || disabled}
                onchange={async (event) => {
                    await loadDatamodFromZIP(event.target.files[0]);
                    inProgress = false;
                }}
                onabort={() => {
                    inProgress = false;
                }}
                oncancel={() => {
                    inProgress = false;
                }}
                onerror={() => {
                    inProgress = false;
                }}
            />
            {#if canLoadFolders}
                <BasicButton
                    disabled={inProgress || disabled}
                    icon={FiFolderPlus}
                    onclick={() => {
                        inProgress = true;
                        document.querySelector("#dir-chooser").click();
                    }}
                >
                    folder
                </BasicButton>
            {/if}
            <BasicButton
                disabled={inProgress || disabled}
                icon={FiFilePlus}
                onclick={() => {
                    inProgress = true;
                    document.querySelector("#zip-chooser").click();
                }}
            >
                ZIP-file
            </BasicButton>

            <dialog bind:this={crmmDialog} class="bordered">
                <h1>Search CRMM</h1>

                <div class="bar">
                    <BasicButton
                        style="position: absolute; top: 20px; right: 20px;"
                        icon={FiXCircle}
                        onclick={() => {
                            crmmDialog.close();
                        }}>Exit</BasicButton
                    >
                    <TextInput
                        icon={FiSearch}
                        placeholder="Search"
                        bind:value={crmmSearchI}
                    />
                </div>

                {#await listCRMMmods(crmmSearchO, crmmSearchPage)}
                    Fetching...
                {:then result}
                    {#each result.hits as hit}
                        <CrmMmod
                            {disabled}
                            {hit}
                            isInstalled={$sources?.find(
                                (source) =>
                                    source.sourceId === "crmm:" + hit.slug,
                            )}
                        />
                    {/each}
                    <HorizontalBar align="space-between">
                        <BasicButton
                            icon={FiChevronLeft}
                            disabled={crmmSearchPage === 1}
                            onclick={() => {
                                crmmSearchPage -= 1;
                            }}
                        />
                        <BasicButton
                            icon={FiChevronRight}
                            disabled={result.passedHits >= result.totalHits}
                            onclick={() => {
                                crmmSearchPage += 1;
                            }}
                        /></HorizontalBar
                    >
                {:catch error}
                    <p>Failed: {error.message}</p>
                {/await}
            </dialog>
            <BasicButton
                disabled={inProgress || disabled}
                icon={FiDownloadCloud}
                onclick={() => {
                    crmmDialog.showModal();
                }}
            >
                crmm.tech
            </BasicButton>
        </HorizontalBar>
    {/if}
    <div class="container">
        {#each $sources || [] as source (source.sourceId)}
            <Source {source} {disabled} />
        {/each}
    </div>
</dialog>

<style>
    .container {
        overflow-y: scroll;
        flex-grow: 1;
    }

    .bar {
        flex-wrap: wrap;
    }
</style>
