import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm"
import { ReadableAbstractEntity } from "./abstract"
import { BuildingEntity } from "./building.entity"

@ObjectType()
@Entity("upgrades")
export class UpgradeEntity extends ReadableAbstractEntity {
    @Field(() => Int)
    @Column({ name: "upgrade_price", type: "int" })
        upgradePrice: number

    @Field(() => Int)
    @Column({ name: "capacity", type: "int" })
        capacity: number

    @Field(() => Number)
    @Column({ name: "upgrade_level", type: "int" })
        upgradeLevel: number

    @Field(() => BuildingEntity)
    @ManyToOne(() => BuildingEntity, (building: BuildingEntity) => building.upgrades)
    @JoinColumn({ name: "building_id", referencedColumnName: "id" })
        building: BuildingEntity
}
