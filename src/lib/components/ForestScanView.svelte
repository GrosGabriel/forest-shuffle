<script>
    import { createEventDispatcher } from "svelte";

    import ForestView from "$lib/components/ForestView.svelte";
    import AddATreeView from "$lib/components/AddATreeView.svelte";

    import { useRealForestState } from "$lib/states/realForestState.svelte.js";
    import { usePlayerState } from "$lib/states/playerState.svelte.js";
    import { useForestScanState } from "$lib/states/forestScanState.svelte.js";

    const forestScanState = useForestScanState();

    const realForestState = useRealForestState();
    const playerState = usePlayerState();

    const dispatch = createEventDispatcher();

    function closeModal() {
        dispatch("close");
    }

    function validerModal() {
    // Ici, on veut merge la forêt scannée avec la forêt réelle du joueur, donc on met à jour la forêt réelle du joueur avec la forêt scannée
        
        realForestState.mergeForest(playerState.player, forestScanState.forestScan);
        forestScanState.forestScan = null;

        closeModal();
    }

</script>

<AddATreeView />

<ForestView forest={forestScanState.forestScan.forest} />


<div class="modal-backdrop">
    <button onclick={closeModal} class="close-button">Annuler le scan</button>
    <button onclick={validerModal} class="validate-button">Valider et merge</button>
</div>

