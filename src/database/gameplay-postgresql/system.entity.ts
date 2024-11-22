import { ObjectType } from "@nestjs/graphql"
import { Column, Entity } from "typeorm"
import { ReadableAbstractEntity } from "./abstract"

@ObjectType()
@Entity("system")
export class SystemEntity extends ReadableAbstractEntity {
    //activity configure
    @Column({ name: "value", type: "jsonb" })
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
    energyCost: number
}
