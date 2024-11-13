import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm"
import { ReadableAbstractEntity } from "./abstract"
import { BuildingEntity } from "./building.entity"
import { UpgradeKey } from "./enums-key"

@ObjectType()
@Entity("upgrades")
export class UpgradeEntity extends ReadableAbstractEntity {
    @Field(() => UpgradeKey)
    @PrimaryColumn({type: "enum", enum: UpgradeKey })
        id: UpgradeKey

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
