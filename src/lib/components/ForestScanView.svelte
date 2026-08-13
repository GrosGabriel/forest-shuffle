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

<div class="scan-shell">
    <ForestView forest={forestScanState.forestScan.forest} />
</div>




<div class="sticky-actions">
    <div class="modal-backdrop">
        <AddATreeView label="+ arbre" />
        <button onclick={closeModal} class="btn btn-ghost">Annuler le scan</button>
        <button onclick={validerModal} class="btn btn-primary">Valider et merge</button>
    </div>
</div>

<style>
    /* Le <dialog> s'auto-dimensionne à son contenu : avec seulement un
       max-width, s'il n'y a qu'un ou deux petits arbres, rien ne force le
       dialog à être plus large qu'eux, donc rien à centrer autour et rien
       pour les laisser tenir sur la même ligne. On demande explicitement une
       largeur (pas juste un plafond) pour que le dialog grandisse en
       conséquence. La forêt reste alignée à gauche à l'intérieur de cette
       colonne (les arbres ne sont pas centrés un par un), mais la colonne
       elle-même se centre dans le dialog. */
    .scan-shell {
        /* Le dialog est plafonné à 85vw (Modal.svelte) et .modal-content lui
           ajoute 2×2rem de padding : demander 84vw ICI, DANS ce padding,
           dépassait donc systématiquement les 85vw du dialog — celui-ci ne
           pouvait jamais devenir assez large pour contenir son propre
           contenu, d'où le débordement non scrollable. On retranche le
           padding pour rester dans le budget réel du dialog. */
        width: min(640px, calc(85vw - 4rem));
        margin: 0 auto;
    }

    /* La modale de scan peut défiler si la forêt scannée est longue (le <dialog>
       est le conteneur de scroll, via son overflow:auto par défaut) : on garde les
       actions accrochées en bas plutôt que de devoir scroller jusqu'au bout pour
       les retrouver. Les marges négatives compensent le padding de .modal-content
       (défini dans Modal.svelte) pour venir affleurer le bord du dialog une fois
       collé — ses coins sont naturellement rognés par le border-radius du dialog
       lui-même. */
    .sticky-actions {
        position: sticky;
        bottom: 0;
        z-index: 5;
        background: var(--surface-raised);
        margin: 1rem -2rem -2rem;
        padding: 0.75rem 2rem 1.5rem;
        box-shadow: 0 -8px 12px -8px rgba(0, 0, 0, 0.08);
    }

    /* Les 3 actions se partagent la largeur pour tenir sur une seule ligne,
       même dans une modale étroite sur mobile. */
    .modal-backdrop {
        display: flex;
        flex-wrap: nowrap;
        gap: 0.4rem;
    }
    .modal-backdrop :global(.add-a-tree-container) {
        flex: 0.8 1 0;
        min-width: 0;
    }
    .modal-backdrop :global(.add-tree-trigger) {
        width: 100%;
    }
    .modal-backdrop .btn {
        flex: 1 1 0;
        min-width: 0;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        font-size: 0.82rem;
        white-space: nowrap;
    }
</style>

