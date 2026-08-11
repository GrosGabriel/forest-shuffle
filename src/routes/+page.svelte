<!-- SimpleImageLoader.svelte -->
<script lang="ts">
  import detectCards from "$lib/detection/yolo"
  import { FR_CARDS } from "$lib/i18n/fr-cards"
  import { predictionsToRealForest } from "../model/prediction-yolo-to-real-forest"
  import { toGlauresForests } from "../model/to-glaure-forest.js"

  import ForestView from "$lib/components/ForestView.svelte";
  import CaveView from "$lib/components/CaveView.svelte";
  import PlayerView from "$lib/components/PlayersView.svelte";
  import AddATreeView from "$lib/components/AddATreeView.svelte";
  import ForestScanView from "$lib/components/ForestScanView.svelte";
  import Modal from "$lib/components/Modal.svelte";


  import { usePlayerState } from "$lib/states/playerState.svelte.js";
  import { useRealForestState } from "$lib/states/realForestState.svelte.js";
  import { useGlauresForestState } from "$lib/states/glauresForestState.svelte.js";
  import { useCaveState } from "$lib/states/caveState.svelte.js";
  import { usePredictionsState } from "$lib/states/predictionsState.svelte.js";
  import { useImageUrlState } from "$lib/states/imageUrlState.svelte.js";
  import { useForestScanState } from "$lib/states/forestScanState.svelte.js";




  const playerState = usePlayerState();

  //let allPlayers = $derived(playerState.allPlayers);
  //let currentPlayer = $derived(playerState.player);

  const imageUrlState = useImageUrlState() as any;
  const predictionsState = usePredictionsState() as any;
  let loading = $state(false);

  
  const forestScanState = useForestScanState() as any;
  


  function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement
    if (!target.files?.length) return

    const file = target.files[0]
    imageUrlState.imageUrl[playerState.player] = URL.createObjectURL(file)

    // Lance la détection une fois qu'on a validé ensuite.

  } 

  async function handleScanChange(event: Event) {
    const target = event.target as HTMLInputElement
    if (!target.files?.length) return
    const scan = URL.createObjectURL(target.files[0]);

    let preds = await detectCards(scan)
    
    // realForestState.loadFromPredictions(playerState.player, preds)
    // NON ICI ON VEUT CREER UN NOUVEL OBJECT FORET INDEPENDEMMENT DES JOUEURS, VOIR A QUOI RESSEMBLE CETTE FORET, 
    // FAIRE DES MODIFS DESSUS, PUIS AVOIR LA POSSIBILITE DE MERGE AVEC LA FORET DU JOUEUR CURRENT.
    
    //forestScanState.forestScan = predictionsToRealForest(playerState.player,preds);
    forestScanState.forestScan = predictionsToRealForest("scan", preds);  

    forestScanState.openModalScan = true;

  }


  function rotateImage90(img: HTMLImageElement): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      canvas.width = img.height;
      canvas.height = img.width;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(- Math.PI / 2);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const rotatedImg = new Image();
      rotatedImg.onload = () => resolve(rotatedImg);
      rotatedImg.src = canvas.toDataURL("image/jpeg");
    });
  }

async function rotateAndStore() {
  if (!imageUrlState.imageUrl[playerState.player]) return;

  // Load the current URL string into an HTMLImageElement for canvas use
  const currentUrl = imageUrlState.imageUrl[playerState.player];
  const img = new Image();
  await new Promise<void>((resolve) => { img.onload = () => resolve(); img.src = currentUrl; });

  // rotateImage90 returns an HTMLImageElement — store only its .src (a data URL) back into state
  const rotatedImg = await rotateImage90(img);
  imageUrlState.imageUrl[playerState.player] = rotatedImg.src;


}

 async function validerImage() {
    loading = true
    predictionsState.predictions[playerState.player] = await detectCards(imageUrlState.imageUrl[playerState.player])
    realForestState.loadFromPredictions(playerState.player, predictionsState.predictions[playerState.player])
    loading = false
 }
  
  const realForestState = useRealForestState() as any;

  //let realForest = $derived(realForestState.realForest as Record<string, any>);

  const glauresForestState = useGlauresForestState();
  
  $effect(() => {
      const allRealForests = Object.values(realForestState.realForest as Record<string, any>)
          .filter(rf => rf?.forest?.length > 0)
      
      if (!allRealForests.length) return

      glauresForestState.loadForPlayer(
          playerState.player,
          allRealForests,
          caveState.caves
      )
  })
  
  const caveState = useCaveState() as any;
  
/*
  let allForests = $state([] as any[])
  $effect(() => {
    const currentRealForest = realForestState.realForest[currentPlayer];
    if (!currentRealForest) {
      allForests = [];
      return;
    }
    allForests = toGlauresForests([currentRealForest]);
  })

  let debugAllForests = $state([] as any[])
  $effect(() => {
    debugAllForests = allForests.map((forest: any) => ({
      playerName: forest.currentPlayer,
      points: forest.points,

      treeCounts: {
        beech: forest.beechCount,
        oak: forest.oakCount,
        birch: forest.birchCount
      },

      cards: forest.cards
        .filter((card: any) => card.count > 0)
        .map((card: any) => ({
          name: card.name,
          count: card.count,
          points: card.points,

          params: card.params?.map((param: any) => ({
            name: param.name,
            value: param.value
          }))
        }))
    }))
  }) 
*/
</script>



