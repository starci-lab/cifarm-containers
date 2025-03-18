import {
    ToolId,
    AnimalId,
    CropId,
    BuildingId,
    FruitId,
    InventoryTypeId,
    PlacedItemTypeId,
    SupplyId
} from "./ids"
import { AnimalCurrentState, CropCurrentState, FruitCurrentState } from "./states"
import { TutorialStep } from "./tutorial"
import {
    AppearanceChance,
    AnimalType,
    InventoryKind,
    InventoryType,
    PlacedItemType,
    ProductType,
    SpinPrizeType
} from "./types"
import { createResolverFromEnum } from "./utils"

export const gameplayEnumResolvers: Record<string, Record<string, string | number>> = {
    AnimalId: createResolverFromEnum(AnimalId),
    CropId: createResolverFromEnum(CropId),
    FruitId: createResolverFromEnum(FruitId),
    BuildingId: createResolverFromEnum(BuildingId),
    ToolId: createResolverFromEnum(ToolId),
    PlacedItemTypeId: createResolverFromEnum(PlacedItemTypeId),
    InventoryTypeId: createResolverFromEnum(InventoryTypeId),
    SupplyId: createResolverFromEnum(SupplyId),
    AppearanceChance: createResolverFromEnum(AppearanceChance),
    AnimalType: createResolverFromEnum(AnimalType),
    InventoryKind: createResolverFromEnum(InventoryKind),
    InventoryType: createResolverFromEnum(InventoryType),
    PlacedItemType: createResolverFromEnum(PlacedItemType),
    ProductType: createResolverFromEnum(ProductType),
    SpinPrizeType: createResolverFromEnum(SpinPrizeType),
    AnimalCurrentState: createResolverFromEnum(AnimalCurrentState),
    CropCurrentState: createResolverFromEnum(CropCurrentState),
    FruitCurrentState: createResolverFromEnum(FruitCurrentState),
    TutorialStep: createResolverFromEnum(TutorialStep)
}