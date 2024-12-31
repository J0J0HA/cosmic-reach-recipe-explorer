<script>
import { getTakeable, makeItemStack } from "$lib/utils";
import InventoryDisplay from "./InventoryDisplay.svelte";

export let ore;

import { db } from "$lib/db";
import { liveQuery } from "dexie";

function shortNumber(labelValue) {
    return Math.abs(Number(labelValue)) >= 1.0e9
        ? `${Math.round(Math.abs(Number(labelValue)) / 1.0e9)} bn`
        : Math.abs(Number(labelValue)) >= 1.0e6
          ? `${Math.round(Math.abs(Number(labelValue)) / 1.0e6)} m`
          : Math.abs(Number(labelValue)) >= 1.0e3
            ? `${Math.round(Math.abs(Number(labelValue)) / 1.0e3)} k`
            : Math.round(Math.abs(Number(labelValue)));
}

const oreBlock = liveQuery(async () => {
    return await makeItemStack(await getTakeable(`${ore.blockId}[default]`), ore.data.ore.MaxOresPerCluster);
});
const oreReplace = liveQuery(async () => {
    return await makeItemStack(await getTakeable({ has_tag: ore.tagsOfBlocksToReplace }), ore.data.ore.AttemptsPerColumn);
});
const progressArrow = liveQuery(
    () =>
        db.textures
            .where({
                modId: "base",
                subPath: "textures/ui/progress-arrow-full.png",
            })
            .first(),
    { initialValue: null },
);

$: maxHeightWords = shortNumber(ore.data.ore.MaxElevation);
$: minHeightWords = shortNumber(ore.data.ore.MinElevation);
</script>

<div class="before-after bordered">
    <h2 class="head">Ore</h2>
    {#if $oreReplace}
        <InventoryDisplay grid={[[$oreReplace]]} />
    {/if}
    <p class="note first">
        {maxHeightWords}
        <br />
        {minHeightWords}
    </p>
    <a href="/ores"
        ><img
            src={$progressArrow?.data || ""}
            alt="makes"
            class="arrow"
            draggable="false"
        /></a
    >
    <p class="note end">up to</p>
    {#if $oreBlock}
        <InventoryDisplay grid={[[$oreBlock]]} out={true} />
    {/if}
    <span class="has-tooltip"
        >(?) <div class="tooltip">
            The game replaces up to {ore.data.ore.AttemptsPerColumn} blocks with
            the {ore.tagsOfBlocksToReplace} tag with clusters of up to {ore.data
                .ore.MaxOresPerCluster}
            {ore.data.ore.blockId} between the level {minHeightWords}
            and {maxHeightWords}.
            <br />
            <br />
            {#if ore.modId == "__patch_base_ores"}
                Data for this ore was not fetched from game data but supplied by
                a patch defined by us. The data might be incorrect.
                <br />
                The patches are using the format of the
                <a href="https://www.crmm.tech/mod/oreloader">OreLoader</a> mod.
            {:else}
                This is was loaded from a non-standard datamod file which can be
                made supported by installing <a
                    href="https://www.crmm.tech/mod/oreloader">OreLoader</a
                >.
            {/if}
        </div>
    </span>
</div>

<style>
    .before-after {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;

        padding: 15px;
        padding-top: calc(30px + 1.2em);

        width: 400px;
    }

    .head {
        z-index: 9988;
        position: absolute;
        translate: 22.5px -60px;
        user-select: none;
    }

    .note {
        z-index: 9988;
        user-select: none;
        width: 70px;
    }

    .note.first {
        text-align: end;
    }

    .note.end {
        text-align: start;
    }

    .arrow {
        width: 50px;
        padding: 10px;
        --margin-lr: 20px;
    }

    .before-after > * {
        flex-grow: 0;
        flex-shrink: 0;
    }

    .has-tooltip {
        z-index: 9988;
        position: absolute;
        user-select: none;
        translate: 0px -61.5px;
    }

    .has-tooltip:hover {
        height: 50px;
        width: 100px;
        translate: 0px -47.5px;
    }

    .has-tooltip .tooltip {
        display: none;
        font-size: medium;
        font-weight: normal;

        z-index: 9999;

        position: absolute;
        /* top: 50px; */
        left: 50%;
        translate: -65px 10px;
        padding: 5px;
        background-color: var(--tooltip-back);
        color: var(--tooltip-text);
        border-radius: 5px;
        width: 33dvw;
        min-width: fit-content;
        text-wrap: wrap;
        max-width: 50dvw;
    }

    .has-tooltip:hover .tooltip {
        display: block;
    }
</style>
