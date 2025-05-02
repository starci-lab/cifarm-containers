import { Injectable } from "@nestjs/common"
import {
    DogDefenseSuccessParams,
    CatAttackSuccessParams,
    DogDefenseSuccessResult,
    CatAttackSuccessResult
} from "./types"
import { PlacedItemType, PetType } from "@src/databases"
import { InjectMongoose } from "@src/databases"
import { Connection } from "mongoose"
import { PlacedItemSchema } from "@src/databases"
import { StaticService } from "../static"
import { LevelService } from "../level"
import { EnergyService } from "../energy"
//core game logic service
@Injectable()
export class AssistanceService {
    constructor(
        private readonly staticService: StaticService,
        @InjectMongoose() private readonly connection: Connection,
        private readonly levelService: LevelService,
        private readonly energyService: EnergyService
    ) {}

    public async dogDefenseSuccess({
        neighborUser,
        session,
        user
    }: DogDefenseSuccessParams): Promise<DogDefenseSuccessResult> {
        const placedItemDog = await this.connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .findById(neighborUser.selectedPlacedItemDogId)
            .session(session)
        if (!placedItemDog) {
            return {
                success: false
            }
        }
        const placedItemDogSnapshot = placedItemDog.$clone()
        const placedItemType = this.staticService.placedItemTypes.find(
            (placedItemType) => placedItemType.id === placedItemDog.placedItemType.toString()
        )
        if (placedItemType.type !== PlacedItemType.Pet) {
            throw new Error("Placed item type not found")
        }
        const pet = this.staticService.pets.find(
            (pet) =>
                placedItemType.type === PlacedItemType.Pet &&
                pet.id === placedItemType.pet.toString()
        )
        if (!pet) {
            throw new Error("Pet not found")
        }
        if (pet.type !== PetType.Dog) {
            throw new Error("Pet type not dog")
        }
        if (!placedItemDog.petInfo) {
            throw new Error("Pet info not found")
        }
        const assistSuccess =
            Math.random() <
            this.staticService.petInfo.dog.chance
        if (assistSuccess) {
            placedItemDog.petInfo.helpedCount += 1
            this.levelService.addExperiences({
                user: neighborUser,
                experiences: pet.helpSuccessExperience
            })
            this.energyService.subtract({
                user: user,
                quantity: this.staticService.petInfo.dog.energyReduce
            })
            return {
                success: true,
                placedItemDogSnapshot,
                placedItemDogUpdated: placedItemDog
            }
        }
        return {
            success: false
        }
    }

    public async catAttackSuccess({
        user,
        session
    }: CatAttackSuccessParams): Promise<CatAttackSuccessResult> {
        const placedItemCat = await this.connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .findById(user.selectedPlacedItemCatId)
            .session(session)
        if (!placedItemCat) {
            return {
                success: false
            }
        }
        const placedItemCatSnapshot = placedItemCat.$clone()
        const placedItemType = this.staticService.placedItemTypes.find(
            (placedItemType) => placedItemType.id === placedItemCat.placedItemType.toString()
        )
        if (placedItemType.type !== PlacedItemType.Pet) {
            throw new Error("Placed item type not found")
        }
        const pet = this.staticService.pets.find(
            (pet) =>
                placedItemType.type === PlacedItemType.Pet &&
                pet.id === placedItemType.pet.toString()
        )
        if (!pet) {
            throw new Error("Pet not found")
        }
        if (pet.type !== PetType.Cat) {
            throw new Error("Pet type not cat")
        }
        if (!placedItemCat.petInfo) {
            throw new Error("Pet info not found")
        }
        const assistSuccess =
            Math.random() <
            this.staticService.petInfo.cat.chance
        if (assistSuccess) {
            placedItemCat.petInfo.helpedCount += 1
            this.levelService.addExperiences({
                user: user,
                experiences: pet.helpSuccessExperience
            })
            const percentQuantityBonusAfterComputed = this.staticService.petInfo.cat.percentQuantityBonus
            const plusQuantityAfterComputed = this.staticService.petInfo.cat.plusQuantity
            return {
                success: true,
                placedItemCatSnapshot,
                placedItemCatUpdated: placedItemCat,
                percentQuantityBonusAfterComputed,
                plusQuantityAfterComputed
            }
        }
        return {
            success: false
        }
    }
}
