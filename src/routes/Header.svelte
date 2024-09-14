<script>
    import {
        items,
        textures,
        craftingRecipes,
        furnaceRecipes,
        blocks,
        loadedVersion,
    } from "$lib/stores";
    import { loadFromJar } from "$lib/unzipjar";
    import { downloadVersion, getVersionList } from "$lib/versions";
    import { version } from "$app/environment";
</script>

<div style="position: absolute; top:10px; left: 12.5px; font-size: 0.7rem;">
    {version.slice(0, 6)}
</div>

<div class="jar-chooser-box bordered">
    {#if $loadedVersion == "none"}
        <h2>Choose a Cosmic Reach .jar file to start</h2>
    {/if}
    <input
        id="jar-chooser"
        accept="application/java-archive,application/x-java-archive,application/x-jar"
        type="file"
        hidden
        on:change={(event) => {
            document.querySelector("#jar-downloader").disabled = true;
            document.querySelector("#jar-chooser-trigger").disabled = true;
            const file = event.target.files[0];
            loadFromJar(file).then(() => {
                document.querySelector("#jar-downloader").disabled = false;
                document.querySelector("#jar-chooser-trigger").disabled = false;
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
                document.querySelector("#jar-chooser-trigger").disabled = true;
                downloadVersion(
                    versions.filter(
                        (version) => version.id == e.target.value,
                    )[0],
                ).then((file) => {
                    loadFromJar(file).then(() => {
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

    {$loadedVersion} with {Object.keys($blocks).length} blockstates, {Object.keys(
        $items,
    ).length} items, {Object.keys($craftingRecipes).length + Object.keys($furnaceRecipes).length}
    recipes, and {Object.keys($textures).length} textures loaded.
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
</style>
