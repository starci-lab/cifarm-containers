import { Field, Int, ObjectType } from "@nestjs/graphql"
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
export class Activities {
    @Field(() => ActivityInfo)
        water: ActivityInfo
    @Field(() => ActivityInfo)
        feedAnimal: ActivityInfo
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
export class ActivityInfo {
    @Field(() => Int)
        experiencesGain: number
    @Field(() => Int)
        energyConsume: number
}

export class CropRandomness {
    thief3: number
    thief2: number
    needWater: number
    isWeedyOrInfested: number
}

export class AnimalRandomness {
    sickChance: number
    thief3: number
    thief2: number
}

export class Positions {
    //starter tiles
    tiles: Array<Position>
    //home
    home: Position
}

export class Starter {
    golds: number
    positions: Positions
}

export class SpinInfo {
    appearanceChanceSlots: Record<AppearanceChance, SlotInfo>
}
 
export class SlotInfo {
    count: number
    thresholdMin: number
    thresholdMax: number
}

export class EnergyRegenTime {
    time: number // In milliseconds
}