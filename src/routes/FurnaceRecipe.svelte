<script>
    export let recipe;

    import { getItemStack } from "$lib/items";
    import Furnace from "./Furnace.svelte";
</script>

<Furnace
    input={recipe.input}
    fuel={getItemStack({ __require__: "isFuel" })}
    output={recipe.output}
/>
