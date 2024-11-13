import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, PrimaryColumn } from "typeorm"
import { ReadableAbstractEntity } from "./abstract"
import { TileKey } from "./enums-key"

@ObjectType()
@Entity("tiles")
export class TileEntity extends ReadableAbstractEntity {
    @Field(() => TileKey)
    @PrimaryColumn({ type: "enum", enum: TileKey })
        id: TileKey

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
}
