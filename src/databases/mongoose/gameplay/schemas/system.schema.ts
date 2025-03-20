import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import JSON from "graphql-type-json"
import {
    AppearanceChance,
    CropId,
    DailyRewardId,
    FirstCharLowerCaseCropId,
    SystemId,
    FirstCharLowerCaseSystemId,
} from "../enums"
import { AbstractSchema } from "./abstract"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Position } from "./types"

@ObjectType({
    description: "The system schema"
})
@Schema({
    timestamps: true,
    collection: "systems"
})
export class SystemSchema extends AbstractSchema {
    @Field(() => FirstCharLowerCaseSystemId, {
        description: "The display ID of the system"
    })
    @Prop({ type: String, enum: SystemId, required: true, unique: true })
        displayId: SystemId

    @Field(() => JSON, {
        description: "The system configuration value"
    })
    @Prop({ type: Object, required: true })
        value: object
}

@ObjectType({
    description: "Information about an activity's rewards and costs"
})
export class ActivityInfo {
    @Field(() => Int, {
        description: "The amount of experience gained from the activity"
    })
        experiencesGain: number
    @Field(() => Int, {
        description: "The amount of energy consumed by the activity"
    })
        energyConsume: number
}

@ObjectType({
    description: "Configuration for all gameplay activities"
})
export class Activities {
    @Field(() => ActivityInfo, {
        description: "Configuration for planting seeds"
    })
        plantSeed: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for watering crops"
    })
        waterCrop: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for feeding animals"
    })
        feedAnimal: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for harvesting animal products"
    })
        harvestAnimal: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for using pesticide"
    })
        usePesticide: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for using fertilizer"
    })
        useFertilizer: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for using herbicide"
    })
        useHerbicide: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for helping others use herbicide"
    })
        helpUseHerbicide: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for helping others use pesticide"
    })
        helpUsePesticide: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for helping others water crops"
    })
        helpWaterCrop: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for stealing crops"
    })
        thiefCrop: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for stealing animal products"
    })
        thiefAnimalProduct: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for curing sick animals"
    })
        cureAnimal: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for helping others cure animals"
    })
        helpCureAnimal: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for harvesting crops"
    })
        harvestCrop: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for helping others feed animals"
    })
        helpFeedAnimal: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for using fruit fertilizer"
    })
        useFruitFertilizer: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for using bug net"
    })
        useBugNet: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for helping others use fruit fertilizer"
    })
        helpUseFruitFertilizer: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for helping others use bug net"
    })
        helpUseBugNet: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for harvesting fruits"
    })
        harvestFruit: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for stealing fruits"
    })
        thiefFruit: ActivityInfo
}

@ObjectType({
    description: "Configuration for crop randomness events"
})
export class CropRandomness {
    @Field(() => Float, {
        description: "Chance for a crop to be stolen by 3 thieves"
    })
        thief3: number

    @Field(() => Float, {
        description: "Chance for a crop to be stolen by 2 thieves"
    })
        thief2: number

    @Field(() => Float, {
        description: "Chance for a crop to need water"
    })
        needWater: number

    @Field(() => Float, {
        description: "Chance for a crop to become weedy or infested"
    })
        isWeedyOrInfested: number
}

@ObjectType({
    description: "Configuration for crop info"
})
export class CropInfo {
    @Field(() => CropRandomness, {
        description: "Configuration for crop randomness events"
    })
        randomness: CropRandomness

    @Field(() => Int, {
        description: "The number of times the crop can be harvested",
        defaultValue: 3
    })
        nextGrowthStageAfterHarvest: number
    
    @Field(() => Int, {
        description: "The number of growth stages for the crop", 
        defaultValue: 5
    })
        growthStages: number
}

@ObjectType({
    description: "Configuration for animal randomness events"
})
export class AnimalRandomness {
    @Field(() => Float, {
        description: "Chance for an animal to become sick"
    })
        sickChance: number

    @Field(() => Float, {
        description: "Chance for an animal product to be stolen by 3 thieves"
    })
        thief3: number

    @Field(() => Float, {
        description: "Chance for an animal product to be stolen by 2 thieves"
    })
        thief2: number
}

@ObjectType({
    description: "Configuration for animal info"
})
export class AnimalInfo {
    @Field(() => AnimalRandomness, {
        description: "Configuration for animal randomness events"
    })
        randomness: AnimalRandomness
}

@ObjectType({
    description: "Configuration for fruit randomness events"
})
export class FruitRandomness {
    @Field(() => Float, {
        description: "Chance for a fruit to be stolen by 3 thieves"
    })
        thief3: number

    @Field(() => Float, {
        description: "Chance for a fruit to be stolen by 2 thieves"
    })
        thief2: number

    @Field(() => Float, {
        description: "Chance for a fruit to need fertilizer"
    })
        needFertilizer: number

    @Field(() => Float, {
        description: "Chance for a fruit to have caterpillars"
    })
        hasCaterpillar: number
}

@ObjectType({
    description: "Configuration for fruit info"
})
export class FruitInfo {
    @Field(() => FruitRandomness, {
        description: "Configuration for fruit randomness events"
    })
        randomness: FruitRandomness

    @Field(() => Int, {
        description: "The number of times the fruit can be harvested",
        defaultValue: 3
    })
        nextGrowthStageAfterHarvest: number

    @Field(() => Int, {
        description: "The number of growth stages for the fruit",
        defaultValue: 5
    })
        growthStages: number
}

@ObjectType({
    description: "Default positions for farm elements"
})
export class Positions {
    @Field(() => [Position], {
        description: "Default positions for tiles"
    })
        tiles: Array<Position>

