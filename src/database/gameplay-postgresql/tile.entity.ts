import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, OneToOne } from "typeorm"
import { ReadableAbstractEntity } from "./abstract"
import { InventoryTypeEntity } from "./inventory-type.entity"
import { PlacedItemTypeEntity } from "./placed-item-type.entity"

@ObjectType()
@Entity("tiles")
export class TileEntity extends ReadableAbstractEntity {
    @Field(() => Float)
    @Column({ name: "price", type: "float" })
    price: number

    @Field(() => Int)
    @Column({ name: "max_ownership", type: "int" })
    maxOwnership: number

    @Field(() => Boolean)
    @Column({ name: "is_nft", type: "boolean" })
    isNFT: boolean

    @Field(() => Boolean)
    @Column({ name: "available_in_shop", type: "boolean" })
    availableInShop: boolean

    @Field(() => InventoryTypeEntity, { nullable: true })
    @OneToOne(() => InventoryTypeEntity, (inventoryType) => inventoryType.tile, {
        nullable: true,
        onDelete: "CASCADE",
        cascade: ["insert"]
    })
    inventoryType?: InventoryTypeEntity

    @Field(() => PlacedItemTypeEntity, { nullable: true })
    @OneToOne(() => PlacedItemTypeEntity, (placedItemType) => placedItemType.tile, {
        nullable: true,
        onDelete: "CASCADE",
        cascade: ["insert"]
    })
    placedItemType?: PlacedItemTypeEntity
}
