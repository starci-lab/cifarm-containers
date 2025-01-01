import { Field, ObjectType } from "@nestjs/graphql"
import { Column, Entity } from "typeorm"
import { UuidAbstractEntity } from "./abstract"
import JSON from "graphql-type-json"

@ObjectType()
@Entity("collections")
export class CollectionEntity extends UuidAbstractEntity {
    
    @Column({ name: "collection", type: "varchar" })
    @Field(() => String)
        collection: string

    @Column({ name: "data", type: "jsonb" })
    @Field(() => JSON)
        data: object
}

export enum Collection {
    CropSpeedUp = "CROP_SPEED_UP",
    AnimalSpeedUp = "ANIMAL_SPEED_UP",
    EnergySpeedUp = "ENERGY_SPEED_UP",
}

export class SpeedUpData {
    time: number
}