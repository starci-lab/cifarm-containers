import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AnimalId, AnimalType } from "../enums"
import { StaticAbstractSchema } from "./abstract"

@ObjectType()
@Schema({
    timestamps: true,
    collection: "animals"
})
export class AnimalSchema extends StaticAbstractSchema<AnimalId> {
    @Field(() => Int)
    @Prop({ type: Number })
        yieldTime: number
    
    @Field(() => Int)
    @Prop({ type: Number, min: 0 })
        offspringPrice: number
  
    @Field(() => Boolean)
    @Prop({ type: Boolean })
        isNft: boolean
  
    @Field(() => Int, { nullable: true })
    @Prop({ type: Number, required: false, min: 0 })
        price: number
        
    @Field(() => Int, { nullable: true })
    @Prop({ type: Number, required: false, default: 0 })
        sellPrice?: number
  
    @Field(() => Int)
    @Prop({ type: Number, min: 0 })
        growthTime: number
  
    @Field(() => Boolean)
    @Prop({ type: Boolean, default: false })
        availableInShop: boolean
  
    @Field(() => Int)
    @Prop({ type: Number, min: 0 })
        hungerTime: number
  
    @Field(() => Float)
    @Prop({ type: Number, min: 0 })
        qualityProductChanceStack: number
  
    @Field(() => Float)
    @Prop({ type: Number, min: 0 })
        qualityProductChanceLimit: number
  
    @Field(() => Int)
    @Prop({ type: Number, min: 0 })
        minHarvestQuantity: number
  
    @Field(() => Int)
    @Prop({ type: Number, min: 0 })
        maxHarvestQuantity: number
  
    @Field(() => Int)
    @Prop({ type: Number, min: 0 })
        basicHarvestExperiences: number
  
    @Field(() => Int)
    @Prop({ type: Number, min: 0 })
        qualityHarvestExperiences: number
    
    @Field(() => Int)
    @Prop({ type: Number, min: 1 })
        unlockLevel: number

    @Field(() => String)
    @Prop({ type: String, enum: AnimalType, default: AnimalType.Poultry }) // Assuming AnimalType is an enum
        type: AnimalType
}

export const AnimalSchemaClass = SchemaFactory.createForClass(AnimalSchema)