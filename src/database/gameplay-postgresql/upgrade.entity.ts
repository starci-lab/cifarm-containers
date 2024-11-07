import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm"
import { AbstractEntity } from "./abstract"
import { BuildingEntity } from "./building.entity"

@ObjectType()
@Entity("upgrades")
export class UpgradeEntity extends AbstractEntity {
    @Field(() => Int)
    @Column({ name: "upgrade_price", type: "int" })
        upgradePrice: number

    @Field(() => Int)
    @Column({ name: "capacity", type: "int" })
        capacity: number

    @ManyToOne(() => BuildingEntity, (building) => building.upgrades, { onDelete: "CASCADE" })
    @JoinColumn()
        building: BuildingEntity
}
