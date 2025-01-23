import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, OneToOne, RelationId } from "typeorm"
import { StringAbstractEntity } from "./abstract"
import { InventoryTypeEntity } from "./inventory-type.entity"
import { PlacedItemTypeEntity } from "./placed-item-type.entity"

@ObjectType()
@Entity("tiles")
export class TileEntity extends StringAbstractEntity {
    @Field(() => Float)
    @Column({ name: "price", type: "float" })
        price: number

    @Field(() => Int)
    @Column({ name: "max_ownership", type: "int" })
        maxOwnership: number

    @Field(() => Boolean)
    @Column({ name: "is_nft", type: "boolean" })
        isNFT: boolean

    @Field(() => Float)
    @Column({ name: "quality_product_chance_stack", type: "float" })
        qualityProductChanceStack: number
    
    @Field(() => Float)
    @Column({ name: "quality_product_chance_limit", type: "float" })
        qualityProductChanceLimit: number

    @Field(() => Boolean)
    @Column({ name: "available_in_shop", type: "boolean" })
        availableInShop: boolean

    @Field(() => String, { nullable: true })
    @RelationId((tile: TileEntity) => tile.inventoryType)
        inventoryTypeId?: string

    @Field(() => InventoryTypeEntity, { nullable: true })
    @OneToOne(() => InventoryTypeEntity, (inventoryType) => inventoryType.tile, {
        nullable: true,
        onDelete: "CASCADE",
        cascade: ["insert", "update"]
    })
        inventoryType?: InventoryTypeEntity

    @Field(() => String)
    @RelationId((tile: TileEntity) => tile.placedItemType)
        placedItemTypeId: string

    @Field(() => PlacedItemTypeEntity)
    @OneToOne(() => PlacedItemTypeEntity, (placedItemType) => placedItemType.tile, {
        onDelete: "CASCADE",
        cascade: ["insert", "update"]
    })
        placedItemType: PlacedItemTypeEntity
}
