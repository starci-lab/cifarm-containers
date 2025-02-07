import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity } from "typeorm"
import { StringAbstractEntity } from "./abstract"
import JSON from "graphql-type-json"
import { AppearanceChance } from "../enums"
import { Position } from "@src/gameplay"

@ObjectType()
@Entity("system")
export class SystemEntity extends StringAbstractEntity {
    @Column({ name: "value", type: "jsonb" })
    @Field(() => JSON)
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
        water: ActivityInfo
    @Field(() => ActivityInfo)
        feedAnimal: ActivityInfo
    @Field(() => ActivityInfo)
        collectAnimalProduct: ActivityInfo
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
export class Positions {
    //starter tiles
    @Field(() => [Position])
        tiles: Array<Position>
    //home
    @Field(() => Position)
        home: Position
}

@ObjectType()
export class Starter {
    @Field(() => Int)
        golds: number
    @Field(() => Positions)
        positions: Positions
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