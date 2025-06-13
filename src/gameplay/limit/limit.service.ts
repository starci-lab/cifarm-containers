import { Injectable } from "@nestjs/common"
import {
    AnimalSchema,
    BuildingSchema,
    InjectMongoose,
    PlacedItemSchema,
    PetSchema,
    PlacedItemType,
    PlacedItemTypeId,
    BuildingKind,
    UserSchema,
    DecorationSchema
} from "@src/databases"
import { StaticService } from "../static"
import { ClientSession, Connection } from "mongoose"

export interface LimitResult {
    placedItemCountNotExceedLimit?: boolean
    selectedPlacedItemCountNotExceedLimit?: boolean
}

export interface GetLimitParams {
    user: UserSchema
    session: ClientSession
}
export type GetFruitLimitParams = GetLimitParams

export interface GetBuildingLimitParams extends GetLimitParams {
    building: BuildingSchema
}

export type GetTileLimitParams = GetLimitParams
export interface GetAnimalLimitParams extends GetLimitParams {
    animal: AnimalSchema
}

export interface GetPetLimitParams extends GetLimitParams {
    pet: PetSchema
}

export interface GetDecorationLimitParams extends GetLimitParams {
    decoration: DecorationSchema
}

@Injectable()
export class LimitService {
    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly staticSerivce: StaticService
    ) { }

    public async getFruitLimit({ user, session }: GetFruitLimitParams): Promise<LimitResult> {
        const placedItemTypeFruits = this.staticSerivce.placedItemTypes.filter(
            (placedItemType) => placedItemType.type === PlacedItemType.Fruit
        )
        const placedItemCount = await this.connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .countDocuments({
                user: user.id,
                isStored: {
                    $ne: true
                },
                placedItemType: {
                    $in: placedItemTypeFruits.map((placedItemType) => placedItemType.id)
                }
            })
            .session(session)
        return {
            placedItemCountNotExceedLimit:
                placedItemCount < this.staticSerivce.landLimitInfo.landLimits[user.landLimitIndex].fruitLimit
        }
    }

    public async getTileLimit({ user, session }: GetTileLimitParams): Promise<LimitResult> {
        const placedItemTypeTiles = this.staticSerivce.placedItemTypes.filter(
            (placedItemType) => placedItemType.type === PlacedItemType.Tile
        )
        const placedItemCount = await this.connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .countDocuments({
                user: user.id,
                placedItemType: {
                    $in: placedItemTypeTiles.map((placedItemType) => placedItemType.id)
                }
            })
            .session(session)

        return {
            placedItemCountNotExceedLimit:
                placedItemCount < this.staticSerivce.landLimitInfo.landLimits[user.landLimitIndex].tileLimit
        }
    }

    public getSameBuildingLimit({
        building,
        user
    }: GetSameBuildingLimitParams): number {
        return building.unique ? 1 : this.staticSerivce.landLimitInfo.landLimits[user.landLimitIndex].sameBuildingLimit
    }

    public async getBuildingLimit({
        user,
        session,
        building
    }: GetBuildingLimitParams): Promise<LimitResult> {
        const placedItemTypeBuildings = this.staticSerivce.placedItemTypes.filter(
            (placedItemType) =>
                placedItemType.type === PlacedItemType.Building &&
                placedItemType.displayId === PlacedItemTypeId.Home
        )
        const placedItemCount = await this.connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .countDocuments({
                user: user.id,
                placedItemType: {
                    $in: placedItemTypeBuildings.map((placedItemType) => placedItemType.id)
                }
            })
            .session(session)

        const selectedPlacedItemType = this.staticSerivce.placedItemTypes.find(
            (placedItemType) =>
                placedItemType.type === PlacedItemType.Building &&
                placedItemType.building.toString() === building.id
        )
        if (!selectedPlacedItemType) {
            throw new Error(`No placed item type building found for id: ${building.id}`)
        }
        const selectedPlacedItemCount = await this.connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .countDocuments({
                user: user.id,
                placedItemType: selectedPlacedItemType.id
            })
            .session(session)
        return {
            placedItemCountNotExceedLimit:
                placedItemCount < this.staticSerivce.landLimitInfo.landLimits[user.landLimitIndex].buildingLimit,
            selectedPlacedItemCountNotExceedLimit: selectedPlacedItemCount <
                this.getSameBuildingLimit({ user, building })
        }
    }

    public async getAnimalLimit({
        animal,
        user,
        session
    }: GetAnimalLimitParams): Promise<LimitResult> {
        try {
            const buildings = this.staticSerivce.buildings
            const correspondingBuilding = buildings.find(
                (building) => building.animalContainedType === animal.type
            )
            if (!correspondingBuilding) {
                throw new Error(`No building found for animal type: ${animal.type}`)
            }
            const placedItemTypeBuilding = this.staticSerivce.placedItemTypes.find(
                (placedItemType) => placedItemType.id === correspondingBuilding.id
            )
            if (!placedItemTypeBuilding) {
                throw new Error(
                    `No placed item type building found for id: ${correspondingBuilding.id}`
                )
            }
            const placedItemBuildings = await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .find({
                    user: user.id,
                    placedItemType: placedItemTypeBuilding.id
                })
                .select({
                    "buildingInfo.currentUpgrade": 1
                })
                .session(session)
                .lean()
                .exec()

            const limit = placedItemBuildings.reduce((acc, placedItem) => {
                const upgrade = correspondingBuilding.upgrades?.find(
                    (upgrade) => upgrade.upgradeLevel === placedItem.buildingInfo?.currentUpgrade
                )
                if (!upgrade) {
                    throw new Error(
                        `No upgrade found for id: ${placedItem.buildingInfo?.currentUpgrade}`
                    )
                }

                return acc + upgrade.capacity
            }, 0)

            const placedItemTypeAnimal = this.staticSerivce.placedItemTypes.find(
                (placedItemType) =>
                    placedItemType.type === PlacedItemType.Animal &&
                    placedItemType.animal.toString() === animal.id
            )
            if (!placedItemTypeAnimal) {
                throw new Error(`No placed item type animal found for id: ${animal.id}`)
            }
            const placedItemAnimalCount = await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .countDocuments({
                    user: user.id,
                    placedItemType: placedItemTypeAnimal.id
                })
                .session(session)
            return {
                selectedPlacedItemCountNotExceedLimit: placedItemAnimalCount < limit
            }
        } catch (error) {
            console.error("Error in getAnimalLimit:", error)
            throw error
        }
    }

    public async getPetLimit({ pet, user, session }: GetPetLimitParams): Promise<LimitResult> {
        try {
            const placedItemTypePets = this.staticSerivce.placedItemTypes.filter((placedItemType) => {
                const correspondingPet = this.staticSerivce.pets.find(
                    (pet) =>
                        placedItemType.type === PlacedItemType.Pet &&
                        pet.id === placedItemType.pet.toString()
                )
                if (!correspondingPet) {
                    return false
                }
                if (correspondingPet.type === pet.type) {
                    return true
                }
                return false
            })

            const placedItemCount = await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .countDocuments({
                    user: user.id,
                    placedItemType: {
                        $in: placedItemTypePets.map((placedItemType) => placedItemType.id)
                    }
                })
                .session(session)

            const building = this.staticSerivce.buildings.find(
                (building) => building.kind === BuildingKind.PetHouse
            )
            if (!building) {
                throw new Error(`No building found for pet type: ${pet.type}`)
            }
            const placedItemTypeBuilding = this.staticSerivce.placedItemTypes.find(
                (placedItemType) =>
                    placedItemType.type === PlacedItemType.Building &&
                    placedItemType.building.toString() === building.id
            )
            if (!placedItemTypeBuilding) {
                throw new Error(`No placed item type building found for id: ${building.id}`)
            }
            // only one dog house is required
            const placedItemBuilding = await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .findOne({
                    user: user.id,
                    placedItemType: placedItemTypeBuilding.id
                })
                .select({
                    "buildingInfo.currentUpgrade": 1
                })
                .lean()
                .exec()
            if (!placedItemBuilding) {
                return {
                    selectedPlacedItemCountNotExceedLimit: false
                }
            }
            const capacity = building.upgrades?.find(
                (upgrade) => upgrade.upgradeLevel === placedItemBuilding.buildingInfo?.currentUpgrade
            )?.capacity
            if (!capacity) {
                throw new Error(`No capacity found for id: ${placedItemTypeBuilding.id}`)
            }
            return {
                selectedPlacedItemCountNotExceedLimit: placedItemCount < capacity
            }
        } catch (error) {
            console.error("Error in getPetLimit:", error)
            throw error
        }
    }

    public async getDecorationLimit({ 
        decoration, 
        //user, session
    }: GetDecorationLimitParams): Promise<LimitResult> {
        if (!decoration.limited) {
            return {
                selectedPlacedItemCountNotExceedLimit: true
            }
        }
        // const placedItemTypeDecorations = this.staticSerivce.placedItemTypes.filter(
        //     (placedItemType) => placedItemType.type === PlacedItemType.Decoration
        // )
        // const placedItemCount = await this.connection
        //     .model<PlacedItemSchema>(PlacedItemSchema.name)
        //     .countDocuments({
        //         user: user.id,
        //         placedItemType: {
        //             $in: placedItemTypeDecorations.map((placedItemType) => placedItemType.id)
        //         }
        //     })
        //     .session(session)
        // return {
        //     selectedPlacedItemCountNotExceedLimit: placedItemCount < 1
        // }
    }
}

export interface GetSameBuildingLimitParams {
    user: UserSchema
    building: BuildingSchema
}

