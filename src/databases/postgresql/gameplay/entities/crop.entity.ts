import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Column, Entity, OneToMany, OneToOne } from "typeorm"
import { StringAbstractEntity } from "./abstract"
import { InventoryTypeEntity } from "./inventory-type.entity"
import { ProductEntity } from "./product.entity"
import { SpinPrizeEntity } from "./spin-prize.entity"

@ObjectType()
@Entity("crops")
export class CropEntity extends StringAbstractEntity {
    @Field(() => Int)
    @Column({ name: "growth_stage_duration", type: "int" })
        growthStageDuration: number

    @Field(() => Int)
    @Column({ name: "growth_stages", type: "int" })
        growthStages: number

    @Field(() => Int)
    @Column({ name: "price", type: "int" })
        price: number

    @Field(() => Boolean)
    @Column({ name: "premium", type: "boolean" })
        premium: boolean

    @Field(() => Int)
    @Column({ name: "perennial_count", type: "int4", default: 1 })
        perennialCount: number

    @Field(() => Int)
    @Column({ name: "next_growth_stage_after_harvest", type: "int" })
        nextGrowthStageAfterHarvest: number

    @Field(() => Int)
    @Column({ name: "min_harvest_quantity", type: "int" })
        minHarvestQuantity: number

    @Field(() => Int)
    @Column({ name: "max_harvest_quantity", type: "int" })
        maxHarvestQuantity: number

    @Field(() => Int)
    @Column({ name: "basic_harvest_experiences", type: "int" })
        basicHarvestExperiences: number

    @Field(() => Int)
    @Column({ name: "premium_harvest_experiences", type: "int" })
        premiumHarvestExperiences: number

    @Field(() => Boolean)
    @Column({ name: "available_in_shop", type: "boolean" })
        availableInShop: boolean

    @Field(() => Int)
    @Column({ name: "maxStack", type: "int", default: 16 })
        maxStack: number

    @Field(() => ProductEntity, { nullable: true })
    @OneToOne(() => ProductEntity, (product) => product.crop, {
        nullable: true,
        onDelete: "CASCADE",
        cascade: ["insert"]
    })
        product?: ProductEntity
 
    @Field(() => InventoryTypeEntity, { nullable: true })
    @OneToOne(() => InventoryTypeEntity, (inventoryType) => inventoryType.crop, {
        nullable: true,
        onDelete: "CASCADE",
        cascade: ["insert"]
    })
        inventoryType?: InventoryTypeEntity

    @Field(() => [SpinPrizeEntity], { nullable: true })
    @OneToMany(() => SpinPrizeEntity, (spinPrize) => spinPrize.crop, {
        nullable: true,
        onDelete: "CASCADE",
        cascade: ["insert"]
    })
        spinPrizes?: Array<SpinPrizeEntity>
}
