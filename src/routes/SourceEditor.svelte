<script>
import { listCRMMmods, loadDatamodFromCRMM, loadDatamodFromZIP, loadDatamodsFromFolder } from "$lib/datamods.js";
import { db } from "$lib/db";
import { liveQuery } from "dexie";
import Source from "./Source.svelte";

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

<button
    disabled={!dialog || forceOpen}
    onclick={() => {
        if (dialog) dialog.showModal();
    }}>Edit datamod sources</button
>
<dialog bind:this={dialog} class="bordered" open={forceOpen}>
    <h1>{forceOpen ? "Loading datamods..." : "Edit datamod sources"}</h1>

    <div class="bar">
        <button {disabled} onclick={() => dialog.close()}>Close</button>

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
            <button
                disabled={inProgress || disabled}
                onclick={() => {
                    inProgress = true;
                    document.querySelector("#dir-chooser").click();
                }}
            >
                Load mods from folder
            </button>
        {/if}
        <button
            disabled={inProgress || disabled}
            onclick={() => {
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
                    onclick={() => {
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
                        {disabled}
                        {hit}
                        isInstalled={$sources?.find(
                            (source) => source.sourceId === "crmm:" + hit.slug,
                        )}
                    />
                {/each}
                <button
                    disabled={crmmSearchPage === 1}
                    onclick={() => {
                        crmmSearchPage -= 1;
                    }}>Last page</button
                >
                <button
                    disabled={result.passedHits >= result.totalHits}
                    onclick={() => {
                        crmmSearchPage += 1;
                    }}>Next page</button
                >
            {:catch error}
                <p>Failed: {error.message}</p>
            {/await}
        </dialog>
        <button
            disabled={inProgress || disabled}
            onclick={() => {
                crmmDialog.showModal();
            }}
        >
            Load mod(s) from crmm
        </button>
    </div>
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
