import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm"
import { AnimalType } from "./enums"
import { AnimalKey } from "./enums-key"
import { ProductEntity } from "./product.entity"
import { ReadableAbstractEntity } from "./abstract"

@ObjectType()
@Entity("animals")
export class AnimalEntity extends ReadableAbstractEntity {
    @Field(() => AnimalKey)
    @PrimaryColumn({ type: "enum", enum: AnimalKey })
        id: AnimalKey

    @Field(() => Int)
    @Column({ name: "yield_time", type: "bigint" })
        yieldTime: number

    @Field(() => Int)
    @Column({ name: "offspring_price", type: "bigint" })
        offspringPrice: number

    @Field(() => Boolean)
    @Column({ name: "is_nft", type: "boolean" })
        isNFT: boolean

    @Field(() => Int)
    @Column({ name: "growth_time", type: "bigint" })
        growthTime: number

    @Field(() => Boolean)
    @Column({ name: "available_in_shop", type: "boolean" })
        availableInShop: boolean

    @Field(() => Int)
    @Column({ name: "hunger_time", type: "bigint" })
        hungerTime: number

    @Field(() => Int)
    @Column({ name: "min_harvest_quantity", type: "int" })
        minHarvestQuantity: number

    @Field(() => Int)
    @Column({ name: "max_harvest_quantity", type: "int" })
        maxHarvestQuantity: number

    @Field(() => Int)
    @Column({ name: "basic_harvest_experiences", type: "bigint" })
        basicHarvestExperiences: number

    @Field(() => Int)
    @Column({ name: "premium_harvest_experiences", type: "bigint" })
        premiumHarvestExperiences: number

    @Field(() => AnimalType)
    @Column({ name: "type", type: "enum", enum: AnimalType })
        type: AnimalType

    @Field(() => Float)
    @Column({ name: "sick_chance", type: "float" })
        sickChance: number

    @OneToOne(() => ProductEntity, { cascade: true, onDelete: "CASCADE" })
    @JoinColumn()
        product: ProductEntity
}