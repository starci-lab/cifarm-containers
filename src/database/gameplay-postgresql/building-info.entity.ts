import { Field, ObjectType } from "@nestjs/graphql"
import { Column, Entity, ManyToOne, OneToOne } from "typeorm"
import { BuildingEntity } from "./building.entity"
import { PlacedItemEntity } from "./placed-item.entity"
import { AbstractEntity } from "./abstract"

@ObjectType()
@Entity("building_infos")
export class BuildingInfoEntity extends AbstractEntity {
    @Field(() => Number)
    @Column({ type: "int", nullable: true })
        currentUpgrade: number

    @Field(() => Number)
    @Column({ type: "int", nullable: true })
        occupancy: number

    @Field(() => BuildingEntity)
    @ManyToOne(() => BuildingEntity, { nullable: true, onDelete: "CASCADE" })
        building: BuildingEntity

    @Field(() => PlacedItemEntity)
    @OneToOne(() => PlacedItemEntity, (placedItem) => placedItem.buildingInfo, {
        onDelete: "CASCADE"
    })
        placedItem?: PlacedItemEntity
}
