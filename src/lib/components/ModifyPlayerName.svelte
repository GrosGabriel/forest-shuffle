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


<div class="modal">
    <div class="modal-content">
        
        <h3>Modifier le nom du joueur {playerToModifName}</h3>
        <input type="text" bind:value={newPlayerName} placeholder="Nouveau nom" />
        <button onclick={validerModal}>Valider</button>
    </div>
</div>