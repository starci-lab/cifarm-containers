import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinColumn, ManyToOne, Relation } from "typeorm"
import { StringAbstractEntity } from "./abstract"
import type { BuildingEntity } from "./building.entity"

@ObjectType()
@Entity("upgrades")
export class UpgradeEntity extends StringAbstractEntity {
    @Field(() => Int)
    @Column({ name: "upgrade_price", type: "int" })
        upgradePrice: number

    @Field(() => Int)
    @Column({ name: "capacity", type: "int" })
        capacity: number

    @Field(() => Number)
    @Column({ name: "upgrade_level", type: "int" })
        upgradeLevel: number

    @ManyToOne("BuildingEntity", "upgrades")
    @JoinColumn({ name: "building_id", referencedColumnName: "id" })
        building: Relation<BuildingEntity>
}
