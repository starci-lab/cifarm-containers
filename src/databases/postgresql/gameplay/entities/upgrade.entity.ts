import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm"
import { StringAbstractEntity } from "./abstract"
import { BuildingEntity } from "./building.entity"

@ObjectType()
@Entity("upgrades")
export class UpgradeEntity extends StringAbstractEntity {
    @Field(() => Int, { nullable: true })
    @Column({ name: "upgrade_price", type: "int", nullable: true })
        upgradePrice?: number

    @Field(() => Int)
    @Column({ name: "capacity", type: "int" })
        capacity: number

    @Field(() => Number)
    @Column({ name: "upgrade_level", type: "int" })
        upgradeLevel: number

    @Field(() => String)
    @Column({ name: "building_id", type: "uuid" })
        buildingId: string

    @Field(() => BuildingEntity)
    @ManyToOne(() => BuildingEntity, (building: BuildingEntity) => building.upgrades)
    @JoinColumn({ name: "building_id", referencedColumnName: "id" })
        building: BuildingEntity
}
