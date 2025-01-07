<script>
import { version } from "$app/environment";
import { updated } from "$app/stores";
import { db } from "$lib/db";
import { crVersion, locale, ready, refetchVersionList, stateCallbackJar, versionListPromise } from "$lib/stores";
import { parsingURL, readURLParams } from "$lib/urlset.js";
import { generateShareLink } from "$lib/utils";
import { getVersionList, setVersion } from "$lib/versions";
import { liveQuery } from "dexie";
import { onMount } from "svelte";
import { writable } from "svelte/store";
import SourceEditor from "./SourceEditor.svelte";

import { Icon } from "svelte-icons-pack";
import { FiClipboard, FiFlag, FiInfo, FiShare2, FiTag } from "svelte-icons-pack/fi";
import BasicButton from "./ui/BasicButton.svelte";
import BasicSelect from "./ui/BasicSelect.svelte";
import HorizontalBar from "./ui/HorizontalBar.svelte";

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

<HorizontalBar
    align="end"
    style="padding: 20px; background-color: var(--bg-color); position: sticky; top:0;"
>
    <div style="flex-grow: 1;">
        {version.slice(0, 6)}
    </div>
    {#if $ready && !$crVersion && !$loadingJar}
        <h2>To get started:</h2>
    {/if}
    {#if $versionListPromise === null}
        <BasicSelect options={{ ":": "Loading..." }} disabled value={":"} />
    {:else}
        {#await $versionListPromise}
            <BasicSelect
                options={{ ":": "Fetching versions..." }}
                disabled
                value={":"}
            />
        {:then versions}
            {#if $loadingJar || !$ready || $parsingURL}
                <BasicSelect
                    options={{
                        init: "Initializing...",
                        download: "Downloading...",
                        extract: "Extracting...",
                        parse: "Parsing...",
                        loading: "Loading...",
                        idle: "Wait...",
                    }}
                    value={$loadingJarState || "idle"}
                    disabled
                />
                {#if $loadingJarState === "download"}
                    <progress
                        max={$downloadTotal}
                        value={$downloadDone}
                        class="fill"
                    ></progress>
                {/if}
            {:else}
                <BasicSelect
                    options={versions.reduce((versionDict, version) => {
                        versionDict[version.id] =
                            `${version.id} (${version.type})`;
                        return versionDict;
                    }, {})}
                    placeholder="Version"
                    icon={FiTag}
                    value={$crVersion || null}
                    onchange={(value) => {
                        loadingJar.set(true);
                        setVersion(
                            versions.filter(
                                (version) => version.id == value,
                            )[0],
                            $stateCallbackJar,
                        ).then(() => {
                            loadingJar.set(false);
                        });
                    }}
                />
            {/if}
        {:catch}
            <p>Failed to load versions.</p>
            <button onclick={refetchVersionList}>Retry</button>
        {/await}
    {/if}
    <label for="lang-select" style="display: none;">Locale: </label>
    <BasicSelect
        id="lang-select"
        key="lang-select"
        value={$locale}
        class="fill"
        icon={FiFlag}
        onchange={(value) => locale.set(value)}
        disabled={$parsingURL || !$ready || !$crVersion || $loadingJar}
        options={($languages?.value || []).reduce((langDict, lang) => {
            langDict[lang.key] = lang.name;
            return langDict;
        }, {})}
    >
        {#each $languages?.value || [] as language (language.key)}
            <option value={language.key}>{language.name}</option>
        {/each}
    </BasicSelect>
    <SourceEditor
        disabled={$parsingURL || !$ready || !$crVersion || $loadingJar}
        forceOpen={$parsingURL && $ready && $crVersion}
    />

    <!-- style="position: fixed; top:13px; right: 13px;" -->
    <BasicButton
        icon={FiClipboard}
        feedbackFor={2000}
        onclick={async () => {
            navigator.clipboard.writeText(await generateShareLink());
        }}
    >
        Copy link
    </BasicButton>
</HorizontalBar>

{#if $updated}
    <div class="toast">
        <Icon src={FiInfo} size="1.1em"></Icon>
        <p style:font-weight="bold">
            CR Recipes was updated since you loaded this page.
            <a href="/" onclick={() => location.reload()}> Reload to apply </a>
        </p>
    </div>
{/if}

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

    .toast {
        all: unset;
        position: fixed;
        bottom: 10px;
        right: 10px;
        padding: 20px;
        background-color: var(--bg-color);
        border: 1px solid
            color-mix(in srgb, var(--fg-color) 50%, var(--bg-color));
        border-radius: 4px;

        display: flex;
        flex-direction: row;
        gap: 10px;
        align-items: center;
    }
</style>
