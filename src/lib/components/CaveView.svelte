<script>
import { usePlayerState } from "$lib/states/playerState.svelte.js";
import { useCaveState } from "$lib/states/caveState.svelte.js";
import { FR_CARDS } from "$lib/i18n/fr-cards";
import Modal from "$lib/components/Modal.svelte";
import ModifyCave from "$lib/components/ModifyCave.svelte";

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


  <Modal open={openModal} onclose={() => {openModal = false;}}>
    <ModifyCave on:close={() => {openModal = false;}} />
  </Modal>