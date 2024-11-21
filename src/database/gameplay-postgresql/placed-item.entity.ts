import { Field, ObjectType } from "@nestjs/graphql"
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm"
import { AbstractEntity } from "./abstract"
import { AnimalInfoEntity } from "./animal-info.entity"
import { BuildingInfoEntity } from "./building-info.entity"
import { SeedGrowthInfoEntity } from "./seed-grow-info.entity"
import { UserEntity } from "./user.entity"

@ObjectType()
@Entity("placed_items")
export class PlacedItemEntity extends AbstractEntity {
    @Field(() => String)
    @Column({ name: "x", type: "int" })
    x: number

    @Field(() => String)
    @Column({ name: "y", type: "int" })
    y: number

    @Field(() => UserEntity)
    @Index()
    @Column({ name: "user_id", type: "varchar" })
    userId: string

    @Field(() => UserEntity)
    @ManyToOne(() => UserEntity, (user) => user.placedItems, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: UserEntity

    @Field(() => String, { nullable: true })
    @Column({ name: "item_key", type: "varchar", nullable: true })
    itemKey?: string

    @Field(() => String, { nullable: true })
    @Column({ name: "inventory_key", type: "varchar", nullable: true })
    inventoryKey?: string

    @Field(() => String)
    @Column({ name: "type", type: "varchar" })
    type: string

    @Field(() => SeedGrowthInfoEntity, { nullable: true })
    @ManyToOne(() => SeedGrowthInfoEntity, { nullable: true })
    @JoinColumn({ name: "seed_growth_info_id" })
    seedGrowthInfo?: SeedGrowthInfoEntity

    // Sử dụng mối quan hệ mới với AnimalInfoEntity
    @Field(() => AnimalInfoEntity, { nullable: true })
    @ManyToOne(() => AnimalInfoEntity, { nullable: true })
    @JoinColumn({ name: "animal_info_id" })
    animalInfo?: AnimalInfoEntity

    // Sử dụng mối quan hệ mới với BuildingInfoEntity
    @Field(() => BuildingInfoEntity, { nullable: true })
    @ManyToOne(() => BuildingInfoEntity, { nullable: true })
    @JoinColumn({ name: "building_info_id" })
    buildingInfo?: BuildingInfoEntity

    @Field(() => String, { nullable: true })
    @Column({ name: "parent_placed_item_key", type: "varchar", nullable: true })
    parentPlacedItemKey?: string
}
