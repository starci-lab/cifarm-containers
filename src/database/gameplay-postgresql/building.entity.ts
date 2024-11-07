import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, OneToMany } from "typeorm"
import { AbstractEntity } from "./abstract"
import { AnimalType, BuildingKeyType } from "./enums"
import { UpgradeEntity } from "./upgrade.entity"

@ObjectType()
@Entity("buildings")
export class BuildingEntity extends AbstractEntity {
    @Field(() => BuildingKeyType)
    @Column({ name: "key", type: "enum", enum: BuildingKeyType })
        key: BuildingKeyType

    @Field(() => Boolean)
    @Column({ name: "available_in_shop", type: "boolean" })
        availableInShop: boolean

    @Field(() => AnimalType, { nullable: true })
    @Column({ name: "type", type: "enum", enum: AnimalType, nullable: true })
        type?: AnimalType

    @Field(() => Int)
    @Column({ name: "max_upgrade", type: "int" })
        maxUpgrade: number

    @Field(() => BigInt)
    @Column({ name: "price", type: "bigint" })
        price: number

    @Field(() => [UpgradeEntity], { nullable: true })
    @OneToMany(() => UpgradeEntity, (upgrade) => upgrade.building, { cascade: true })
    upgrades?: UpgradeEntity[]
}
