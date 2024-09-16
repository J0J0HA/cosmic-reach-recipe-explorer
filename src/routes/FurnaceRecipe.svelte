<script>
    export let recipe;

    import { getItemStack } from "$lib/utils";
    import Furnace from "./Furnace.svelte";
    import { reload } from "$lib/stores"; // recieve changes to data
</script>

<Furnace
    input={recipe.input}
    fuel={getItemStack({ __require__: "isFuel" }) || ($reload && false)}
    output={recipe.output}
/>
