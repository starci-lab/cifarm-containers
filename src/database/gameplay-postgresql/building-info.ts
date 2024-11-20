import { ObjectType, Field } from "@nestjs/graphql"
import { Column, ManyToOne } from "typeorm"
import { BuildingEntity } from "./building.entity"

@ObjectType()
export class BuildingInfo {
    @Field(() => Number)
    @Column({ type: "int", nullable: true })
    currentUpgrade: number

    @Field(() => Number)
    @Column({ type: "int", nullable: true })
    occupancy: number

    @Field(() => BuildingEntity)
    @ManyToOne(() => BuildingEntity, { nullable: true, eager: true })
    building: BuildingEntity
}
