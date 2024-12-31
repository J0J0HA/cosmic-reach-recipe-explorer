<script>
    import { liveQuery } from "dexie";
    import Source from "./Source.svelte";
    import { db } from "$lib/db";
    import {
        loadDatamodsFromFolder,
        loadDatamodFromZIP,
        loadDatamodFromCRMM,
        listCRMMmods,
    } from "$lib/datamods.js";

    import { browser } from "$app/environment";
    import CrmMmod from "./CRMMmod.svelte";

    let canLoadFolders = false;
    if (browser) {
        canLoadFolders = !!window.DataTransferItem.prototype.webkitGetAsEntry;
    }

    let dialog;
    let crmmDialog;
    let inProgress;

    let sources = liveQuery(() => db.loadedSources.toArray());

    let crmmSearchI;
    let crmmSearchO;
    let crmmSearchPage = 1;

    let includeVersion;

    setInterval(() => {
        if (crmmSearchI !== crmmSearchO) {
            crmmSearchPage = 1;
            crmmSearchO = crmmSearchI;
        }
    }, 1000);
</script>

<button
    disabled={!dialog}
    on:click={() => {
        if (dialog) dialog.showModal();
    }}>Edit datamod sources</button
>
<!-- on:click={(e) => {
        const rect = dialog.getBoundingClientRect();

        const clickedInDialog =
            rect.top <= e.clientY &&
            e.clientY <= rect.top + rect.height &&
            rect.left <= e.clientX &&
            e.clientX <= rect.left + rect.width;

        if (clickedInDialog === false) dialog.close();
    }} -->
<dialog bind:this={dialog} class="bordered">
    <h1>Edit datamod sources</h1>

    <div class="bar">
        <button on:click={() => dialog.close()}>Close</button>

        <input
            id="dir-chooser"
            type="file"
            directory
            mozdirectory
            webkitdirectory
            multiple
            hidden
            on:change={async (event) => {
                await loadDatamodsFromFolder(event.target.files);
                inProgress = false;
            }}
            on:abort={() => {
                inProgress = false;
            }}
            on:cancel={() => {
                inProgress = false;
            }}
            on:error={() => {
                inProgress = false;
            }}
        />

        <input
            id="zip-chooser"
            type="file"
            hidden
            on:change={async (event) => {
                await loadDatamodFromZIP(event.target.files[0]);
                inProgress = false;
            }}
            on:abort={() => {
                inProgress = false;
            }}
            on:cancel={() => {
                inProgress = false;
            }}
            on:error={() => {
                inProgress = false;
            }}
        />
        {#if canLoadFolders}
            <button
                disabled={inProgress}
                on:click={() => {
                    inProgress = true;
                    document.querySelector("#dir-chooser").click();
                }}
            >
                Load mods from folder
            </button>
            <!-- <button
            disabled={inProgress}
            id="dir-unload"
            on:click={async () => unloadSource()}
        >
            Unload data mods
        </button> -->
        {/if}
        <button
            disabled={inProgress}
            on:click={() => {
                inProgress = true;
                document.querySelector("#zip-chooser").click();
            }}
        >
            Load mod from ZIP
        </button>

        <dialog bind:this={crmmDialog} class="bordered">
            <h1>Search CRMM</h1>

            <div class="bar">
                <button
                    on:click={() => {
                        crmmDialog.close();
                    }}>Close</button
                >
                <input
                    type="search"
                    placeholder="Search"
                    bind:value={crmmSearchI}
                />
            </div>

            {#await listCRMMmods(crmmSearchO, crmmSearchPage)}
                Loading...
            {:then result}
                {#each result.hits as hit}
                    <CrmMmod
                        {hit}
                        isInstalled={$sources?.find(
                            (source) => source.sourceId === "crmm:" + hit.slug,
                        )}
                    />
                {/each}
                <button
                    disabled={crmmSearchPage === 1}
                    on:click={() => {
                        crmmSearchPage -= 1;
                    }}>Last page</button
                >
                <button
                    disabled={result.passedHits >= result.totalHits}
                    on:click={() => {
                        crmmSearchPage += 1;
                    }}>Next page</button
                >
            {:catch error}
                <p>Failed: {error.message}</p>
            {/await}
        </dialog>
        <button
            disabled={inProgress}
            on:click={() => {
                crmmDialog.showModal();
            }}
        >
            Load mod(s) from crmm
        </button>
    </div>
    <div class="container">
        {#each $sources || [] as source (source.sourceId)}
            <Source {source} />
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

    dialog[open] {
        top: 50dvh;
        left: 50dvw;
        position: fixed;
        transform: translate(-50%, -50%);

        width: 50vw;
        height: 60vh;

        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    @media (max-width: 600px) {
        dialog {
            width: 80dvw;
            height: 80vh;
        }
    }

    dialog::backdrop {
        background-color: rgba(0, 0, 0, 0.5);
    }
</style>
