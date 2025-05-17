import { Inject, Injectable } from "@nestjs/common"
import {
    ComputeFruitResult,
    ComputeAnimalResult,
    ComputeCropResult,
    ComputeFlowerResult,
    ComputeBeeHouseResult,
    CheckLevelGapParams
} from "./types"
import { MODULE_OPTIONS_TOKEN } from "../gameplay.module-definition"
import { GameplayOptions } from "../gameplay.types"
import { StaticService } from "../static"
import { LevelGapIsNotEnoughException } from "../exceptions"

@Injectable()
export class ThiefService {
    public readonly minQuantity: number
    public readonly maxQuantity: number
    public readonly avgQuantity: number

    constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: GameplayOptions,
        private readonly staticService: StaticService
    ) {
        this.minQuantity = this.options.theif?.minQuantity || 1
        this.maxQuantity = this.options.theif?.maxQuantity || 3
        this.avgQuantity = Math.floor((this.minQuantity + this.maxQuantity) / 2)
    }

    public computeFruit(): ComputeFruitResult {
        const { thief2, thief3 } = this.staticService.fruitInfo.randomness
        const random = Math.random()
        let value = this.minQuantity
        if (random > thief2) value = this.avgQuantity
        if (random > thief3) value = this.maxQuantity
        return {
            value
        }
    }

    public computeAnimal(): ComputeAnimalResult {
        const { thief2, thief3 } = this.staticService.animalInfo.randomness
        const random = Math.random()
        let value = this.minQuantity
        if (random > thief2) value = this.avgQuantity
        if (random > thief3) value = this.maxQuantity
        return {
            value
        }
    }

    public computeCrop(): ComputeCropResult {
        const { thief2, thief3 } = this.staticService.cropInfo.randomness
        const random = Math.random()
        let value = this.minQuantity
        if (random > thief2) value = this.avgQuantity
        if (random > thief3) value = this.maxQuantity
        return {
            value
        }
    }

    public computeFlower(): ComputeFlowerResult {
        const { thief2, thief3 } = this.staticService.flowerInfo.randomness
        const random = Math.random()
        let value = this.minQuantity
        if (random > thief2) value = this.avgQuantity
        if (random > thief3) value = this.maxQuantity
        return {
            value
        }
    }

    public computeBeeHouse(): ComputeBeeHouseResult {
        const { thief2, thief3 } = this.staticService.beeHouseInfo.randomness
        const random = Math.random()
        let value = this.minQuantity
        if (random > thief2) value = this.avgQuantity
        if (random > thief3) value = this.maxQuantity
        return {
            value
        }
    }

    public checkLevelGap({ user, neighbor }: CheckLevelGapParams) {
        const { thiefLevelGapThreshold } = this.staticService.interactionPermissions
        if (user.level < neighbor.level - thiefLevelGapThreshold) {
            throw new LevelGapIsNotEnoughException()
        }
    }
}
