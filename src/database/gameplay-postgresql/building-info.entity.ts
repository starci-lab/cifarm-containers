import { Field, ObjectType } from "@nestjs/graphql"
import { Column, Entity, ManyToOne, OneToOne } from "typeorm"
import { BuildingEntity } from "./building.entity"
import { PlacedItemEntity } from "./placed-item.entity"
import { AbstractEntity } from "./abstract"

@ObjectType()
@Entity("building_info")
export class BuildingInfoEntity extends AbstractEntity {
    @Field(() => Number)
    @Column({ type: "int", nullable: true })
    currentUpgrade: number

    @Field(() => Number)
    @Column({ type: "int", nullable: true })
    occupancy: number

    @Field(() => BuildingEntity)
    @ManyToOne(() => BuildingEntity, { nullable: true, eager: true })
    building: BuildingEntity

    @Field(() => PlacedItemEntity)
    @OneToOne(() => PlacedItemEntity, (placedItem) => placedItem.buildingInfo, {
        cascade: true,
        onDelete: "CASCADE"
    })
    placedItem?: PlacedItemEntity
}
