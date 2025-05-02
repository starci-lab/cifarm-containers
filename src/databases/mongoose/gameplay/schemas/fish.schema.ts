import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { FishId, GraphQLTypeFishId } from "../enums"
import { AbstractSchema } from "./abstract"

@ObjectType({
    description: "The schema for fish"
})
@Schema({
    timestamps: true,
    collection: "fishes"
})
export class FishSchema extends AbstractSchema {
    @Field(() => GraphQLTypeFishId, {
        description: "The display ID of the fish"
    })
    @Prop({ type: String, enum: FishId, required: true, unique: true })
        displayId: FishId

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
    
    // fish procedure main product - fish meat and extra product - fish egg
    // will show later
}

export const FishSchemaClass = SchemaFactory.createForClass(FishSchema)