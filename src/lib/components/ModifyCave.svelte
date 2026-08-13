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


<div class="modal-content">
    <h3>Choisissez le type de grotte</h3>
    <div class="option-list">
        <button class="btn btn-secondary option-item" onclick={() => {caveState.setCaveType(playerState.player, 'cave'); closeModal(); }}>Grotte classique</button>
        <button class="btn btn-secondary option-item" onclick={() => {caveState.setCaveType(playerState.player, 'supplyCave'); closeModal(); }}>Grotte à provisions</button>
        <button class="btn btn-secondary option-item" onclick={() => {caveState.setCaveType(playerState.player, 'lonelyCave'); closeModal(); }}>Grotte abandonnée</button>
        <button class="btn btn-secondary option-item" onclick={() => {caveState.setCaveType(playerState.player, 'batCave'); closeModal(); }}>Grotte aux chauves-souris</button>
        <button class="btn btn-secondary option-item" onclick={() => {caveState.setCaveType(playerState.player, 'smugglersCave'); closeModal(); }}>Grotte de la contrebandière</button>
        <button class="btn btn-secondary option-item" onclick={() => {caveState.setCaveType(playerState.player, 'collectorsCave'); closeModal(); }}>Grotte du collectionneur</button>
    </div>
</div>

<style>
    .modal-content {
        min-width: 240px;
    }

    h3 {
        font-family: var(--font-display);
        font-weight: 600;
        font-size: 1.15rem;
        color: var(--ink);
        margin: 0 0 1rem;
    }

    .option-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .option-item {
        width: 100%;
        justify-content: flex-start;
        text-align: left;
    }
</style>