    @Field(() => Position, {
        description: "Default position for the home building"
    })
        home: Position
}

@ObjectType({
    description: "Default configuration for new users"
})
export class DefaultInfo {
    @Field(() => Int, {
        description: "Default starting gold amount"
    })
        golds: number

    @Field(() => Positions, {
        description: "Default positions for farm elements"
    })
        positions: Positions

    @Field(() => FirstCharLowerCaseCropId, {
        description: "Default crop ID given to new users"
    })
        defaultCropId: CropId

    @Field(() => Int, {
        description: "Default seed quantity given to new users"
    })
        defaultSeedQuantity: number

    @Field(() => Int, {
        description: "Default storage capacity"
    })
        storageCapacity: number

    @Field(() => Int, {
        description: "Default tool capacity"
    })
        toolCapacity: number

    @Field(() => Int, {
        description: "Default delivery capacity"
    })
        deliveryCapacity: number

    @Field(() => Int, {
        description: "Maximum number of users that can be followed"
    })
        followeeLimit: number

    @Field(() => Int, {
        description: "Maximum number of users that can be referred"
    })
        referredLimit: number

    @Field(() => Int, {
        description: "Reward quantity for referring a user"
    })
        referralRewardQuantity: number

    @Field(() => Int, {
        description: "Reward quantity for being referred by a user"
    })
        referredRewardQuantity: number

    @Field(() => Int, {
        description: "Reward quantity for following on X/Twitter"
    })
        followXRewardQuantity: number

    @Field(() => Int, {
        description: "Maximum number of tiles a user can have"
    })
        tileLimit: number

    @Field(() => Int, {
        description: "Maximum number of fruits a user can have"
    })
        fruitLimit: number

    @Field(() => Int, {
        description: "Maximum number of buildings a user can have"
    })
        buildingLimit: number
}

@ObjectType({
    description: "Configuration for spin wheel slots"
})
export class SlotInfo {
    @Field(() => Int, {
        description: "Number of slots of this type"
    })
        count: number

    @Field(() => Float, {
        description: "Minimum threshold for this slot type"
    })
        thresholdMin: number

    @Field(() => Float, {
        description: "Maximum threshold for this slot type"
    })
        thresholdMax: number
}

@ObjectType({
    description: "Configuration for honeycomb rewards"
})
export class HoneycombInfo {
    @Field(() => Int, {
        description: "Daily reward amount for honeycomb"
    })
        dailyRewardAmount: number

    @Field(() => String, {
        description: "Project address for honeycomb"
    })
        projectAddress: string

    @Field(() => String, {
        description: "Token resource address for honeycomb"
    })
        tokenResourceAddress: string

    @Field(() => Int, {
        description: "Number of decimals for honeycomb tokens"
    })
        decimals: number

    @Field(() => [String], {
        description: "Profile tree addresses for honeycomb"
    })
        profilesTreeAddresses: Array<string>
}

@ObjectType({
    description: "Configuration for appearance chance slots"
})
export class AppearanceChanceSlots {
    @Field(() => SlotInfo, {
        description: "Configuration for common slots"
    })
    [AppearanceChance.Common]: SlotInfo

    @Field(() => SlotInfo, {
        description: "Configuration for uncommon slots"
    })
    [AppearanceChance.Uncommon]: SlotInfo

    @Field(() => SlotInfo, {
        description: "Configuration for rare slots"
    })
    [AppearanceChance.Rare]: SlotInfo

    @Field(() => SlotInfo, {
        description: "Configuration for very rare slots"
    })
    [AppearanceChance.VeryRare]: SlotInfo
}

@ObjectType({
    description: "Configuration for spin wheel"
})
export class SpinInfo {
    @Field(() => AppearanceChanceSlots, {
        description: "Configuration for appearance chance slots"
    })
        appearanceChanceSlots: AppearanceChanceSlots
}

@ObjectType({
    description: "Configuration for energy regeneration"
})
export class EnergyRegen {
    @Field(() => Int, {
        description: "Time in milliseconds for energy regeneration"
    })
        time: number
}

@ObjectType({
    description: "Configuration for daily rewards"
})
export class DailyReward {
    @Field(() => Int, {
        nullable: true,
        description: "Gold amount for this daily reward"
    })
        golds: number

    @Field(() => Float, {
        nullable: true,
        description: "Token amount for this daily reward"
    })
        tokens: number

    @Field(() => Int, {
        description: "Day number for this daily reward"
    })
        day: number

    @Field(() => Boolean, {
        description: "Whether this is the last day in the daily reward cycle"
    })
        lastDay: boolean
}

@ObjectType({
    description: "Configuration for daily reward system"
})
export class DailyRewardInfo {
    @Field(() => DailyReward, {
        description: "Day 1 reward"
    })
    [DailyRewardId.Day1]: DailyReward

    @Field(() => DailyReward, {
        description: "Day 2 reward"
    })
    [DailyRewardId.Day2]: DailyReward

    @Field(() => DailyReward, {
        description: "Day 3 reward"
    })
    [DailyRewardId.Day3]: DailyReward

    @Field(() => DailyReward, {
        description: "Day 4 reward"
    })
    [DailyRewardId.Day4]: DailyReward

    @Field(() => DailyReward, {
        description: "Day 5 reward"
    })
    [DailyRewardId.Day5]: DailyReward
}

// Generate the Mongoose schema class
export const SystemSchemaClass = SchemaFactory.createForClass(SystemSchema)
