import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { FruitId, FirstCharLowerCaseFruitId } from "../enums"
import { AbstractSchema } from "./abstract"

@ObjectType({
    description: "The fruit schema"
})
@Schema({
    timestamps: true,
    collection: "fruits"
})
export class FruitSchema extends AbstractSchema {
    @Field(() => FirstCharLowerCaseFruitId, {
        description: "The display ID of the fruit"
    })
    @Prop({ type: String, enum: FruitId, required: true, unique: true })
        displayId: FruitId

    @Field(() => Int, {
        description: "The growth stage duration of young fruit"
    })
    @Prop({ type: Number, required: true })
        youngGrowthStageDuration: number

    @Field(() => Int, {
        description: "The growth stage duration of mature fruit"
    })
    @Prop({ type: Number, required: true })
        matureGrowthStageDuration: number

    @Field(() => Int, {
        description: "The time that the fruit tree require fertilizer"
    })
    @Prop({ type: Number, required: true })
        fertilizerTime: number

    @Field(() => Int, {
        description: "The price of the fruit"
    })
    @Prop({ type: Number, required: true })
        price: number

    @Field(() => Int, {
        description: "The unlock level of the fruit",
        nullable: true
    })
    @Prop({ type: Number, required: false, min: 1 })
        unlockLevel?: number

    @Field(() => Boolean, {
        description: "Whether the fruit is available in the shop"
    })
    @Prop({ type: Boolean, required: true })
        availableInShop: boolean

    @Field(() => Int, {
        description: "The maximum harvest quantity of the fruit"
    })
    @Prop({ type: Number, required: true })
        harvestQuantity: number

    @Field(() => Int, {
        description: "The basic harvest experiences of the fruit"
    })
    @Prop({ type: Number, required: true })
        basicHarvestExperiences: number

    @Field(() => Int, {
        description: "The quality harvest experiences of the fruit"
    })
    @Prop({ type: Number, required: true })
        qualityHarvestExperiences: number

    @Field(() => Boolean, {
        description: "Whether the fruit is sellable",
        nullable: true
    })
    @Prop({ type: Boolean, required: false })
        sellable?: boolean  

    @Field(() => Int, {
        description: "The sell price of the fruit",
        nullable: true
    })
    @Prop({ type: Number, required: false, default: 0 })
        sellPrice?: number
    
    @Field(() => Boolean, {
        description: "Whether the fruit is a NFT",
    })
    @Prop({ type: Boolean, default: false })
        isNFT: boolean
}

export const FruitSchemaClass = SchemaFactory.createForClass(FruitSchema)
