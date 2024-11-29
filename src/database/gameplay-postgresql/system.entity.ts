import { Field, ObjectType } from "@nestjs/graphql"
import { Column, Entity } from "typeorm"
import { StringAbstractEntity } from "./abstract"
import JSON from "graphql-type-json"
import { Position } from "@src/types"
import { AppearanceChance } from "./enums"
@ObjectType()
@Entity("system")
export class SystemEntity extends StringAbstractEntity {
    @Column({ name: "value", type: "jsonb" })
    @Field(() => JSON)
        value: object
}

export class Activities {
    water: ActivityInfo
    feedAnimal: ActivityInfo
    usePesticide: ActivityInfo
    useFertilizer: ActivityInfo
    useHerbicide: ActivityInfo
    helpUseHerbicide: ActivityInfo
    helpUsePesticide: ActivityInfo
    helpWater: ActivityInfo
    thiefCrop: ActivityInfo
    thiefAnimalProduct: ActivityInfo
    cureAnimal: ActivityInfo
    helpCureAnimal: ActivityInfo
}

export class ActivityInfo {
    experiencesGain: number
    energyConsume: number
}

export class CropRandomness {
    theif3: number
    theif2: number
    needWater: number
    isWeedyOrInfested: number
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