import { Field, ObjectType } from "@nestjs/graphql"
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm"
import { AbstractEntity } from "./abstract"
import { AnimalInfo } from "./animal-info"
import { SeedGrowthInfo } from "./seed-grow-info"
import { UserEntity } from "./user.entity"
import { BuildingInfo } from "./building-info"

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

    @Field(() => SeedGrowthInfo, { nullable: true })
    @Column({ type: "json", nullable: true })
    seedGrowthInfo?: SeedGrowthInfo

    @Field(() => AnimalInfo, { nullable: true })
    @Column({ type: "json", nullable: true })
    animalInfo?: AnimalInfo

    @Field(() => BuildingInfo, { nullable: true })
    @Column({ type: "json", nullable: true })
    buildingInfo?: BuildingInfo

    @Field(() => String, { nullable: true })
    @Column({ name: "parent_placed_item_key", type: "varchar", nullable: true })
    parentPlacedItemKey?: string
}
