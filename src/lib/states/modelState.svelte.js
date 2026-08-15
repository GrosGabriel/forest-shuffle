// Suivi de l'état de chargement du modèle de détection (ONNX/WASM).
// Permet d'afficher un indicateur sur la page ("modèle prêt" / "en cours" /
// "indisponible") au lieu de laisser l'utilisateur deviner si ça a marché.
let modelState = $state({
    /** @type {"loading" | "ready" | "error"} */
    status: "loading",
    /** @type {string | null} */
    error: null,
});

const useModelState = () => {
    return {
        get status() {
            return modelState.status;
        },
        set status(value) {
            modelState.status = value;
        },
        get error() {
            return modelState.error;
        },
        set error(value) {
            modelState.error = value;
        },
    };
};

export { useModelState };
