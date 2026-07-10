import { TreeColor } from "../../model/card-color.js";

let forestScanState = $state(
    {
        openModalScan : false,
        forestScan : null, //stocke la foret scannée pour l'afficher et potentiellement la modifiée avant la validation et le merge

    }
);


const useForestScanState = () => {
    return {
        get forestScan() {
            return forestScanState.forestScan;
        },
        set forestScan(value) {
            forestScanState.forestScan = value;
        },
        get openModalScan() {
            return forestScanState.openModalScan;
        },
        set openModalScan(value) {
            forestScanState.openModalScan = value;
        },

        updateTree(treeId, newTree) {
            forestScanState.forestScan.forest = forestScanState.forestScan.forest.map(tree => 
                tree.id === treeId ? newTree : tree
            );
        },

        deleteTree(treeId) {
            forestScanState.forestScan.forest = forestScanState.forestScan.forest.filter(tree => tree.id !== treeId);
        },

        addTree(treeName) {
            const newTree = {
                tree: treeName,
                symbol: TreeColor[treeName] || 'none',
                id : crypto.randomUUID(),
                up: [],
                down: [],
                left: [],
                right: []
            };
            forestScanState.forestScan.forest.push(newTree);
        },

    }
}

export { useForestScanState };