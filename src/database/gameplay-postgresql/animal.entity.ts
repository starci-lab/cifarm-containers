import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinColumn, OneToOne } from "typeorm"
import { ReadableAbstractEntity } from "./abstract"
import { AnimalType } from "./enums"
import { InventoryTypeEntity } from "./inventory-type.entity"
import { PlacedItemTypeEntity } from "./placed-item-type.entity"
import { ProductEntity } from "./product.entity"

@ObjectType()
@Entity("animals")
export class AnimalEntity extends ReadableAbstractEntity {
    @Field(() => Int)
    @Column({ name: "yield_time", type: "int" })
        yieldTime: number

    @Field(() => Int)
    @Column({ name: "offspring_price", type: "int" })
        offspringPrice: number

    @Field(() => Boolean)
    @Column({ name: "is_nft", type: "boolean" })
        isNFT: boolean

    @Field(() => Int)
    @Column({ name: "price", type: "int", nullable: true })
        price: number

    @Field(() => Int)
    @Column({ name: "growth_time", type: "int" })
        growthTime: number

    @Field(() => Boolean)
    @Column({ name: "available_in_shop", type: "boolean" })
        availableInShop: boolean

    @Field(() => Int)
    @Column({ name: "hunger_time", type: "int" })
        hungerTime: number

    @Field(() => Int)
    @Column({ name: "min_harvest_quantity", type: "int" })
        minHarvestQuantity: number

    @Field(() => Int)
    @Column({ name: "max_harvest_quantity", type: "int" })
        maxHarvestQuantity: number

    @Field(() => Int)
    @Column({ name: "basic_harvest_experiences", type: "int" })
        basicHarvestExperiences: number

    @Field(() => Int)
    @Column({ name: "premium_harvest_experiences", type: "int" })
        premiumHarvestExperiences: number

    @Field(() => AnimalType)
    @Column({ name: "type", type: "enum", enum: AnimalType })
        type: AnimalType

    @Field(() => Float)
    @Column({ name: "sick_chance", type: "float" })
        sickChance: number

    @OneToOne(() => ProductEntity, { onDelete: "CASCADE", eager: true, cascade: true })
    @JoinColumn({
        name: "product_id",
        referencedColumnName: "id"
    })
        product: ProductEntity

    @Field(() => InventoryTypeEntity, { nullable: true })
    @OneToOne(() => InventoryTypeEntity, (inventoryType) => inventoryType.animal, {
        nullable: true,
        onDelete: "CASCADE",
        cascade: ["insert"]
    })
        inventoryType?: InventoryTypeEntity

    @Field(() => PlacedItemTypeEntity, { nullable: true })
    @OneToOne(() => PlacedItemTypeEntity, (placedItemType) => placedItemType.animal, {
        nullable: true,
        onDelete: "CASCADE",
        cascade: ["insert"]
    })
        placedItemType?: PlacedItemTypeEntity
}
