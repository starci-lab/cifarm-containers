import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinColumn, OneToMany, PrimaryColumn } from "typeorm"
import { AbstractEntity, ReadableAbstractEntity } from "./abstract"
import { AnimalType } from "./enums"
import { BuildingKey } from "./enums-key"
import { UpgradeEntity } from "./upgrade.entity"

@ObjectType()
@Entity("buildings")
export class BuildingEntity extends ReadableAbstractEntity {
    @Field(() => BuildingKey)
    @PrimaryColumn({type: "enum", enum: BuildingKey })
        id: BuildingKey

    @Field(() => Boolean)
    @Column({ name: "available_in_shop", type: "boolean" })
        availableInShop: boolean

    @Field(() => AnimalType, { nullable: true })
    @Column({ name: "type", type: "enum", enum: AnimalType, nullable: true })
        type?: AnimalType

    @Field(() => Int)
    @Column({ name: "max_upgrade", type: "int" })
        maxUpgrade: number

    @Field(() => Int, {nullable: true})
    @Column({ name: "price", type: "int", nullable: true })
        price?: number

        @Field(() => [UpgradeEntity], { nullable: true })
        @OneToMany(() => UpgradeEntity, (upgrade) => upgrade.building, { cascade: ["insert", "update"] })
            upgrades?: Array<UpgradeEntity>
}
