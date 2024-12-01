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
    SpeedUp = "speedUp",
}

export class SpeedUpData {
    time: number
}