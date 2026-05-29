

let treeModifState = $state({
    openModalModifTree : false,
    idTreeToModif : null, //stocke l'id de l'arbre dont on veut modifier les cartes, pour le passer à AddACardView
    treeToModif : null, //stocke l'arbre lui même pour le modifier dans AddACardView avant de valider les modifications et de mettre à jour la forêt réelle
})


const useTreeModifState = () => {
    return {
        get treeModif() {
            return treeModifState;
        },
        get openModalModifTree() {
            return treeModifState.openModalModifTree;
        },
        set openModalModifTree(value) {
            treeModifState.openModalModifTree = value;
        },
        get idTreeToModif() {
            return treeModifState.idTreeToModif;
        },
        set idTreeToModif(value) {
            treeModifState.idTreeToModif = value;
        },
        get treeToModif() {
            return treeModifState.treeToModif;
        },
        set treeToModif(value) {
            treeModifState.treeToModif = value;
        },

        updateCard(card) {
            treeModifState.treeToModif.up = treeModifState.treeToModif.up.map(c => c.id === card.id ? card : c);
            treeModifState.treeToModif.down = treeModifState.treeToModif.down.map(c => c.id === card.id ? card : c);
            treeModifState.treeToModif.left = treeModifState.treeToModif.left.map(c => c.id === card.id ? card : c);
            treeModifState.treeToModif.right = treeModifState.treeToModif.right.map(c => c.id === card.id ? card : c);
        },

        deleteCard(card) {
            treeModifState.treeToModif.up = treeModifState.treeToModif.up.filter(c => c.id !== card.id);
            treeModifState.treeToModif.down = treeModifState.treeToModif.down.filter(c => c.id !== card.id);
            treeModifState.treeToModif.left = treeModifState.treeToModif.left.filter(c => c.id !== card.id);
            treeModifState.treeToModif.right = treeModifState.treeToModif.right.filter(c => c.id !== card.id);
        },

        addCard(position, card) {
            treeModifState.treeToModif[position] = [...treeModifState.treeToModif[position], card];
        },
    }
}

export { useTreeModifState };