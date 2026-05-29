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

  import { usePlayerState } from "$lib/states/playerState.svelte.js";
  import { useRealForestState } from "$lib/states/realForestState.svelte.js";
  import { useGlauresForestState } from "$lib/states/glauresForestState.svelte.js";
  import { useCaveState } from "$lib/states/caveState.svelte.js";
  import { usePredictionsState } from "$lib/states/predictionsState.svelte.js";
  import { useImageUrlState } from "$lib/states/imageUrlState.svelte.js";




  let playerState = usePlayerState();

  //let allPlayers = $derived(playerState.allPlayers);
  //let currentPlayer = $derived(playerState.player);

  let imageUrlState = useImageUrlState() as any;
  let predictionsState = usePredictionsState() as any;
  let loading = $state(false);
  


  async function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement
    if (!target.files?.length) return

    const file = target.files[0]
    imageUrlState.imageUrl[playerState.player] = URL.createObjectURL(file)

    // Lancer la détection dès que l'image est chargée
    const img = new Image()
    img.src = imageUrlState.imageUrl[playerState.player]
    img.onload = async () => {
      loading = true
      predictionsState.predictions[playerState.player] = await detectCards(img)
      realForestState.loadFromPredictions(playerState.player, predictionsState.predictions[playerState.player])
      loading = false
    }
  } 
  
  const realForestState = useRealForestState() as any;

  //let realForest = $derived(realForestState.realForest as Record<string, any>);

  const glauresForestState = useGlauresForestState();
  
  $effect(() => {
    const currentRealForest = realForestState.realForest[playerState.player];
    if (!currentRealForest) return;

    glauresForestState.glauresForest = currentRealForest; //On utilise le setter 
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

<PlayerView />



<div class="container">
  <label class="upload-button">
    Charger un JPG
    <input type="file" accept="image/jpeg,.jpg" capture = "environment" onchange={handleFileChange} />
  </label>

  {#if imageUrlState.imageUrl[playerState.player]}
    <img src={imageUrlState.imageUrl[playerState.player]} alt="Preview" width="640" height="640" style="object-fit:contain; display:block;" />
  {/if}

  {#if loading}
    <p>Analyse en cours...</p>
  {/if}

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

<AddATreeView />

</div>

