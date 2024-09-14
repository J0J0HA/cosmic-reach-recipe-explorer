<script>
    import { items, textures, craftingRecipes, blocks } from "$lib/stores";
    import { loadFromJar } from "$lib/unzipjar";
    import { downloadVersion, getVersionList } from "$lib/versions";

    let current_items = {};
    items.subscribe((value) => {
        current_items = value;
    });
    let current_blocks = {};
    blocks.subscribe((value) => {
        current_blocks = value;
    });
    let current_textures = {};
    textures.subscribe((value) => {
        current_textures = value;
    });
    let current_recipes = {};
    craftingRecipes.subscribe((value) => {
        current_recipes = value;
    });
</script>

<div class="jar-chooser-box">
    {#if Object.keys(current_blocks).length + Object.keys(current_items).length + current_recipes.length + Object.keys(current_textures).length <= 0}
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

    {Object.keys(current_blocks).length} blockstates, {Object.keys(
        current_items,
    ).length} items, {Object.keys(current_recipes).length}
    recipes, and {Object.keys(current_textures).length} textures loaded.
</div>

<style>
    .jar-chooser-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        border: 1px solid lightgrey;
        border-radius: 10px;
        padding: 10px;
    }

    .jar-chooser-box > * {
        margin: 10px;
    }
</style>
