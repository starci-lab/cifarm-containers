import { Field, Float, ObjectType } from "@nestjs/graphql"
import { Column, Entity, OneToOne } from "typeorm"
import { AbstractEntity } from "./abstract"
import { AnimalEntity } from "./animal.entity"
import { CropEntity } from "./crop.entity"
import { MarketPricingType } from "./enums"

@ObjectType()
@Entity("market_pricing")
export class MarketPricingEntity extends AbstractEntity {
  @Field(() => Float)
  @Column({ name: "basic_amount", type: "float" })
      basicAmount: number

  @Field(() => Float)
  @Column({ name: "premium_amount", type: "float" })
      premiumAmount: number

  @Field(() => MarketPricingType)
  @Column({ name: "type", type: "enum", enum: MarketPricingType })
      type: MarketPricingType

  @Field(() => AnimalEntity)
  @OneToOne(() => AnimalEntity, (animal) => animal.marketPricing)
      animal: AnimalEntity

  @Field(() => CropEntity)
  @OneToOne(() => CropEntity, (crop) => crop.marketPricing)
      crop: CropEntity
}
