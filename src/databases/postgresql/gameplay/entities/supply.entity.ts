import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, OneToMany, OneToOne, RelationId } from "typeorm"
import { StringAbstractEntity } from "./abstract"
import { SupplyType } from "../enums"
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

    @Field(() => Int, { nullable: true })
    @Column({ name: "time_reduce", type: "int", nullable: true })
        fertilizerEffectTimeReduce?: number

    @Field(() => String)
    @RelationId((supply: SupplyEntity) => supply.inventoryType)
        inventoryTypeId: string

    @Field(() => InventoryTypeEntity)
    @OneToOne(() => InventoryTypeEntity, (inventoryType) => inventoryType.supply, {
        onDelete: "CASCADE",
        cascade: ["insert", "update"]
    })
        inventoryType: InventoryTypeEntity

    @Field(() => [String])
    @RelationId((supply: SupplyEntity) => supply.spinPrizes)
        spinPrizeIds: Array<string>

    @Field(() => [SpinPrizeEntity])
    @OneToMany(() => SpinPrizeEntity, (spinPrize) => spinPrize.supply, {
        onDelete: "CASCADE",
        cascade: ["insert"]
    })
        spinPrizes?: Array<SpinPrizeEntity>
}
