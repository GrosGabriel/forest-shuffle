<script>
    import { useRealForestState } from "$lib/states/realForestState.svelte.js";
    import { usePlayerState } from "$lib/states/playerState.svelte.js";
    import { useForestScanState } from "$lib/states/forestScanState.svelte.js";

    import cards from "../../model/glaure/cards.js";
    import { FR_CARDS } from "$lib/i18n/fr-cards";
    import Modal from "./Modal.svelte";
    import { FILTRE_ICONS } from "$lib/utils/filterIcons.js";

    const realForestState = useRealForestState();
    const playerState = usePlayerState();
    const forestScanState = useForestScanState();

    let openModalNewTree = $state(false);

    let selectedCard = $state("treeSaplings"); //pousse d'arbre par défaut

    const bases = cards.filter(c => c.symbols.includes("tree") || c.symbols.includes("shrub"));
    const bases_sorted = bases.sort((a, b) =>
		FR_CARDS[a.name].localeCompare(FR_CARDS[b.name], 'fr'));

    // floating: bouton flottant façon FAB (page principale) — dans une modale (scan),
    // on garde un bouton normal dans le flux, un position:fixed y casserait la mise en page.
    let { floating = false, label = "+ Ajouter un arbre" } = $props();


    // Aucune case cochée : on affiche tout. Une case cochée : on affiche
    // seulement ce type. Les deux cochées : on affiche tout à nouveau.
    let selectedFiltres = $state({
        tree: false,
        shrub: false,
    });

    let bases_sorted_filtered = $derived.by(() => {
        return bases_sorted.filter(base => {
            if (!selectedFiltres.tree && !selectedFiltres.shrub) return true;
            if (selectedFiltres.tree && base.symbols.includes("tree")) return true;
            if (selectedFiltres.shrub && base.symbols.includes("shrub")) return true;
            return false;
        });
    });
</script>


<div class="add-a-tree-container">
    <button
        class="btn add-tree-trigger"
        class:btn-secondary={!floating}
        class:fab={floating}
        class:fab-secondary={floating}
        onclick={() => {openModalNewTree = true;}}
    >{label}</button>
</div>

<Modal open={openModalNewTree} onclose={() => {openModalNewTree = false;}}>
    <div class="modal-content">

        <h3>Choisissez la base</h3>

        <div class="filters">
            <label class="filter-item">
                <input type="checkbox" bind:checked={selectedFiltres.tree}>
                <img class="filter-icon" src={FILTRE_ICONS.tree} alt="Arbres">
            </label>
            <label class="filter-item">
                <input type="checkbox" bind:checked={selectedFiltres.shrub}>
                <img class="filter-icon" src={FILTRE_ICONS.shrub} alt="Arbustes">
            </label>
        </div>

        <div class="option-list">
            {#each bases_sorted_filtered as base}
            <button class="btn btn-secondary option-item" onclick={() => {
                openModalNewTree = false;
                selectedFiltres.tree = false;
                selectedFiltres.shrub = false;
                if (forestScanState.openModalScan) {
                    // On est sur la forêt scannée, on ajoute l'arbre à la forêt scannée
                    forestScanState.addTree(base.name);
                } else {
                    // On est sur la forêt réelle, on ajoute l'arbre à la forêt réelle
                    realForestState.addTree(playerState.player, base.name);
                }


                }}>
                {FR_CARDS[base.name]}
            </button>
            {/each}
        </div>

    </div>

</Modal>



<style>
    .add-tree-trigger:not(.fab) {
        width: 100%;
        max-width: 400px;
    }

    .modal-content h3 {
        font-family: var(--font-display);
        font-weight: 600;
        font-size: 1.15rem;
        color: var(--ink);
        margin: 0 0 1rem;
    }

    .filters {
        display: flex;
        gap: 0.5rem;
        margin: -0.5rem 0 1rem;
    }

    .filter-item {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 3px;
        border-radius: var(--radius-btn);
        border: 2px solid var(--border-strong);
        font-family: var(--font-body);
        font-size: 0.85rem;
        color: var(--ink-soft);
        cursor: pointer;
        transition: background 0.15s ease, border-color 0.15s ease;
    }
    .filter-item:has(input:checked) {
        background: var(--forest-tint-soft);
        border-color: var(--forest);
    }
    .filter-item input {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }

    .filter-icon {
        width: 34px;
        height: 34px;
        border-radius: 8px;
        object-fit: cover;
        display: block;
    }

    /* Hauteur fixe (pas max-height) : la zone ne bouge pas quand un filtre
       réduit le nombre de bases affichées, elle défile juste en interne. */
    .option-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        height: 50vh;
        overflow-y: auto;
        padding-right : 0.5rem; /* pour éviter que le scroll ne chevauche le texte */
    }

    .option-item {
        width: 100%;
        justify-content: flex-start;
        text-align: left;
    }

</style>
