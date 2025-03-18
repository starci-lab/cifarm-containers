import {
    animalIdResolver,
    cropIdResolver,
    fruitIdResolver,
    buildingIdResolver,
    toolIdResolver,
    placedItemTypeIdResolver,
    inventoryTypeIdResolver,
    supplyIdResolver
} from "./keys"
import {
    appearanceChanceResolver,
    animalTypeResolver,
    inventoryKindResolver,
    inventoryTypeResolver,
    placedItemTypeResolver,
    productTypeResolver,
    spinPrizeTypeResolver,
} from "./types"
import {
    animalCurrentStateResolver,
    cropCurrentStateResolver,
    fruitCurrentStateResolver
} from "./states"
import {
    tutorialStepResolver
} from "./tutorial"

export const gameplayEnumResolver: Record<string, Record<string, string | number>> = {
    AnimalId: animalIdResolver,
    CropId: cropIdResolver,
    FruitId: fruitIdResolver,
    BuildingId: buildingIdResolver,
    ToolId: toolIdResolver,
    PlacedItemTypeId: placedItemTypeIdResolver,
    InventoryTypeId: inventoryTypeIdResolver,
    SupplyId: supplyIdResolver,
    AppearanceChance: appearanceChanceResolver,
    AnimalType: animalTypeResolver,
    InventoryKind: inventoryKindResolver,
    InventoryType: inventoryTypeResolver,
    PlacedItemType: placedItemTypeResolver,
    ProductType: productTypeResolver,
    SpinPrizeType: spinPrizeTypeResolver,
    //AnimalCurrentState: animalCurrentStateResolver,
    //CropCurrentState: cropCurrentStateResolver,
    FruitCurrentState: fruitCurrentStateResolver,
    TutorialStep: tutorialStepResolver,  
}
