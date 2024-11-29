import { Field, ObjectType } from "@nestjs/graphql"
import { Column, Entity } from "typeorm"
import { ReadableAbstractEntity } from "./abstract"
import JSON from "graphql-type-json"
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
    usePestiside: ActivityInfo
    useFertilizer: ActivityInfo
    useHerbicide: ActivityInfo
    helpUseHerbicide: ActivityInfo
    helpUsePestiside: ActivityInfo
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
