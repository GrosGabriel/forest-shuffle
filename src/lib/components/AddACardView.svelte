<script>
    import { useRealForestState } from "$lib/states/realForestState.svelte.js";
    import { usePlayerState } from "$lib/states/playerState.svelte.js";
    import { useCardModifState } from "$lib/states/cardModifState.svelte.js";
    import { useTreeModifState } from "$lib/states/treeModifState.svelte.js";
    import { useForestScanState } from "$lib/states/forestScanState.svelte.js";
    import { cardStyle, resolveColor, lighten } from "../utils/foretStyle.js";

    import { FR_CARDS } from "$lib/i18n/fr-cards";
    import cards from "../../model/glaure/cards.js";

    import CardToModifView from "./CardToModifView.svelte";
    import LievreCountView from "./LievreCountView.svelte";
    import Modal from "./Modal.svelte";

    import { createEventDispatcher } from "svelte";


    const { idTree } = $props();

    let openModalLievreCount = $state(false);
    let lievreCountSide = $state(null); // "left" ou "right" — quel côté est concerné



    const dispatch = createEventDispatcher();

    function closeModal() {
        dispatch("close");
    }

    const realForestState = useRealForestState();
    const playerState = usePlayerState();


    

    const cardModifState = useCardModifState();
    
    const treeModifState = useTreeModifState();

    const forestScanState = useForestScanState();


    function validerModal() {
        // Mettre à jour la forêt réelle avec les modifications du nouvel arbre
        // dépend de si c'est sur la forêt réelle, ou bien sur une forêt scannée

        if (forestScanState.openModalScan) {
            // On est sur la forêt scannée, on met à jour la forêt scannée
            forestScanState.updateTree(idTree, JSON.parse(JSON.stringify(treeModifState.treeToModif)));
        } else {
            // On est sur la forêt réelle, on met à jour la forêt réelle
            realForestState.updateTree(playerState.player, idTree, JSON.parse(JSON.stringify(treeModifState.treeToModif))); 
        }
        closeModal();
    }
    

    function ortieOnTheTree(tree) {
        return tree.down.some(card => card.cardName === "stingingNettle");
    }

    function canAddButterfly(tree) {
        const hasOrtie = ortieOnTheTree(tree);
        const upIsEmpty = tree.up.length === 0;
        const upHasOnlyButterflies = tree.up.every(card =>
            cards.find(c => c.name === card.cardName)?.symbols.includes("butterfly")
        );
        return hasOrtie && (!upIsEmpty) && upHasOnlyButterflies;
    }

    function canOnlyAddButterfly(tree) {
        const hasOrtie = ortieOnTheTree(tree);
        const upHasOnlyButterflies = tree.up.every(card =>
            cards.find(c => c.name === card.cardName)?.symbols.includes("butterfly")
        );
        const upIsEmpty = tree.up.length === 0;
        return hasOrtie && upHasOnlyButterflies && (!upIsEmpty);
    }

    function canAddCoucou(tree) {
        if (tree.up.length !== 1) {
            return false
        }
        return cards.find(c => c.name === tree.up[0].cardName)?.symbols.includes("bird");
    }

    function canOnlyAddLievre(tree,side) {
        if (!side) {
            return false;
        }
        if (tree[side].length === 0) {
            return false
        } 
        return tree[side][0].cardName === "europeanHare";
    }

    function canAddCrapaudCommun(tree) {
        if (tree.down.length !== 1) {
            return false;
        }
        return tree.down[0].cardName === "commonToad" && tree.down.length == 1;
    }


</script>





