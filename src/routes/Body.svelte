<div class="wrapper">
    <main>
        <slot />
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
        min-width: 30rem;
    }
</style>