<div class="page-shell">
  <PlayerView />


<div class="container">
  <label class="btn btn-primary upload-button">
    Charger un JPG
    <input type="file" accept="image/jpeg,.jpg" capture = "environment" onchange={handleFileChange} />
  </label>

  {#if imageUrlState.imageUrl[playerState.player]}
    <img src={imageUrlState.imageUrl[playerState.player]} alt="Preview" width="640" height="640" class="upload-preview" />

    <div class="action-row">
      <button class="btn btn-secondary" onclick={rotateAndStore} disabled={loading}>
        Tourner 90°
      </button>
      <button class="btn btn-primary" onclick={validerImage} disabled={loading}>Valider (prédire la forêt)</button>
    </div>
  {/if}

  {#if loading}
    <p>Analyse en cours...</p>
  {/if}


  <!-- Ouvrir un modal de modification de la fôret scannée, puis bouton pour valider et ajouter le scan à la fôret du joueur-->
  <Modal open={forestScanState.openModalScan} onclose={() => {forestScanState.openModalScan = false; forestScanState.forestScan = null;}}>
    
    {#if forestScanState.openModalScan}

      <ForestScanView on:close={() => {forestScanState.openModalScan = false; forestScanState.forestScan = null;}}/>

    {/if}
  </Modal>
  
  

<!--  Confidence des prédictions 
  {#if predictions.length > 0}
    <ul>
      {#each predictions as p}
        <li>
            {FR_CARDS[p.card?.glCardName ?? '?']} - {(p.confidence * 100).toFixed(1)}% de confiance
        </li>
      {/each}
    </ul>
  {/if} -->


  <!--
  {#if realForestState.realForest[playerState.player]?.forest.length > 0}
    <h2>Forêt détectée :</h2>
    <pre>{JSON.stringify(realForestState.realForest, null, 2)}</pre>
  {/if}  -->



<!--
{#if predictions[currentPlayer]?.length > 0}

  <h2>Forêt glaure:</h2>  
    <pre>{JSON.stringify(debugAllForests, null, 2)}</pre>

{/if} -->




  <CaveView />

  {#if realForestState.realForest[playerState.player]?.forest.length > 0}

  <ForestView forest={realForestState.realForest[playerState.player] ? realForestState.realForest[playerState.player].forest : []} />

  {/if}
  </div>
</div>


<!-- Boutons flottants fixes en bas d'écran -->
<div class="bottom-ribbon">
  <div class="fab-row">
    <AddATreeView floating={true} label="+ arbre" />

    <label class="fab scan-button">
      Charger un bout de forêt
      <input type="file" accept="image/jpeg,.jpg" capture="environment" onchange={handleScanChange} />
    </label>
  </div>
</div>

<style>

  /* Les <label> font office de bouton ; l'input file natif reste présent
     pour l'accessibilité/le clic mais n'a pas à s'afficher lui-même. */
  .upload-button input[type="file"],
  .scan-button input[type="file"] {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Aperçu de la photo chargée : un petit rectangle juste pour vérifier le
     cadrage avant de tourner/valider, pas une pleine page (640x640 natif avant).
     Pas de aspect-ratio forcé : la photo garde ses proportions réelles plutôt
     que d'être plaquée dans un carré avec des bandes vides. */
  .upload-preview {
    display: block;
    width: auto;
    height: auto;
    max-width: 140px;
    max-height: 140px;
    object-fit: contain;
    margin: 0.75rem 0;
    border-radius: var(--radius-btn);
    border: 1px solid var(--border);
    background: var(--surface-sunken);
  }

  .action-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    margin: 0.75rem 0;
  }

  .bottom-ribbon {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 0.9rem 1rem calc(0.9rem + env(safe-area-inset-bottom));
    pointer-events: none; /* seule la rangée de boutons doit être cliquable, pas toute la bande */
    z-index: 100; /* pour rester au-dessus du contenu et sous les modales éventuelles */
  }

  .fab-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.6rem;
    pointer-events: auto;
  }

  /* Évite que le contenu principal soit caché sous le bouton flottant */
  .container {
    padding-bottom: 5rem;
  }

  /* Colonne partagée : sur un écran large, tout le contenu (menu joueurs,
     boutons, grotte, arbres) reste groupé et aligné à gauche à l'intérieur —
     PAS centré élément par élément — mais la colonne elle-même est centrée
     sur la page, pour rester alignée avec le ruban de boutons du bas. */
  .page-shell {
    max-width: 720px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  /* Même largeur que .page-shell pour que les boutons flottants restent
     alignés avec le contenu au-dessus, plutôt que centrés sur tout l'écran. */
  .fab-row {
    max-width: 720px;
    width: 100%;
  }
</style>



