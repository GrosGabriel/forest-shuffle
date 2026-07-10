<script>

    import { createEventDispatcher } from "svelte";

    import { usePlayerState } from "$lib/states/playerState.svelte.js";
    import { useCaveState } from "$lib/states/caveState.svelte.js";

    const playerState = usePlayerState();
    const caveState = useCaveState();

    const dispatch = createEventDispatcher();

    function closeModal() {
        dispatch("close");
    }


</script>


<div class="modal">
<div class="modal-content">
    <h3>Choisissez le type de grotte</h3>
    <button onclick={() => {caveState.setCaveType(playerState.player, 'cave'); closeModal(); }}>Grotte classique</button>
    <button onclick={() => {caveState.setCaveType(playerState.player, 'batCave'); closeModal(); }}>Grotte aux chauves-souris</button>
    <button onclick={() => {caveState.setCaveType(playerState.player, 'collectorsCave'); closeModal(); }}>Grotte du collectionneur</button>  
    <button onclick={() => {caveState.setCaveType(playerState.player, 'supplyCave'); closeModal(); }}>Grotte à provisions</button> 
    <button onclick={() => {caveState.setCaveType(playerState.player, 'lonelyCave'); closeModal(); }}>Grotte abandonnée</button>
    <button onclick={() => {caveState.setCaveType(playerState.player, 'smugglersCave'); closeModal(); }}>Grotte de la contrebandière</button>
</div>
</div>