<div class="modal"> 
    <div class="modal-content">
    
    <h3>Modifiez votre arbre</h3>
        <div class="forest-root">
        <div class="trees-row">
    
            <div class="tree-cluster">

                <!-- UP row -->
                <div class="card-row row-up">

                {#if (treeModifState.treeToModif?.up.length == 0)}
                    <button class = "card" 
                    onclick = {() => {
                        const newCard = {
                            id : crypto.randomUUID(),
                            cardName : "redSquirrel",
                            color : "none"
                        }
                        treeModifState.addCard("up", newCard);
                        cardModifState.idCardToModif = newCard.id;
                        cardModifState.cardToModif = JSON.parse(JSON.stringify(newCard));
                        cardModifState.isNewCard = true;
                        cardModifState.sideCardToModif = "up";
                        cardModifState.openModalModifCard = true;

                    }}>
                    <span class="card-name"> + </span>
                    </button>
                {/if}
                
                {#if canAddButterfly(treeModifState.treeToModif)} <!--On peut ajouter plusieurs papillons en haut-->
                    <button class="card"
                    onclick={() => {
                        const newCard = {
                            id : crypto.randomUUID(),
                            cardName : "purpleEmperor",
                            color : "none",
                        }
                        treeModifState.addCard("up", newCard);
                        cardModifState.idCardToModif = newCard.id;
                        cardModifState.somethingSpecial = true;
                        cardModifState.multipleButterflies = true;
                        cardModifState.cardToModif = JSON.parse(JSON.stringify(newCard));
                        cardModifState.isNewCard = true;
                        cardModifState.sideCardToModif = "up";
                        cardModifState.openModalModifCard = true;
                    }}
                    >
                    <span class="card-name"> + </span>
                    </button>
                {/if}

                {#if canAddCoucou(treeModifState.treeToModif)} <!--On peut ajouter un coucou-->    
                    <button class="card"
                    onclick={() => {
                        const newCard = {
                            id : crypto.randomUUID(),
                            cardName : "cuckoo",
                            color : "vert-clair",
                        }
                        treeModifState.addCard("up", newCard);
                        cardModifState.idCardToModif = newCard.id;
                        cardModifState.somethingSpecial = true;
                        cardModifState.addingCoucou = true;
                        cardModifState.cardToModif = JSON.parse(JSON.stringify(newCard));
                        cardModifState.isNewCard = true;
                        cardModifState.sideCardToModif = "up";
                        cardModifState.openModalModifCard = true;
                    }}>
                    <span class="card-name"> + </span>
                    </button>
                {/if}

                {#each treeModifState.treeToModif?.up as card}
                    <button class="card" style={cardStyle(card.color)}
                    onclick={() => {
                        cardModifState.idCardToModif = card.id;
                        cardModifState.cardToModif = JSON.parse(JSON.stringify(card));
                        cardModifState.sideCardToModif = "up";
                        cardModifState.isNewCard = false;

                        const isCoucou = card.cardName === "cuckoo";
                        const hasCoucouOnTree = treeModifState.treeToModif.up.some(c => c.cardName === "cuckoo");
                        const isOiseau = cards.find(c => c.name === card.cardName)?.symbols.includes("bird");

                        if (isCoucou) {
                            // On a cliqué sur le coucou => propose seulement des coucous
                            cardModifState.somethingSpecial = true;
                            cardModifState.addingCoucou = true;
                        } else if (isOiseau && hasCoucouOnTree) {
                            // On a cliqué sur oiseau et ya un coucou => que des oiseaux
                            cardModifState.somethingSpecial = true;
                            cardModifState.onlyBirds = true;
                        }
                        cardModifState.openModalModifCard = true;
                    }} 
                    >
                    {#if card.color === 'none'}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <span class="ribbon ribbon-none"
                        role="button"
                        tabindex="0"
                        onclick={(e) => {
                            e.stopPropagation(); // Empêche le clic de se propager au bouton parent
                            cardModifState.idCardToModif = card.id;
                            cardModifState.cardToModif = JSON.parse(JSON.stringify(card));
                            cardModifState.somethingSpecial = true;
                            cardModifState.modifyColor = true;
                            cardModifState.colorToModify = "none";
                            cardModifState.isNewCard = false;
                            cardModifState.sideCardToModif = "up";
                            cardModifState.openModalModifCard = true;
                        }}
                        >
                            <span class="ribbon-icon">!</span>
                        </span>
                    {:else}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <span class="ribbon" style={`background:${resolveColor(card.color)}`}
                        role="button"
                        tabindex="0"
                        onclick={(e) => {
                            e.stopPropagation(); // Empêche le clic de se propager au bouton parent
                            cardModifState.idCardToModif = card.id;
                            cardModifState.cardToModif = JSON.parse(JSON.stringify(card));
                            cardModifState.somethingSpecial = true;
                            cardModifState.modifyColor = true;
                            cardModifState.colorToModify = card.color;
                            cardModifState.isNewCard = false;
                            cardModifState.sideCardToModif = "up";
                            cardModifState.openModalModifCard = true;
                        }}
                        ></span>
                    {/if}
                    <span class="card-name">{FR_CARDS[card.cardName]}</span>
                    </button>
                {/each}

                
                </div>

                
                <!-- LEFT-->
            
                <div class="card-col col-left">

                    {#if treeModifState.treeToModif?.left.length == 0}
                    <button class = "card" 
                    onclick = {() => {
                        const newCard = {
                            id : crypto.randomUUID(),
                            cardName : "elk",
                            color : "vert-clair"
                        }
                        treeModifState.addCard("left", newCard);
                        cardModifState.idCardToModif = newCard.id;
                        cardModifState.cardToModif = JSON.parse(JSON.stringify(newCard));
                        cardModifState.isNewCard = true;
                        cardModifState.sideCardToModif = "left";
                        cardModifState.openModalModifCard = true;

                    }}>
                    <span class="card-name"> + </span>
                    </button>
                    {/if}

                    {#if canOnlyAddLievre(treeModifState.treeToModif,"left")}
                        <!-- Au moins 1 lièvre déjà présent (1 ou plusieurs) : bouton +
                             pour en ajouter d'autres, via le compteur par couleur.
                             Placé avant la carte pour être affiché à sa gauche (côté
                             extérieur, loin de l'arbre). -->
                        <button class="card"
                        onclick={() => {
                            lievreCountSide = "left";
                            openModalLievreCount = true;
                        }}
                        >
                        <span class="card-name"> + </span>
                        </button>
                    {/if}

                    {#if treeModifState.treeToModif?.left.length > 1}
                        <!-- Pile de lièvres (2+) : une seule carte "+N" plutôt que plusieurs
                             côte à côte — ouvre le compteur par couleur (LievreCountView). -->
                        <button class="card" style={cardStyle(treeModifState.treeToModif.left[0].color)}
                        onclick={() => {
                            lievreCountSide = "left";
                            openModalLievreCount = true;
                        }}
                        >
                            <span class="stack-badge">+{treeModifState.treeToModif.left.length - 1}</span>
                            <span class="card-name">{FR_CARDS[treeModifState.treeToModif.left[0].cardName]}</span>
                        </button>
                    {:else}
                    {#each treeModifState.treeToModif?.left as card}
                    <button class="card" style={cardStyle(card.color)}
                    onclick={() => {
                        cardModifState.idCardToModif = card.id;
                        cardModifState.cardToModif = JSON.parse(JSON.stringify(card));
                        cardModifState.isNewCard = false;
                        cardModifState.sideCardToModif = "left";
                        cardModifState.openModalModifCard = true;
                    }}
                    >
                        {#if card.color === 'none'}
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <span class="ribbon ribbon-none"
                            role="button"
                            tabindex="0"
                            onclick={(e) => {
                                e.stopPropagation(); // Empêche le clic de se propager au bouton parent
                                cardModifState.idCardToModif = card.id;
                                cardModifState.cardToModif = JSON.parse(JSON.stringify(card));
                                cardModifState.somethingSpecial = true;
                                cardModifState.modifyColor = true;
                                cardModifState.colorToModify = "none";
                                cardModifState.isNewCard = false;
                                cardModifState.sideCardToModif = "left";
                                cardModifState.openModalModifCard = true;
                            }}
                            >
                                <span class="ribbon-icon">!</span>
                            </span>
                        {:else}
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <span class="ribbon" style={`background:${resolveColor(card.color)}`}
                            role="button"
                            tabindex="0"
                            onclick={(e) => {
                                e.stopPropagation(); // Empêche le clic de se propager au bouton parent
                                cardModifState.idCardToModif = card.id;
                                cardModifState.cardToModif = JSON.parse(JSON.stringify(card));
                                cardModifState.somethingSpecial = true;
                                cardModifState.modifyColor = true;
                                cardModifState.colorToModify = card.color;
                                cardModifState.isNewCard = false;
                                cardModifState.sideCardToModif = "left";
                                cardModifState.openModalModifCard = true;
                            }}
                            ></span>
                        {/if}
                        <span class="card-name">{FR_CARDS[card.cardName]}</span>
                    </button>
                    {/each}
                    {/if}


                </div>


                <!-- TREE CARD -->
                

                    <button class="tree-card" style={`--tree-color: ${resolveColor(treeModifState.treeToModif?.symbol)}; --tree-soft: ${lighten(resolveColor(treeModifState.treeToModif?.symbol), 72)};`}
                    onclick={() => {
                        cardModifState.idCardToModif = treeModifState.idTreeToModif;
                        cardModifState.openModalModifCard = true;
                    }}
                    >
                    {#if treeModifState.treeToModif?.symbol === 'none'}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <span class="tree-ribbon tree-ribbon-none"
                        role = "button"
                        tabindex="0"
                        onclick={(e) => {
                            e.stopPropagation(); //Empeche le clic de se propager au bouton parent.
                            cardModifState.idCardToModif = treeModifState.idTreeToModif;
                            cardModifState.somethingSpecial = true;
                            cardModifState.modifyColor = true;
                            cardModifState.colorToModify = "none";
                            cardModifState.isNewCard = false;
                            cardModifState.openModalModifCard = true;
                        }}
                        >
                            <span class="tree-ribbon-icon">!</span>
                        </span>
                    {:else}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <span class="tree-ribbon" style={`background:${resolveColor(treeModifState.treeToModif?.symbol)}`}
                        role = "button"
                        tabindex="0"
                        onclick={(e) => {
                            e.stopPropagation(); //Empeche le clic de se propager au bouton parent.
                            cardModifState.idCardToModif = treeModifState.idTreeToModif;
                            cardModifState.somethingSpecial = true;
                            cardModifState.modifyColor = true;
                            cardModifState.colorToModify = "none";
                            cardModifState.isNewCard = false;
                            cardModifState.openModalModifCard = true;
                        }}
                        ></span>
                    {/if}
                    <span class="tree-icon">{cards.find(c => c.name === treeModifState.treeToModif?.tree)?.symbols?.includes('tree') ? '🌳' : '🌿'}</span>
                    <span class="tree-name">{FR_CARDS[treeModifState.treeToModif?.tree]}</span>
                    </button>


                <!-- RIGHT -->
                <div class="card-col col-right">
                    {#if treeModifState.treeToModif?.right.length > 1}
                        <!-- Pile de lièvres (2+) : une seule carte "+N" plutôt que plusieurs
                             côte à côte — ouvre le compteur par couleur (LievreCountView). -->
                        <button class="card" style={cardStyle(treeModifState.treeToModif.right[0].color)}
                        onclick={() => {
                            lievreCountSide = "right";
                            openModalLievreCount = true;
                        }}
                        >
                            <span class="stack-badge">+{treeModifState.treeToModif.right.length - 1}</span>
                            <span class="card-name">{FR_CARDS[treeModifState.treeToModif.right[0].cardName]}</span>
                        </button>
                    {:else}
                    {#each treeModifState.treeToModif?.right as card}
                    <button class="card" style={cardStyle(card.color)}
                    onclick={() => {
                        cardModifState.idCardToModif = card.id;
                        cardModifState.openModalModifCard = true;
                        cardModifState.isNewCard = false;
                        cardModifState.sideCardToModif = "right";
                        cardModifState.cardToModif = JSON.parse(JSON.stringify(card));
                    }}
                    >
                        {#if card.color === 'none'}
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <span class="ribbon ribbon-none"
                            role="button"
                            tabindex="0"
                            onclick={(e) => {
                                e.stopPropagation(); // Empêche le clic de se propager au bouton parent
                                cardModifState.idCardToModif = card.id;
                                cardModifState.cardToModif = JSON.parse(JSON.stringify(card));
                                cardModifState.somethingSpecial = true;
                                cardModifState.modifyColor = true;
                                cardModifState.colorToModify = "none";
                                cardModifState.isNewCard = false;
                                cardModifState.sideCardToModif = "right";
                                cardModifState.openModalModifCard = true;
                            }}
                            >
                                <span class="ribbon-icon">!</span>
                            </span>
                        {:else}
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <span class="ribbon" style={`background:${resolveColor(card.color)}`}
                            role="button"
                            tabindex="0"
                            onclick={(e) => {
                                e.stopPropagation(); // Empêche le clic de se propager au bouton parent
                                cardModifState.idCardToModif = card.id;
                                cardModifState.cardToModif = JSON.parse(JSON.stringify(card));
                                cardModifState.somethingSpecial = true;
                                cardModifState.modifyColor = true;
                                cardModifState.colorToModify = card.color;
                                cardModifState.isNewCard = false;
                                cardModifState.sideCardToModif = "right";
                                cardModifState.openModalModifCard = true;
                            }}
                            ></span>
                        {/if}
                        <span class="card-name">{FR_CARDS[card.cardName]}</span>
                    </button>
                    {/each}


                    {#if treeModifState.treeToModif?.right.length == 0}
                    <button class = "card"
                    onclick = {() => {
                        const newCard = {
                            id : crypto.randomUUID(),
                            cardName : "troll",
                            color : "gris"
                        }
                        treeModifState.addCard("right", newCard);
                        cardModifState.idCardToModif = newCard.id;
                        cardModifState.cardToModif = JSON.parse(JSON.stringify(newCard));
                        cardModifState.isNewCard = true;
                        cardModifState.sideCardToModif = "right";
                        cardModifState.openModalModifCard = true;

                    }}>
                    <span class="card-name"> + </span>
                    </button>
                {/if}
                    {/if}

                    {#if canOnlyAddLievre(treeModifState.treeToModif,"right")}
                        <!-- Au moins 1 lièvre déjà présent (1 ou plusieurs) : bouton +
                             pour en ajouter d'autres, via le compteur par couleur. -->
                        <button class="card"
                        onclick={() => {
                            lievreCountSide = "right";
                            openModalLievreCount = true;
                        }}
                        >
                        <span class="card-name"> + </span>
                        </button>
                    {/if}

                </div>
            

                <!-- DOWN row -->
                <div class="card-row row-down">

                {#each treeModifState.treeToModif?.down as card}
                    <button class="card" style={cardStyle(card.color)}
                    onclick={() => {
                        cardModifState.idCardToModif = card.id;
                        cardModifState.cardToModif = JSON.parse(JSON.stringify(card));
                        cardModifState.isNewCard = false;
                        cardModifState.sideCardToModif = "down";
                        cardModifState.openModalModifCard = true;
                    }}
                    >
                    {#if card.color === 'none'}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <span class="ribbon ribbon-none"
                        role="button"
                        tabindex="0"
                        onclick={(e) => {
                            e.stopPropagation(); // Empêche le clic de se propager au bouton parent
                            cardModifState.idCardToModif = card.id;
                            cardModifState.cardToModif = JSON.parse(JSON.stringify(card));
                            cardModifState.somethingSpecial = true;
                            cardModifState.modifyColor = true;
                            cardModifState.colorToModify = "none";
                            cardModifState.isNewCard = false;
                            cardModifState.sideCardToModif = "down";
                            cardModifState.openModalModifCard = true;
                        }}
                        >
                            <span class="ribbon-icon">!</span>
                        </span>
                    {:else}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <span class="ribbon" style={`background:${resolveColor(card.color)}`}
                        role="button"
                        tabindex="0"
                        onclick={(e) => {
                            e.stopPropagation(); // Empêche le clic de se propager au bouton parent
                            cardModifState.idCardToModif = card.id;
                            cardModifState.cardToModif = JSON.parse(JSON.stringify(card));
                            cardModifState.somethingSpecial = true;
                            cardModifState.modifyColor = true;
                            cardModifState.colorToModify = card.color;
                            cardModifState.isNewCard = false;
                            cardModifState.sideCardToModif = "down";
                            cardModifState.openModalModifCard = true;
                        }}
                        ></span>
                    {/if}
                    <span class="card-name">{FR_CARDS[card.cardName]}</span>
                    </button>
                {/each}

                {#if treeModifState.treeToModif?.down.length == 0}
                    <button class = "card" 
                    onclick = {() => {
                        const newCard = {
                            id : crypto.randomUUID(),
                            cardName : "edelweiss",
                            color : "none"
                        }
                        treeModifState.addCard("down", newCard);
                        cardModifState.idCardToModif = newCard.id;
                        cardModifState.cardToModif = JSON.parse(JSON.stringify(newCard));
                        cardModifState.isNewCard = true;
                        cardModifState.sideCardToModif = "down";
                        cardModifState.openModalModifCard = true;

                    }}>
                    <span class="card-name"> + </span>
                    </button>
                {/if}

                {#if canAddCrapaudCommun(treeModifState.treeToModif)} <!--On peut ajouter un crapaud commun-->    
                    <button class="card"
                    onclick={() => {
                        const newCard = {
                            id : crypto.randomUUID(),
                            cardName : "commonToad",
                            color : "none",
                        }
                        treeModifState.addCard("down", newCard);
                        cardModifState.idCardToModif = newCard.id;
                        cardModifState.somethingSpecial = true;
                        cardModifState.addingCrapaudCommun = true;
                        cardModifState.cardToModif = JSON.parse(JSON.stringify(newCard));
                        cardModifState.isNewCard = true;
                        cardModifState.sideCardToModif = "down";
                        cardModifState.openModalModifCard = true;
                    }}>
                    <span class="card-name"> + </span>
                    </button>
                {/if}
                

                </div>

            </div>
        
        </div>
        </div>
    
    </div>
</div>

<div class="sticky-actions">
<div class="modal-backdrop">
    <button onclick={closeModal} class="btn btn-ghost action-cancel">Annuler</button>
    <button onclick={validerModal} class="btn btn-primary action-validate">Valider</button>
    <button onclick={() => {
        if (forestScanState.openModalScan) {
            // On est sur la forêt scannée, on supprime l'arbre de la forêt scannée
            forestScanState.deleteTree(idTree);
        } else {
            // On est sur la forêt réelle, on supprime l'arbre de la forêt réelle
            realForestState.deleteTree(playerState.player, treeModifState.idTreeToModif);
        }
        closeModal();}} class="btn btn-danger action-delete"
        >
        Supprimer l'arbre
    </button>
</div>
</div>

<Modal open={cardModifState.openModalModifCard} onclose={() => {
                                                    // Supprimer la carte seulement si nouvelle ET pas validée
                                                    if (cardModifState.isNewCard && !cardModifState.validated && cardModifState.cardToModif) {
                                                        treeModifState.deleteCard(cardModifState.cardToModif)
                                                    }
                                                       // Reset
                                                    cardModifState.validated = false
                                                    cardModifState.isNewCard = false
                                                    cardModifState.openModalModifCard = false; 
                                                    cardModifState.idCardToModif = null; 
                                                    cardModifState.somethingSpecial = false;
                                                    cardModifState.sideCardToModif = null;
                                                    cardModifState.cardToModif = null;
                                                    cardModifState.multipleButterflies = false;
                                                    cardModifState.addingCoucou = false;
                                                    cardModifState.addingLievre = false;
                                                    cardModifState.addingCrapaudCommun = false;
                                                    cardModifState.modifyColor = false;
                                                    cardModifState.colorToModify = null;
                                                    cardModifState.onlyBirds = false;

                                                    }}>
    <CardToModifView  on:close={() => {
                            cardModifState.sideCardToModif = null;
                            cardModifState.somethingSpecial = false;
                            cardModifState.openModalModifCard = false;
                            cardModifState.idCardToModif = null;
                            cardModifState.sideCardToModif = null;
                            }} />
</Modal>

<Modal open={openModalLievreCount} onclose={() => { openModalLievreCount = false; }}>
    {#if openModalLievreCount}
        <LievreCountView side={lievreCountSide} on:close={() => { openModalLievreCount = false; }} />
    {/if}
</Modal>


<style>
  /* Polices chargées globalement via $lib/styles/tokens.css */

  .forest-root {
    font-family: 'DM Mono', monospace;
    background: linear-gradient(180deg, #ffffff 0%, #f5f7f2 100%);
    /* min-height: 100vh; */
    padding: 2.5rem 2rem;
    color: #374151;

    /* Si l'arbre a beaucoup de cartes d'un côté, l'éditeur défile horizontalement
       sur lui-même plutôt que de déborder de la modale (même filet de sécurité
       que ForestView.svelte). */
    overflow-x: auto;

    --tree-w: 100px;
    --tree-h: calc(var(--tree-w) * 7 / 5);
  }


  .tree-cluster {
    display: grid;
    grid-template-areas:
        ".      top    ."
        "left   tree   right"
        ".      bottom .";
    /* Largeur fixe (pas max-content) pour les zones gauche/droite : l'arbre
       reste toujours exactement au centre de son cluster, qu'il y ait 0 ou
       10 cartes d'un côté. */
    grid-template-columns: var(--tree-w) var(--tree-w) var(--tree-w);
    grid-template-rows: auto minmax(var(--tree-h), auto) auto;
    align-items: center;
    justify-items: center;
    gap: 3px;
  }

  .trees-row {
    display: flex;
    flex-wrap: wrap;
    gap: 3.5rem;
    align-items: flex-end;
  }

  .card-row {
    display: flex;
    flex-direction: column; /*row*/
    gap: 6px;
    justify-content: center;
    /* Hauteur fixe même si vide */
    min-height: calc(var(--tree-h) / 2);
  }

  .card-col {
    display: flex;
    flex-direction: row; /*column*/
    gap: 1px;
    /* Largeur fixe même si vide */
    min-width: calc(var(--tree-w) / 2);
  }

  /* ── carte haut/bas : pleine largeur, moitié hauteur ── */
  .card-row .card {
    position: relative;
    width: var(--tree-w);
    height: calc(var(--tree-h) / 2);
    background: #eef1f2;
    border: 1.5px solid #d5dbe0;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px 10px;
    box-sizing: border-box;
    overflow: hidden;
    transition: border-color 0.2s, transform 0.15s;
    cursor: default;
  }

  /* ── carte gauche/droite : moitié largeur, pleine hauteur ── */
  .card-col .card {
    position: relative;
    width: calc(var(--tree-w) / 2);
    height: var(--tree-h);
    background: #eef1f2;
    border: 1.5px solid #d5dbe0;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 6px;
    box-sizing: border-box;
    overflow: hidden;
    transition: border-color 0.2s, transform 0.15s;
    cursor: default;
  }


  .card:hover {
    border-color: var(--card-color);
    transform: scale(1.04);
    z-index: 2;
  }

  .card-name {
    font-size: 0.58rem;
    line-height: 1.3;
    text-align: center;
    color: #3f4a51;
    word-break: break-word;
    hyphens: auto;
  }

  .ribbon {
    position: absolute;
    top: 0;
    right: 0;
    width: 70px; /*18 avant */
    height: 70px;
    clip-path: polygon(100% 0, 0 0, 100% 100%);
    border-radius: 0 5px 0 0;
    opacity: 0.92;
  }

  /* Pastille "+N" d'une pile de lièvres — prend la place de la banderole. */
  .stack-badge {
    /* Entièrement contenue dans la carte (décalage positif, pas de
       débordement) — fond neutre pour rester lisible quelle que soit la
       couleur de la carte en dessous. */
    position: absolute;
    /* Décalage, padding ET taille de police proportionnels à --tree-w : ce
       fichier a des cartes plus grandes que ForestView.svelte, une valeur
       fixe rendait le badge disproportionné dans l'un des deux. */
    top: calc(var(--tree-w) * 0.06);
    right: calc(var(--tree-w) * 0.06);
    background: rgba(20, 24, 18, 0.72);
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-weight: 700;
    font-size: max(10px, calc(var(--tree-w) * 0.16));
    line-height: 1;
    padding: calc(var(--tree-w) * 0.045) calc(var(--tree-w) * 0.075);
    border-radius: 999px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    white-space: nowrap;
  }

  .ribbon-none {
  background: #c7c7c7;
  width: 70px;
  height: 70px; /* 28px avant */
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
}

.ribbon-icon {
    font-size: 0.5rem;
    font-weight: 700;
    color: #e53e3e;
    background: white;
    border-radius: 50%;
    width: 10px;
    height: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 2px;
    margin-right: 2px;
    line-height: 1;
    box-shadow: 0 0 0 1px #e53e3e;
}

  /* ── carte arbre : W × H ── */
  .tree-card {
    position: relative;
    width: var(--tree-w);
    height: var(--tree-h);
    background: linear-gradient(180deg, var(--tree-soft), #eef7ea);
    border: 2px solid var(--tree-color);
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 14px 12px 12px 12px;
    box-sizing: border-box;
    overflow: hidden;
    box-shadow: 0 0 0 1px rgba(76, 126, 74, 0.08), 0 10px 26px rgba(64, 82, 59, 0.10);
    grid-area: tree; 
  }

.tree-card:hover {
    border-color: var(--card-color);
    transform: scale(1.04);
    z-index: 2;
  }


  .tree-icon {
    font-size: 1.8rem;
    line-height: 1;
  }

  .tree-name {
    font-family: 'Playfair Display', serif;
    font-size: 0.95rem;
    font-weight: 600;
    color: #38513a;
    text-align: center;
    letter-spacing: 0.02em;
  }

  .tree-ribbon {
    position: absolute;
    top: 0;
    right: 0;
    width: 70px;
    height: 70px; /* 34px avant */
    clip-path: polygon(100% 0, 0 0, 100% 100%);
    border-radius: 0 8px 0 0;
    opacity: 0.92;
  }

.tree-ribbon-none {
  background: #c7c7c7;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
}

.tree-ribbon-icon {
  font-size: 0.6rem;
  font-weight: 700;
  color: #e53e3e;
  background: white;
  border-radius: 50%;
  width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 3px;
  margin-right: 3px;
  line-height: 1;
  box-shadow: 0 0 0 1px #e53e3e;
}


.card-row.row-up    { 
  grid-area: top;    
  display: flex; 
  flex-direction: 
  column; gap: 6px; 
}

.card-row.row-down  { 
  grid-area: bottom; 
  display: flex; 
  flex-direction: 
  column; gap: 6px; 
}
.card-col.col-left  {
  grid-area: left;
  display: flex;
  flex-direction: row;
  gap: 6px;
  align-items: center;
  /* Collée contre l'arbre, s'étend vers l'extérieur (la gauche) quand il y a
     plusieurs cartes — pas centrée dans sa case, sinon la moitié des cartes
     (ou du bouton "+") déborderait vers l'arbre. */
  justify-self: end;
}

.card-col.col-right {
  grid-area: right;
  display: flex;
  flex-direction: row;
  gap: 6px;
  align-items: center;
  /* Symétrique de col-left : collée contre l'arbre, s'étend vers la droite. */
  justify-self: start;
}

/* Colle les boutons en bas du dialog pendant que seul l'éditeur d'arbre
   défile (au-dessus) — avant, tout le contenu (titre + arbre + boutons)
   scrollait ensemble, donc les boutons pouvaient sortir de l'écran. Marges
   négatives : compensent le padding de .modal-content (Modal.svelte) pour
   venir affleurer le bord du dialog une fois collé — ses coins sont
   naturellement rognés par le border-radius du dialog lui-même. */
.sticky-actions {
  position: sticky;
  bottom: 0;
  z-index: 5;
  background: var(--surface-raised);
  margin: 1rem -2rem -2rem;
  padding: 0.75rem 2rem 1.5rem;
  box-shadow: 0 -8px 12px -8px rgba(0, 0, 0, 0.08);
}

/* Rangée d'actions sous l'éditeur d'arbre — ne touche pas au visuel des cartes/arbres ci-dessus */
.modal-backdrop {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.4rem;
}


/* Les 3 boutons se partagent la largeur pour tenir sur une seule ligne,
   même dans une modale étroite sur mobile — "Annuler" est secondaire donc
   plus compact, "Supprimer l'arbre" a le texte le plus long donc plus de place. */
.modal-backdrop .btn {
  min-width: 0;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  font-size: 0.82rem;
  white-space: nowrap;
}
.action-cancel {
  flex: 0.7 1 0;
}
.action-validate {
  flex: 1 1 0;
}
.action-delete {
  flex: 1.3 1 0;
}

</style>