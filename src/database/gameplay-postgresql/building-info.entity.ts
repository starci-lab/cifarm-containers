import { Field, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm"
import { BuildingEntity } from "./building.entity"
import { PlacedItemEntity } from "./placed-item.entity"
import { StringAbstractEntity } from "./abstract"

@ObjectType()
@Entity("building_info")
export class BuildingInfoEntity extends StringAbstractEntity {
    @Field(() => Number)
    @Column({ type: "int", nullable: true })
        currentUpgrade: number

    @Field(() => Number)
    @Column({ type: "int", nullable: true })
        occupancy: number

    @Field(() => String, { nullable: true })
    @Column({ name: "building_id", nullable: true })
        buildingId: string

    @Field(() => BuildingEntity)
    @ManyToOne(() => BuildingEntity, { nullable: true, onDelete: "CASCADE" })
    @JoinColumn({ name: "building_id", referencedColumnName: "id" })
        building: BuildingEntity

    @Field(() => PlacedItemEntity)
    @OneToOne(() => PlacedItemEntity, (placedItem) => placedItem.buildingInfo, {
        onDelete: "CASCADE"
    })
        placedItem?: PlacedItemEntity
}
