<script>
    import {
        items,
        textures,
        craftingRecipes,
        furnaceRecipes,
        blocks,
        loadedVersion,
        loader,
        loadTime,
    } from "$lib/stores";
    import {
        dataModFiles,
        jarFiles,
        getFilesFromFileList,
        getFilesFromJar,
    } from "$lib/unzipjar";
    import { updated } from "$app/stores";
    import { downloadVersion, getVersionList } from "$lib/versions";
    import { version } from "$app/environment";
</script>

<div style="position: absolute; top:10px; left: 12.5px; font-size: 0.7rem;">
    {version.slice(0, 6)}
</div>

<div class="jar-chooser-box bordered">
    {#if $loadedVersion == "none"}
        <h2>Load a jar file and/or data mod to start:</h2>
    {/if}
    <div>
        <input
            id="jar-chooser"
            accept="application/java-archive,application/x-java-archive,application/x-jar"
            type="file"
            hidden
            on:change={(event) => {
                document.querySelector("#jar-downloader").disabled = true;
                document.querySelector("#jar-chooser-trigger").disabled = true;
                const file = event.target.files[0];
                getFilesFromJar(file).then((files) => {
                    jarFiles.set(files);
                    document.querySelector("#jar-downloader").disabled = false;
                    document.querySelector("#jar-chooser-trigger").disabled =
                        false;
                });
            }}
        />
        <button
            id="jar-chooser-trigger"
            on:click={() => {
                document.querySelector("#jar-chooser").click();
            }}>Upload a jar file from your PC</button
        >
        or
        {#await getVersionList()}
            <select value=":" id="jar-downloader" disabled>
                <option value=":" key=":" disabled selected> Wait... </option>
                <option value=":spacer" key=":spacer" disabled>
                    Choose one from the CRModders Archive
                </option>
            </select>
        {:then versions}
            <select
                value=":"
                id="jar-downloader"
                on:change={(e) => {
                    document.querySelector("#jar-downloader").disabled = true;
                    document.querySelector("#jar-chooser-trigger").disabled =
                        true;
                    downloadVersion(
                        versions.filter(
                            (version) => version.id == e.target.value,
                        )[0],
                    ).then((file) => {
                        getFilesFromJar(file).then((files) => {
                            jarFiles.set(files);
                            document.querySelector("#jar-downloader").disabled =
                                false;
                            document.querySelector(
                                "#jar-chooser-trigger",
                            ).disabled = false;
                        });
                    });

                    document.querySelector("#jar-downloader").value = ":";
                }}
            >
                <option value=":" key=":" disabled selected>
                    Choose one from the CRModders Archive
                </option>
                {#each versions as version}
                    <option value={version.id} key={version.id}
                        >{version.id} ({version.type})</option
                    >
                {/each}
            </select>
        {/await}
    </div>
    {#if $loadedVersion !== "none"}
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
                getFilesFromFileList(event.target.files).then((files) => {
                    dataModFiles.set(files);
                    document.querySelector("#dir-chooser-trigger").disabled =
                        false;
                });
            }}
        />
        <div>
            {#if Object.keys($dataModFiles).length > 0}
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
                        dataModFiles.set({});
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
