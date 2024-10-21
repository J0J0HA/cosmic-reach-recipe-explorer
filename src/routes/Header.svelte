<script>
    import {
        loadedStore,
        items,
        textures,
        craftingRecipes,
        furnaceRecipes,
        blocks,
        loadedVersion,
        loader,
        loadTime,
    } from "$lib/stores";
    // import {
    //     dataModFiles,
    //     jarFiles,
    //     getFilesFromFileList,
    //     getFilesFromJar,
    // } from "$lib/unzipjar";
    import { getZipFiles, getFolderFiles, getLoader } from "$lib/importer";
    import { updated } from "$app/stores";
    import { downloadVersion, getVersionList, setVersion } from "$lib/versions";
    import { version } from "$app/environment";
    import { get, writable } from "svelte/store";

    const loadingJar = writable(false);
</script>

<div style="position: absolute; top:10px; left: 12.5px; font-size: 0.7rem;">
    {version.slice(0, 6)}
</div>

<div class="jar-chooser-box bordered">
    {#if $loadedStore && !$loadedVersion}
        <h2>To get started:</h2>
    {/if}
    <div>
        {#await getVersionList()}
            <select value=":" id="version-chooser" disabled key="version-chooser">
                <option value=":" key=":" disabled selected> Wait... </option>
                <option value=":spacer" key=":spacer" disabled>
                    Choose a Version
                </option>
            </select>
        {:then versions}
            <select
                disabled={!$loadedStore || $loadingJar}
                value={$loadingJar ? ":LOAD" : ($loadedVersion || ":")}
                id="version-chooser"
                key="version-chooser"
                on:change={(e) => {
                    loadingJar.set(true);
                    setVersion(versions.filter(
                            (version) => version.id == e.target.value,
                        )[0]).then(() => {
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
                    <option value=":LOAD" key=":LOAD" disabled>
                        Loading...
                    </option>
                {/if}
                {#each versions as version}
                    <option value={version.id} key={version.id}
                        >{version.id} ({version.type})</option
                    >
                {/each}
            </select>
        {/await}
    </div>
    {#if $loadedVersion && false} <!-- No data mods atm -->
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
                    getLoader($loadedVersion)
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
                        getLoader($loadedVersion).unloadDataMods();
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
        <hr />
        Loaded {Object.keys($blocks).length} blockstates, {Object.keys($items)
            .length} items, {Object.keys($craftingRecipes).length +
            Object.keys($furnaceRecipes).length}
        recipes, and {Object.keys($textures).length} textures in
        {Math.round($loadTime * 10) / 10}s with loader
        {$loader.name} for version {$loadedVersion}.
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
