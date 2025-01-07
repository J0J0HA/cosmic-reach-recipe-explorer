<script>
    import { version } from "$app/environment";
    import { updated } from "$app/stores";
    import { db } from "$lib/db";
    import { crVersion, locale, ready, stateCallbackJar, refetchVersionList, versionListPromise } from "$lib/stores";
    import { parsingURL, readURLParams } from "$lib/urlset.js";
    import { generateShareLink } from "$lib/utils";
    import { getVersionList, setVersion } from "$lib/versions";
    import { liveQuery } from "dexie";
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import SourceEditor from "./SourceEditor.svelte";

    const loadingJar = writable(false);
    const loadingJarState = writable("idle");
    const downloadTotal = writable(0);
    const downloadDone = writable(0);

    onMount(() =>
        stateCallbackJar.set((state, done, total) => {
            loadingJar.set(state !== "idle");
            loadingJarState.set(state);
            downloadDone.set(done);
            downloadTotal.set(total);
        }),
    );

    const languages = liveQuery(() => {
        return db.metadata.where({ key: "languages" }).first();
    });
</script>

<div style="position: fixed; top:10px; left: 12.5px; font-size: 0.7rem;">
    {version.slice(0, 6)}
</div>

<button
    class="share"
    style="position: fixed; top:13px; right: 13px; font-size: 0.7rem;"
    onclick={async () => {
        try {
            navigator.clipboard.writeText(await generateShareLink());
            alert("Copied to clipboard:\n\n" + (await generateShareLink()));
        } catch (e) {
            prompt("Failed to copy. Link:", await generateShareLink());
        }
    }}>Share</button
>

<div class="jar-chooser-box bordered">
    <div
        style:width="20%"
        style:min-width="fit-content"
        style:display="flex"
        style:flex-direction="column"
        style:gap="10px"
    >
        {#if $ready && !$crVersion && !$loadingJar}
            <h2>To get started:</h2>
        {/if}
        {#if $versionListPromise === null}
            <p>Loading...</p>
        {:else}
            {#await $versionListPromise}
                <select value=":" disabled>
                    <option value=":" key=":" disabled selected>
                        Wait...
                    </option>
                    <option value=":spacer" key=":spacer" disabled>
                        Choose a Version
                    </option>
                </select>
            {:then versions}
                <select
                    disabled={!$ready || $loadingJar || $parsingURL}
                    value={$loadingJar
                        ? ":LOAD-" + $loadingJarState
                        : $crVersion || ":"}
                    onchange={(e) => {
                        loadingJar.set(true);
                        setVersion(
                            versions.filter(
                                (version) => version.id == e.target.value,
                            )[0],
                            $stateCallbackJar,
                        ).then(() => {
                            loadingJar.set(false);
                        });
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
                        <option value={version.id} key={version.id}>
                            {version.id} ({version.type})
                        </option>
                    {/each}
                </select>
                {#if $loadingJar && $loadingJarState === "download"}
                    <br />
                    <div class="bar">
                        <progress
                            max={$downloadTotal}
                            value={$downloadDone}
                            class="fill"
                        ></progress>
                        <span class="static">
                            {Math.round(
                                ($downloadDone / $downloadTotal) * 100,
                            ) || 0}%
                        </span>
                    </div>
                {/if}
            {:catch}
                <p>Failed to load versions.</p>
                <button onclick={refetchVersionList}>Retry</button>
            {/await}
        {/if}
        {#if $ready && $crVersion && !$loadingJar}
            <span class="bar">
                <label for="lang-select" class="static">Locale: </label>
                <select
                    id="lang-select"
                    key="lang-select"
                    value={$locale}
                    class="fill"
                    onchange={(event) => locale.set(event.target.value)}
                    disabled={$parsingURL}
                >
                    {#each $languages?.value || [] as language (language.key)}
                        <option value={language.key}>{language.name}</option>
                    {/each}
                </select>
            </span>
            <SourceEditor disabled={$parsingURL} forceOpen={$parsingURL} />
        {/if}
        {#if $parsingURL}
            Please wait...
        {/if}
    </div>

    {#if $updated}
        <hr />
        <div class="toast">
            <p style:font-weight="bold">
                CR Recipes was updated since you loaded this page.
                <a href="/" onclick={() => location.reload()}>
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
