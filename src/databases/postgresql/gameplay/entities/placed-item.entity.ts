import { Field, ID, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, RelationId } from "typeorm"
import { UuidAbstractEntity } from "./abstract"
import { AnimalInfoEntity } from "./animal-info.entity"
import { BuildingInfoEntity } from "./building-info.entity"
import { PlacedItemTypeEntity } from "./placed-item-type.entity"
import { SeedGrowthInfoEntity } from "./seed-grow-info.entity"
import { UserEntity } from "./user.entity"
import { TileInfoEntity } from "./tile-info.entity"

@ObjectType()
@Entity("placed_items")
export class PlacedItemEntity extends UuidAbstractEntity {
    @Field(() => String)
    @Column({ name: "x", type: "int" })
        x: number

    @Field(() => String)
    @Column({ name: "y", type: "int" })
        y: number

    @Field(() => String, { nullable: true })
    @Column({ name: "user_id", nullable: true })
        userId: string

    @Field(() => UserEntity, { nullable: true })
    @ManyToOne(() => UserEntity, (user) => user.placedItems, { onDelete: "CASCADE", eager: true })
    @JoinColumn({ name: "user_id", referencedColumnName: "id" })
        user?: UserEntity

    @Field(() => String, { nullable: true })
    @Column({ name: "inventory_id", type: "uuid", nullable: true })
        inventoryId?: string

    @Field(() => ID, { nullable: true })
    @RelationId((placedItem: PlacedItemEntity) => placedItem.seedGrowthInfo)
        seedGrowthInfoId?: string

    @Field(() => SeedGrowthInfoEntity, { nullable: true })
    @OneToOne(() => SeedGrowthInfoEntity, (seedGrowthInfo) => seedGrowthInfo.placedItem, {
        nullable: true,
        cascade: true,
        onDelete: "CASCADE"
    })
        seedGrowthInfo?: SeedGrowthInfoEntity

    @Field(() => ID, { nullable: true })
    @RelationId((placedItem: PlacedItemEntity) => placedItem.tileInfo)
        tileInfoId?: string

    @Field(() => TileInfoEntity, { nullable: true })
    @OneToOne(() => TileInfoEntity, (tileInfo) => tileInfo.placedItem, {
        nullable: true,
        cascade: true,
        onDelete: "CASCADE"
    })
        tileInfo?: TileInfoEntity

    @Field(() => ID, { nullable: true })
    @RelationId((placedItem: PlacedItemEntity) => placedItem.animalInfo)
        animalInfoId?: string

    @Field(() => AnimalInfoEntity, { nullable: true })
    @OneToOne(() => AnimalInfoEntity, (animalInfo) => animalInfo.placedItem, {
        nullable: true,
        cascade: true,
        onDelete: "CASCADE"
    })
        animalInfo?: AnimalInfoEntity

    @Field(() => ID, { nullable: true })
    @RelationId((placedItem: PlacedItemEntity) => placedItem.buildingInfo)
        buildingInfoId?: string

    @Field(() => BuildingInfoEntity, { nullable: true })
    @OneToOne(() => BuildingInfoEntity, (buildingInfo) => buildingInfo.placedItem, {
        nullable: true,
        cascade: true,
        onDelete: "CASCADE"
    })
        buildingInfo?: BuildingInfoEntity

    @Field(() => [ID])
    @RelationId((placedItem: PlacedItemEntity) => placedItem.placedItems)
        placedItemIds?: Array<string>
    
    @Field(() => [PlacedItemEntity])
    @OneToMany(() => PlacedItemEntity, (placedItem) => placedItem.parent, {
        cascade: true,
        onDelete: "CASCADE"
    })
        placedItems?: Array<PlacedItemEntity>

    @Field(() => String, { nullable: true })
    @Column({ name: "parent_id", type: "uuid", nullable: true })
        parentId?: string

    @Field(() => String, { nullable: true })
    @ManyToOne(() => PlacedItemEntity, (placedItem) => placedItem.placedItems, { nullable: true })
    @JoinColumn({ name: "parent_id", referencedColumnName: "id" })
        parent: PlacedItemEntity

    @Field(() => String, { nullable: true })
    @Column({ name: "placed_item_type_id", type: "uuid", nullable: true })
        placedItemTypeId?: string

    @Field(() => PlacedItemTypeEntity, { nullable: true })
    @ManyToOne(() => PlacedItemTypeEntity, (placedItemType) => placedItemType.placedItems, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "placed_item_type_id", referencedColumnName: "id" })
        placedItemType?: PlacedItemTypeEntity
}
