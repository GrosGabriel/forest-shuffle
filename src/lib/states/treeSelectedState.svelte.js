

let treeSelectedState = $state({});


const useTreeSelectedState = () => {
    return {
        get treeSelected() {
            return treeSelectedState;
        },

        selectTree(tree) {
            treeSelectedState = tree;
        },

    }
}


export { useTreeSelectedState };