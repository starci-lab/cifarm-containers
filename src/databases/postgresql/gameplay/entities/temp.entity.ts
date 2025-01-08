import { Field, ObjectType } from "@nestjs/graphql"
import { Column, Entity } from "typeorm"
import { StringAbstractEntity } from "./abstract"
import JSON from "graphql-type-json"

@ObjectType()
@Entity("temp")
export class TempEntity extends StringAbstractEntity {
    @Column({ name: "value", type: "jsonb" })
    @Field(() => JSON)
        value: object
}

export class AnimalGrowthLastSchedule {
    date: Date
}

export class CropGrowthLastSchedule {
    date: Date
}

export class EnergyGrowthLastSchedule {
    date: Date
}