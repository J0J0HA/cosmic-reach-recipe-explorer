<script>
    export let fuel;

    import { getAir } from "$lib/utils";
    import Furnace from "./Furnace.svelte";
</script>

<Furnace input={null} {fuel} output={null} ticks={fuel.burnTime} />
