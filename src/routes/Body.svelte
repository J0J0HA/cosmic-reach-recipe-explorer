<script>
    import { crVersion, loaded } from "$lib/stores";
</script>

<div class="wrapper">
    <main>
        {#if !$loaded}
            <p>Loading...</p>
        {:else if !$crVersion}
            <p>No active version</p>
        {:else}
            <slot />
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
