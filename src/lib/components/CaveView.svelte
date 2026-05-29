<script>
import { usePlayerState } from "$lib/states/playerState.svelte.js";
import { useCaveState } from "$lib/states/caveState.svelte.js";
import { FR_CARDS } from "$lib/i18n/fr-cards";

const playerState = usePlayerState();
const caveState = useCaveState();

let openModal = $state(false);

</script>

  <h2>{FR_CARDS[caveState.caves[playerState.player]?.caveType ?? 'cave'] ?? 'Grotte'}</h2>
  {caveState.caves[playerState.player]?.count ?? 0}
  <button onclick = {() => caveState.addOneToCave(playerState.player)}> + 1</button>
  <button onclick = {() => caveState.removeOneFromCave(playerState.player)}> - 1</button>
  <button onclick = {() => caveState.resetCave(playerState.player)}> Reset</button>

  <!--
  <button onClick = {() => caveState.setCaveType(playerState.player,caveType)}>Modifier le type de grotte</button>  -->
  <button onclick = {() => openModal = true}>Modifier le type de grotte</button>

{#if openModal}
  <div class="modal">
    <div class="modal-content">
      <h3>Choisissez le type de grotte</h3>
      <button onclick={() => {caveState.setCaveType(playerState.player, 'cave'); openModal = false; }}>Grotte classique</button>
      <button onclick={() => {caveState.setCaveType(playerState.player, 'batCave'); openModal = false; }}>Grotte aux chauves-souris</button>
      <button onclick={() => {caveState.setCaveType(playerState.player, 'collectorsCave'); openModal = false; }}>Grotte du collectionneur</button>  
      <button onclick={() => {caveState.setCaveType(playerState.player, 'supplyCave'); openModal = false; }}>Grotte à provisions</button> 
      <button onclick={() => {caveState.setCaveType(playerState.player, 'lonelyCave'); openModal = false; }}>Grotte abandonnée</button>
      <button onclick={() => {caveState.setCaveType(playerState.player, 'smugglersCave'); openModal = false; }}>Grotte de la contrebandière</button>
    </div>
  </div>
{/if}