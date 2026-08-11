<script>
    import { createEventDispatcher } from "svelte";

    import { usePlayerState } from "$lib/states/playerState.svelte.js";

    const playerState = usePlayerState();

    let { playerToModifName , newPlayerName } = $props();

    const dispatch = createEventDispatcher();

    function closeModal() {
        dispatch("close");
    }

    function validerModal() {
        playerState.renamePlayer(playerToModifName, newPlayerName);

        closeModal();
    }


</script>


<div class="modal-content">
    <h3>Modifier le nom du joueur {playerToModifName}</h3>
    <input type="text" class="text-input" bind:value={newPlayerName} placeholder="Nouveau nom" />
    <button class="btn btn-primary" onclick={validerModal}>Valider</button>
</div>

<style>
    .modal-content {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        min-width: 240px;
    }

    h3 {
        font-family: var(--font-display);
        font-weight: 600;
        font-size: 1.15rem;
        color: var(--ink);
        margin: 0;
    }

    .text-input {
        font-family: var(--font-body);
        font-size: 0.95rem;
        color: var(--ink);
        background: var(--surface-raised);
        border: 1.5px solid var(--border);
        border-radius: var(--radius-btn);
        padding: 0.7rem 0.9rem;
        min-height: 46px;
    }
    .text-input:focus-visible {
        outline: 2px solid var(--forest);
        outline-offset: 1px;
        border-color: var(--forest);
    }
</style>
