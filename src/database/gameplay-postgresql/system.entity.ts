import { Field, ObjectType } from "@nestjs/graphql"
import { Column, Entity } from "typeorm"
import { ReadableAbstractEntity } from "./abstract"
import JSON from "graphql-type-json"
import { Position } from "@src/types"
@ObjectType()
@Entity("system")
export class SystemEntity extends ReadableAbstractEntity {
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
