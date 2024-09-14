<script>
    export let fuel;

    import { getItemStack } from "$lib/items";
    import Furnace from "./Furnace.svelte";

    const air = getItemStack(null);
</script>

<Furnace input={air} {fuel} output={air} ticks={2} />
