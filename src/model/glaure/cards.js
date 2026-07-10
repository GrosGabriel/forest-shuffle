import {allTrees} from "./card-trees.js";
import {allBirds} from "./card-birds.js";
import {allButterflies} from "./card-butterflies.js";
import {allOtherTopInBaseGame} from "./card-others.js";
import {allPlantsRestrictive} from "./card-plants.js";
import {allMushrooms} from "./card-mushrooms.js";
import {allAmphibians} from "./card-amphibians.js";
import {allInsects} from "./card-insects.js";
import {allPawedRestrictive} from "./card-pawed-animals.js";
import {allBats} from "./card-bats.js";
import {allDeers} from "./card-deer-cloven.js";
import {allShrubs} from "./card-shrubs.js";

const cards = [
    ...allTrees,
    ...allBirds,
    ...allButterflies,
    ...allOtherTopInBaseGame,
    ...allPlantsRestrictive,
    ...allMushrooms,
    ...allAmphibians,
    ...allInsects,
    ...allPawedRestrictive,
    ...allBats,
    ...allDeers,
    ...allShrubs
]

export default cards