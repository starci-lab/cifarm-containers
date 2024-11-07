import { Field, Float, ID, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinColumn, OneToOne } from "typeorm"
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

  @Field(() => ID, {
      nullable: true
  })
  @Column({ name: "animal_id", type: "uuid", nullable: true })
      animalId: number

  @Field(() => AnimalEntity)
  @OneToOne(() => AnimalEntity, (animal) => animal.marketPricing)
  @JoinColumn({
      name: "animal_id"
  })
      animal: AnimalEntity

  @Column({ name: "crop_id", type: "uuid", nullable: true })
      cropId: number

  @Field(() => CropEntity)
  @OneToOne(() => CropEntity, (crop) => crop.marketPricing)
  @JoinColumn({
      name: "crop_id"
  })
      crop: CropEntity
}
