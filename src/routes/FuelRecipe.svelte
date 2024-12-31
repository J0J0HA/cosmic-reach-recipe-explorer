<script>
export let fuel;
import Furnace from "./Furnace.svelte";
</script>

<Furnace input={null} {fuel} output={null} ticks={fuel.burnTime} />
