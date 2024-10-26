<script>
    import { loaded, crVersion } from "$lib/stores";
    import { getFolderFiles, getLoader } from "$lib/importer";
    import { updated } from "$app/stores";
    import { getVersionList, setVersion } from "$lib/versions";
    import { version } from "$app/environment";
    import { writable } from "svelte/store";
    import { onMount } from "svelte";

    const loadingJar = writable(false);
    const loadingState = writable("idle");
    const downloadTotal = writable(0);
    const downloadDone = writable(0);

    const stateCallback = (state, done, total) => {
        loadingState.set(state);
        downloadDone.set(done);
        downloadTotal.set(total);
    };

    let versionListPromise = writable(null);

    function refetchVersionList() {
        versionListPromise.set(getVersionList());
    }
    onMount(refetchVersionList);
</script>

<div style="position: absolute; top:10px; left: 12.5px; font-size: 0.7rem;">
    {version.slice(0, 6)}
</div>

<div class="jar-chooser-box bordered">
    {#if $loaded && !$crVersion}
        <h2>To get started:</h2>
    {/if}
    <div style:width="20%" style:min-width="fit-content">
        {#if $versionListPromise === null}
            <p>Loading...</p>
        {:else}
            {#await $versionListPromise}
                <select
                    value=":"
                    id="version-chooser"
                    disabled
                    key="version-chooser"
                >
                    <option value=":" key=":" disabled selected>
                        Wait...
                    </option>
                    <option value=":spacer" key=":spacer" disabled>
                        Choose a Version
                    </option>
                </select>
            {:then versions}
                <select
                    disabled={!$loaded || $loadingJar}
                    value={$loadingJar
                        ? ":LOAD-" + $loadingState
                        : $crVersion || ":"}
                    id="version-chooser"
                    key="version-chooser"
                    on:change={(e) => {
                        loadingJar.set(true);
                        setVersion(
                            versions.filter(
                                (version) => version.id == e.target.value,
                            )[0],
                            stateCallback,
                        ).then(() => {
                            loadingJar.set(false);
                        });
                        // downloadVersion(
                        //     versions.filter(
                        //         (version) => version.id == e.target.value,
                        //     )[0],
                        // ).then((file) => {
                        //     // crVersion.set(e.target.value);
                        //     getZipFiles(file).then((files) => {
                        //         getLoader($crVersion)
                        //             .loadJarFiles(files)
                        //             .then(() => {
                        //                 loadingJar.set(false);
                        //                 console.log(getLoader($crVersion));
                        //                 console.log(
                        //                     getLoader(
                        //                         $crVersion,
                        //                     ).getFilesCombined(),
                        //                 );
                        //             });
                        //     });
                        // });

                        // document.querySelector("#version-chooser").value = ":";
                    }}
                >
                    <option value=":" key=":" disabled selected>
                        Choose a Version
                    </option>
                    {#if $loadingJar}
                        <option value=":LOAD-download" key=":LOAD" disabled>
                            Downloading...
                        </option>
                        <option value=":LOAD-extract" key=":LOAD" disabled>
                            Extracting...
                        </option>
                        <option value=":LOAD-parse" key=":LOAD" disabled>
                            Parsing...
                        </option>
                        <option value=":LOAD-init" key=":LOAD" disabled>
                            Loading...
                        </option>
                        <option value=":LOAD-idle" key=":LOAD" disabled>
                            Idle
                        </option>
                    {/if}

                    {#each versions as version}
                        <option value={version.id} key={version.id}
                            >{version.id} ({version.type})</option
                        >
                    {/each}
                </select>
                {#if $loadingJar && $loadingState === "download"}
                    <br />
                    <div class="progress-bar">
                        <progress max={$downloadTotal} value={$downloadDone} />
                        <span class="progress-percentage"
                            >{Math.round(
                                ($downloadDone / $downloadTotal) * 100,
                            ) || 0}%</span
                        >
                    </div>
                {/if}
            {:catch}
                <p>Failed to load verisons.</p>
                <button on:click={refetchVersionList}>Retry</button>
            {/await}
        {/if}
    </div>
    {#if $crVersion && false}
        <!-- No data mods atm -->
        <hr />
        To load your data mods,
        <input
            id="dir-chooser"
            type="file"
            directory
            mozdirectory
            webkitdirectory
            multiple
            hidden
            on:change={(event) => {
                document.querySelector("#dir-chooser-trigger").disabled = true;
                getFolderFiles(event.target.files).then((files) => {
                    getLoader($crVersion)
                        .loadDataModFiles(files)
                        .then(() => {
                            document.querySelector(
                                "#dir-chooser-trigger",
                            ).disabled = false;
                        });
                });
            }}
        />
        <div>
            {#if false || Object.keys("$dataModFiles").length > 0}
                <button
                    id="dir-chooser-trigger"
                    on:click={() => {
                        document.querySelector("#dir-chooser").click();
                    }}
                >
                    Select a different data mod folder
                </button>
                <button
                    id="dir-unload"
                    on:click={() => {
                        // dataModFiles.set({});
                        getLoader($crVersion).unloadDataMods();
                    }}
                >
                    Unload data mods
                </button>
            {:else}
                <button
                    id="dir-chooser-trigger"
                    on:click={() => {
                        document.querySelector("#dir-chooser").click();
                    }}
                >
                    Select your data mod folder
                </button>
            {/if}
        </div>
        <!-- <hr />
        Loaded {Object.keys($blocks).length} blockstates, {Object.keys($items)
            .length} items, {Object.keys($craftingRecipes).length +
            Object.keys($furnaceRecipes).length}
        recipes, and {Object.keys($textures).length} textures in
        {Math.round($loadTime * 10) / 10}s with loader
        {$loader.name} for version {$loadedVersion}. -->
    {/if}

    {#if $updated}
        <hr />
        <div class="toast">
            <p style:font-weight="bold">
                CR Recipes was updated since you loaded this page.
                <a href="/" on:click={() => location.reload()}>
                    Reload to apply
                </a>
            </p>
        </div>
    {/if}
</div>

<style>
    .jar-chooser-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 10px;
        margin: 10px;
    }

    .jar-chooser-box > * {
        margin: 10px;
    }

    hr {
        width: 100%;
    }
</style>
