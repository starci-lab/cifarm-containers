
import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import JSON from "graphql-type-json"
import { AppearanceChance, CropId, DailyRewardId, SystemId } from "../enums"
import { Position } from "@src/gameplay"
import { StaticAbstractSchema } from "./abstract"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"

@ObjectType()
@Schema({
    timestamps: true,
    collection: "systems"
})
export class SystemSchema extends StaticAbstractSchema<SystemId> {
    @Field(() => JSON)
    @Prop({ type: Object, required: true })
        value: object
}

@ObjectType()
export class ActivityInfo {
    @Field(() => Int)
        experiencesGain: number
    @Field(() => Int)
        energyConsume: number
}

@ObjectType()
export class Activities {
    @Field(() => ActivityInfo)
        plantSeed: ActivityInfo
    @Field(() => ActivityInfo)
        waterCrop: ActivityInfo
    @Field(() => ActivityInfo)
        feedAnimal: ActivityInfo
    @Field(() => ActivityInfo)
        harvestAnimal: ActivityInfo
    @Field(() => ActivityInfo)
        usePesticide: ActivityInfo
    @Field(() => ActivityInfo)
        useFertilizer: ActivityInfo
    @Field(() => ActivityInfo)
        useHerbicide: ActivityInfo
    @Field(() => ActivityInfo)
        helpUseHerbicide: ActivityInfo
    @Field(() => ActivityInfo)
        helpUsePesticide: ActivityInfo
    @Field(() => ActivityInfo)
        helpWater: ActivityInfo
    @Field(() => ActivityInfo)
        thiefCrop: ActivityInfo
    @Field(() => ActivityInfo)
        thiefAnimalProduct: ActivityInfo
    @Field(() => ActivityInfo)
        cureAnimal: ActivityInfo
    @Field(() => ActivityInfo)
        helpCureAnimal: ActivityInfo
    @Field(() => ActivityInfo)
        harvestCrop: ActivityInfo
    @Field(() => ActivityInfo)
        helpFeedAnimal: ActivityInfo
    @Field(() => ActivityInfo)
        useFruitFertilizer: ActivityInfo
    @Field(() => ActivityInfo)
        useBugNet: ActivityInfo
    @Field(() => ActivityInfo)
        helpUseFruitFertilizer: ActivityInfo
    @Field(() => ActivityInfo)
        helpUseBugNet: ActivityInfo
    @Field(() => ActivityInfo)
        harvestFruit: ActivityInfo
    @Field(() => ActivityInfo)
        thiefFruit: ActivityInfo
}

@ObjectType()
export class CropRandomness {
    @Field(() => Float)
        thief3: number
    @Field(() => Float)
        thief2: number
    @Field(() => Float)
        needWater: number
    @Field(() => Float)
        isWeedyOrInfested: number
}

@ObjectType()
export class AnimalRandomness {
    @Field(() => Float)
        sickChance: number
    @Field(() => Float)
        thief3: number
    @Field(() => Float)
        thief2: number
}

@ObjectType()
export class FruitRandomness {
    @Field(() => Float)
        thief3: number
    @Field(() => Float)
        thief2: number
    @Field(() => Float)
        needFertilizer: number
    @Field(() => Float)
        hasCaterpillar: number
}

@ObjectType()
export class Positions {
    //starter tiles
    @Field(() => [Position])
        tiles: Array<Position>
    //home
    @Field(() => Position)
        home: Position
}

@ObjectType()
export class DefaultInfo {
    @Field(() => Int)
        golds: number
    @Field(() => Positions)
        positions: Positions
    @Field(() => String)
        defaultCropId: CropId
    @Field(() => Int)
        defaultSeedQuantity: number
    @Field(() => Int)
        storageCapacity: number
    @Field(() => Int)
        toolCapacity: number
    @Field(() => Int)
        deliveryCapacity: number
    @Field(() => Int)
        followeeLimit: number
    @Field(() => Int)
        referredLimit: number
    @Field(() => Int)
        referralRewardQuantity: number
    @Field(() => Int)
        referredRewardQuantity: number
    @Field(() => Int)
        followXRewardQuantity: number
    @Field(() => Int)
        tileLimit: number
    @Field(() => Int)
        fruitLimit: number
    @Field(() => Int)
        buildingLimit: number
}

 
@ObjectType()
export class SlotInfo {
    @Field(() => Int)
        count: number
    @Field(() => Float)
        thresholdMin: number
    @Field(() => Float)
        thresholdMax: number
}

@ObjectType()
export class HoneycombInfo {
    @Field(() => Int)
        dailyRewardAmount: number
    @Field(() => String)
        projectAddress: string
    @Field(() => String)
        tokenResourceAddress: string
    @Field(() => Int)
        decimals: number
}

@ObjectType()
export class AppearanceChanceSlots {
    @Field(() => SlotInfo)
    [AppearanceChance.Common]: SlotInfo
    @Field(() => SlotInfo)
    [AppearanceChance.Rare]: SlotInfo
    @Field(() => SlotInfo)
    [AppearanceChance.Uncommon]: SlotInfo
    @Field(() => SlotInfo)
    [AppearanceChance.VeryRare]: SlotInfo
}

@ObjectType()
export class SpinInfo {
    @Field(() => AppearanceChanceSlots)
        appearanceChanceSlots: AppearanceChanceSlots
}

@ObjectType()
export class EnergyRegen {
    @Field(() => Int)
        time: number // In milliseconds
}

@ObjectType()
export class DailyReward {
    @Field(() => Int, { nullable: true })
        golds: number
    // Extra tokens, only claim in last day
    @Field(() => Float, { nullable: true })
        tokens: number
    @Field(() => Int)
        day: number
    @Field(() => Boolean)
        lastDay: boolean
}

@ObjectType()
export class DailyRewardInfo {
    @Field(() => DailyReward)
    [DailyRewardId.Day1]: DailyReward
    @Field(() => DailyReward)
    [DailyRewardId.Day2]: DailyReward
    @Field(() => DailyReward)
    [DailyRewardId.Day3]: DailyReward
    @Field(() => DailyReward)
    [DailyRewardId.Day4]: DailyReward
    @Field(() => DailyReward)
    [DailyRewardId.Day5]: DailyReward
}

// Generate the Mongoose schema class
export const SystemSchemaClass = SchemaFactory.createForClass(SystemSchema)
