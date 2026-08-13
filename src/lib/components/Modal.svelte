<!-- Modal.svelte -->
<script module lang="ts">
  // Verrou de scroll du body, partagé entre toutes les instances de Modal et
  // compté plutôt que booléen : avec 2 modales ouvertes en même temps
  // (ex. éditeur d'arbre + sélecteur de carte), il ne faut déverrouiller
  // qu'à la fermeture de la dernière — sinon le fond redevient scrollable
  // dès qu'on ferme la modale du dessus.
  // showModal() bloque déjà les clics/le focus sur le fond, mais pas
  // toujours le scroll tactile (notamment iOS Safari) : sans ce verrou, on
  // peut "attraper" le scroll de la page ou d'une autre modale en dessous.
  let lockCount = 0

  function lockBodyScroll() {
    if (lockCount === 0) {
      document.body.style.overflow = 'hidden'
    }
    lockCount++
  }

  function unlockBodyScroll() {
    lockCount = Math.max(0, lockCount - 1)
    if (lockCount === 0) {
      document.body.style.overflow = ''
    }
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte'

  let { open, onclose, children } = $props()
  let dialog: HTMLDialogElement
  let isLocked = false

  $effect(() => {
    if (open) {
      dialog.showModal()  // bloque les clics extérieurs nativement
      if (!isLocked) { lockBodyScroll(); isLocked = true }
    } else {
      dialog.close()
      if (isLocked) { unlockBodyScroll(); isLocked = false }
    }

    // Si le composant disparaît pendant que la modale est ouverte, on libère
    // quand même le verrou (sinon le scroll du fond resterait bloqué).
    return () => {
      if (isLocked) { unlockBodyScroll(); isLocked = false }
    }
  })
</script>

<!-- Clic sur le backdrop (hors modal) → ferme -->
<dialog bind:this={dialog} onclose={onclose} onclick={(e) => {
  if (e.target === dialog) onclose()
}}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="modal-content" role="button" tabindex="0" onclick={(e) => e.stopPropagation()}>
    {@render children()}
  </div>
</dialog>


<style>
  dialog {
    border: none;
    border-radius: 16px;
    padding: 0;
    max-width: 85vw;
    box-shadow: 0 8px 40px rgba(0,0,0,0.18);
  }

  /* Le backdrop natif du <dialog> */
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(2px);
  }

  .modal-content {
    padding: 2rem;
    /* Sur un écran étroit, 320px de contenu + 2×2rem de padding dépasse le
       "max-width: 85vw" du dialog (dès qu'il fait moins de ~450px de large).
       En cas de conflit, min-width gagne toujours sur max-width en CSS — le
       dialog était donc forcé plus large que l'écran. On plafonne avec la
       même limite (85vw), moins le padding de cet élément, plutôt qu'un
       pourcentage : la largeur du dialog lui-même n'est pas déterminée à ce
       stade (il s'ajuste à son contenu), donc un "%" ici n'a rien de fiable
       à résoudre. */
    min-width: min(320px, calc(85vw - 4rem));
  }
</style>