import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, OneToOne } from "typeorm"
import { AbstractEntity } from "./abstract"
import { MarketPricingEntity } from "./market-pricing.entity"
import { AnimalType } from "./enums"

@ObjectType()
@Entity("animals")
export class AnimalEntity extends AbstractEntity {
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

    @OneToOne(() => MarketPricingEntity)
        marketPricing: MarketPricingEntity
}