import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, OneToMany, OneToOne } from "typeorm"
import { StringAbstractEntity } from "./abstract"
import { SupplyType } from "./enums"
import { InventoryTypeEntity } from "./inventory-type.entity"
import { SpinPrizeEntity } from "./spin-prize.entity"

@ObjectType()
@Entity("supplies")
export class SupplyEntity extends StringAbstractEntity {
    @Field(() => String)
    @Column({ name: "type", type: "enum", enum: SupplyType })
        type: SupplyType

    @Field(() => Float)
    @Column({ name: "price", type: "float" })
        price: number

    @Field(() => Boolean)
    @Column({ name: "available_in_shop", type: "boolean", default: false })
        availableInShop: boolean

    @Field(() => Int)
    @Column({ name: "maxStack", type: "int", default: 16 })
        maxStack: number

    @Field(() => Int, { nullable: true })
    @Column({ name: "time_reduce", type: "int", nullable: true })
        fertilizerEffectTimeReduce?: number

    @Field(() => InventoryTypeEntity, { nullable: true })
    @OneToOne(() => InventoryTypeEntity, (inventoryType) => inventoryType.supply, {
        nullable: true,
        onDelete: "CASCADE",
        cascade: ["insert"]
    })
        inventoryType?: InventoryTypeEntity

    @Field(() => [SpinPrizeEntity], { nullable: true })
    @OneToMany(() => SpinPrizeEntity, (spinPrize) => spinPrize.supply, {
        nullable: true,
        onDelete: "CASCADE",
        cascade: ["insert"]
    })
        spinPrizes?: Array<SpinPrizeEntity>
}
