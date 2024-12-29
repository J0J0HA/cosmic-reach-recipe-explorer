<script>
    import { page } from "$app/stores";
</script>

<svelte:head>
    <title>{$page.status} - CR Recipes</title>
</svelte:head>

<div style:margin-top="20px" style:margin-left="30px">
    <h1>Ooops...</h1>
    <p>{$page.status} - {$page.error.message}</p>
</div>
