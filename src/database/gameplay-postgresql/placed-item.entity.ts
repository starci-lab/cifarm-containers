import { Field, ObjectType } from "@nestjs/graphql"
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm"
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

    @Field(() => String, { nullable: true })
    @ManyToOne(() => PlacedItemEntity, (placedItem) => placedItem.children, { nullable: true })
    parent: PlacedItemEntity

    @Field(() => [PlacedItemEntity], { nullable: true })
    @OneToMany(() => PlacedItemEntity, (placedItem) => placedItem.parent, { nullable: true })
    children: PlacedItemEntity[]

    @Field(() => SeedGrowthInfoEntity, { nullable: true })
    @OneToOne(() => SeedGrowthInfoEntity, (seedGrowthInfo) => seedGrowthInfo.placedItem, {
        nullable: true
    })
    @JoinColumn()
    seedGrowthInfo?: SeedGrowthInfoEntity

    @Field(() => AnimalInfoEntity, { nullable: true })
    @OneToOne(() => AnimalInfoEntity, (animalInfo) => animalInfo.placedItem, { nullable: true })
    @JoinColumn()
    animalInfo?: AnimalInfoEntity

    @Field(() => BuildingInfoEntity, { nullable: true })
    @OneToOne(() => BuildingInfoEntity, (buildingInfo) => buildingInfo.placedItem, {
        nullable: true
    })
    @JoinColumn()
    buildingInfo?: BuildingInfoEntity
}
