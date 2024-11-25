import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, OneToMany, OneToOne } from "typeorm"
import { ReadableAbstractEntity } from "./abstract"
import { AnimalType } from "./enums"
import { UpgradeEntity } from "./upgrade.entity"
import { PlacedItemTypeEntity } from "./placed-item-type.entity"

@ObjectType()
@Entity("buildings")
export class BuildingEntity extends ReadableAbstractEntity {
    @Field(() => Boolean)
    @Column({ name: "available_in_shop", type: "boolean" })
        availableInShop: boolean

    @Field(() => AnimalType, { nullable: true })
    @Column({ name: "type", type: "enum", enum: AnimalType, nullable: true })
        type?: AnimalType

    @Field(() => Int)
    @Column({ name: "max_upgrade", type: "int" })
        maxUpgrade: number

    @Field(() => Int, { nullable: true })
    @Column({ name: "price", type: "int", nullable: true })
        price?: number

    @Field(() => [UpgradeEntity], { nullable: true })
    @OneToMany(() => UpgradeEntity, (upgrade: UpgradeEntity) => upgrade.building, {
        cascade: ["insert", "update"]
    })
        upgrades?: Array<UpgradeEntity>

    @Field(() => PlacedItemTypeEntity, { nullable: true })
    @OneToOne(() => PlacedItemTypeEntity, (placedItemType) => placedItemType.building, {
        nullable: true,
        onDelete: "CASCADE",
        cascade: ["insert"]
    })
        placedItemType?: PlacedItemTypeEntity
}
