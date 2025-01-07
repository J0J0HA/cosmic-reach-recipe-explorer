<script>
import { crVersion, ready } from "$lib/stores";
import { parsingURL } from "$lib/urlset";

    let { children } = $props();
</script>

<div class="wrapper">
    <main>
        {#if !$ready || $parsingURL}
            <p>Loading...</p>
        {:else if !$crVersion}
            <p>No version selected.</p>
        {:else}
            {@render children?.()}
        {/if}
    </main>
</div>

<style>
    .wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        margin-top: 30px;
        margin-bottom: 30px;
    }

    main {
        flex-grow: 0;
        flex-shrink: 0;
        width: 60%;
        max-width: 100dvw;
    }

    @media (width < 450px) {
        main {
            width: calc(100% - 20px);
        }
    }
</style>
