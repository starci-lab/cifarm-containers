import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity } from "typeorm"
import { AbstractEntity } from "./abstract"
import { SupplyType } from "./enums"
import { SupplyKey } from "./enums-key"

@ObjectType()
@Entity("supplies")
export class SupplyEntity extends AbstractEntity {
    @Field(() => SupplyKey)
    @Column({type: "enum", enum: SupplyKey })
        key: SupplyKey

    @Field(() => SupplyType)
    @Column({ name: "type", type: "enum", enum: SupplyType })
        type: SupplyType

    @Field(() => Float)
    @Column({ name: "price", type: "float" })
        price: number

    @Field(() => Boolean)
    @Column({ name: "available_in_shop", type: "boolean", default: false })
        availableInShop: boolean

    @Field(() => Int, { nullable: true })
    @Column({ name: "time_reduce", type: "int", nullable: true })
        fertilizerEffectTimeReduce?: number

}
