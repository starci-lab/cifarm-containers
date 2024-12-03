import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, OneToOne, Relation } from "typeorm"
import { StringAbstractEntity } from "./abstract"
import type { InventoryTypeEntity } from "./inventory-type.entity"
import type { PlacedItemTypeEntity } from "./placed-item-type.entity"

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

    @Field(() => Boolean)
    @Column({ name: "available_in_shop", type: "boolean" })
        availableInShop: boolean

    @OneToOne("InventoryTypeEntity", "tile", {
        nullable: true,
        onDelete: "CASCADE",
        cascade: ["insert"]
    })
        inventoryType?: Relation<InventoryTypeEntity>

    @OneToOne("PlacedItemTypeEntity", "tile", {
        nullable: true,
        onDelete: "CASCADE",
        cascade: ["insert"]
    })
        placedItemType?: Relation<PlacedItemTypeEntity>
}
