import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity } from "typeorm"
import { AbstractEntity } from "./abstract"
import { TileKey } from "./enums-key"

@ObjectType()
@Entity("tiles")
export class TileEntity extends AbstractEntity {
    @Field(() => TileKey)
    @Column({type: "enum", enum: TileKey })
        key: TileKey

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
