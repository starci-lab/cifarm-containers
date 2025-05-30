import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AnimalId, AnimalType, GraphQLTypeAnimalId, GraphQLTypeAnimalType } from "../enums"
import { AbstractSchema } from "./abstract"

@ObjectType({
    description: "The schema for animal"
})
@Schema({
    timestamps: true,
    collection: "animals"
})
export class AnimalSchema extends AbstractSchema {
    @Field(() => GraphQLTypeAnimalId, {
        description: "The display ID of the animal"
    })
    @Prop({ type: String, enum: AnimalId, required: true, unique: true })
        displayId: AnimalId

    @Field(() => Int, {
        description: "The yield time of the animal"
    })
    @Prop({ type: Number })
        yieldTime: number
    
    @Field(() => Int, {
        description: "The offspring price of the animal"
    })
    @Prop({ type: Number, min: 0 })
        offspringPrice: number
  
    @Field(() => Boolean, {
        description: "Whether the animal is an NFT"
    })
    @Prop({ type: Boolean })
        isNFT: boolean
  
    @Field(() => Int, {
        description: "The price of the animal",
        nullable: true
    })
    @Prop({ type: Number, required: false, min: 0 })
        price: number
        
    @Field(() => Boolean, {
        description: "Whether the animal is sellable",
        nullable: true
    })
    @Prop({ type: Boolean, required: false })
        sellable?: boolean

    @Field(() => Int, {
        description: "The sell price of the animal",
        nullable: true
    })
    @Prop({ type: Number, required: false, default: 0 })
        sellPrice?: number

    @Field(() => Int, {
        description: "The growth time of the animal"
    })
    @Prop({ type: Number, min: 0 })
        growthTime: number
  
    @Field(() => Boolean, {
        description: "Whether the animal is available in the shop"
    })
    @Prop({ type: Boolean, default: false })
        availableInShop: boolean
  
    @Field(() => Int, {
        description: "The hunger time of the animal"
    })
    @Prop({ type: Number, min: 0 })
        hungerTime: number
  
    @Field(() => Int, {
        description: "The harvest quantity of the animal"
    })
    @Prop({ type: Number, min: 0 })
        harvestQuantity: number
  
    @Field(() => Int, {
        description: "The basic harvest experiences of the animal"
    })
    @Prop({ type: Number, min: 0 })
        basicHarvestExperiences: number
  
    @Field(() => Int, {
        description: "The quality harvest experiences of the animal"
    })
    @Prop({ type: Number, min: 0 })
        qualityHarvestExperiences: number
    
    @Field(() => Int, {
        description: "The unlock level of the animal"
    })
    @Prop({ type: Number, min: 1 })
        unlockLevel: number

    @Field(() => GraphQLTypeAnimalType, {
        description: "The type of the animal"
    })
    @Prop({ type: String, enum: AnimalType, default: AnimalType.Poultry })
        type: AnimalType 
}

export const AnimalSchemaClass = SchemaFactory.createForClass(AnimalSchema)