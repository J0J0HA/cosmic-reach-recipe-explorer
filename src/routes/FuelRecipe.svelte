<script>
    export let fuel;

    import { getAir } from "$lib/utils";
    import Furnace from "./Furnace.svelte";
</script>

<Furnace input={getAir()} {fuel} output={getAir()} ticks={2} />
