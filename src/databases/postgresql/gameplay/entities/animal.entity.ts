import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, OneToMany, OneToOne, RelationId } from "typeorm"
import { StringAbstractEntity } from "./abstract"
import { AnimalType } from "../enums"
import { InventoryTypeEntity } from "./inventory-type.entity"
import { PlacedItemTypeEntity } from "./placed-item-type.entity"
import { ProductEntity } from "./product.entity"

@ObjectType()
@Entity("animals")
export class AnimalEntity extends StringAbstractEntity {
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

    @Field(() => Float)
    @Column({ name: "quality_product_chance_stack", type: "float" })
        qualityProductChanceStack: number

    @Field(() => Float)
    @Column({ name: "quality_product_chance_limit", type: "float" })
        qualityProductChanceLimit: number

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

    @Field(() => String)
    @Column({ name: "type", type: "enum", enum: AnimalType })
        type: AnimalType

    @Field(() => [ID])
    @RelationId((animal: AnimalEntity) => animal.products)
        productIds: Array<string>

    @Field(() => [ProductEntity])
    @OneToMany(() => ProductEntity, (product) => product.animal, {
        nullable: true,
        onDelete: "CASCADE",
        cascade: ["insert"]
    })
        products: Array<ProductEntity>

    @Field(() => ID)
    @RelationId((animal: AnimalEntity) => animal.inventoryType)
        inventoryTypeId: string

    @Field(() => InventoryTypeEntity)
    @OneToOne(() => InventoryTypeEntity, (inventoryType) => inventoryType.animal, {
        nullable: true,
        onDelete: "CASCADE",
        cascade: ["insert"]
    })
        inventoryType: InventoryTypeEntity

    @Field(() => ID, { nullable: true })
    @RelationId((animal: AnimalEntity) => animal.placedItemType)
        placedItemTypeId?: string

    @Field(() => PlacedItemTypeEntity)
    @OneToOne(() => PlacedItemTypeEntity, (placedItemType) => placedItemType.animal, {
        nullable: true,
        onDelete: "CASCADE",
        cascade: ["insert", "update"]
    })
        placedItemType?: PlacedItemTypeEntity
}
