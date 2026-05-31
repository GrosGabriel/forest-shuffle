

let cardModifState = $state({
    openModalModifCard : false,
    idCardToModif : null, //stocke l'id de la carte qu'on veut modifier, pour le passer à AddACardView
    cardToModif : null, //stocke la carte elle même pour la modifier dans AddACardView avant de valider les modifications et de mettre à jour la forêt réelle
    somethingSpecial : false, //POur des cas spéciaux avec uniquement certaines cartes possibles à rajouter
    multipleButterflies : null, //pour savoir si on doit présenter que des papillons comme options de cartes à rajouter
    sideCardToModif : null, //pour savoir de quel côté on modifie la carte, utile pour les cas spéciaux comme les lièvres
    //lièvres, crapauds communs, coucous.
    addingCoucou : null,
    addingLievre : null,
    addingCrapaudCommun : null,
    modifyColor : false, //pour savoir si on modifie la couleur d'une carte ou si on modifie la carte elle même (utile pour les cas spéciaux comme les lièvres)
    colorToModify : "none", //pour stocker la couleur à modifier quand on modifie la couleur d'une carte
    isNewCard : false, //pour savoir si on ajoute une nouvelle carte ou si on modifie une carte déjà présente, utile pour les fenetres modales
    validated : false, //pour savoir si on a validé les modifications ou bien si on a juste fermé la fenetre modale, utile pour les fenetres modales
    onlyBirds : false, //pour savoir si on doit présenter que des oiseaux comme options de cartes à rajouter, utile pour cas spécial coucou.

});

const useCardModifState = () => cardModifState;

export { useCardModifState };



