<script>
    import { useRealForestState } from "$lib/states/realForestState.svelte.js";
    import { usePlayerState } from "$lib/states/playerState.svelte.js";

    import cards from "../../model/glaure/cards.js";
    import { FR_CARDS } from "$lib/i18n/fr-cards";

    const realForestState = useRealForestState();
    const playerState = usePlayerState();


    let openModalNewTree = $state(false);

    let selectedCard = $state("treeSaplings"); //pousse d'arbre par défaut

    const bases = cards.filter(c => c.symbols.includes("tree") || c.symbols.includes("shrub"));
    
</script>

<div class="add-a-tree-container">
    <button onclick={() => {openModalNewTree = true;}}> + </button>
</div>

{#if openModalNewTree}
    <div class="modal">
        <div class="modal-content">
        
        <h3>Choisissez la base</h3>
        
        {#each bases as base}
        <button class="tree-selector" onclick={() => {openModalNewTree = false; realForestState.addTree(playerState.player, base.name); }}>
            {FR_CARDS[base.name]}
        </button>
        {/each}
        
        
        </div>
    </div>

{/if}



<style>

</style>
