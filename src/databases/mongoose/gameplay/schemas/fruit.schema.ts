import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
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
        description: "The growth stage duration of the fruit"
    })
    @Prop({ type: Number, required: true })
        growthStageDuration: number

    @Field(() => Int, {
        description: "The price of the fruit"
    })
    @Prop({ type: Number, required: true })
        price: number

    @Field(() => Int, {
        description: "The unlock level of the fruit"
    })
    @Prop({ type: Number, required: true, min: 1 })
        unlockLevel: number

    @Field(() => Boolean, {
        description: "Whether the fruit is available in the shop"
    })
    @Prop({ type: Boolean, required: true })
        availableInShop: boolean

    @Field(() => Int, {
        description: "The minimum harvest quantity of the fruit"
    })
    @Prop({ type: Number, required: true })
        minHarvestQuantity: number

    @Field(() => Float, {
        description: "The quality product chance stack of the fruit"
    })
    @Prop({ type: Number, min: 0 })
        qualityProductChanceStack: number

    @Field(() => Float, {
        description: "The quality product chance limit of the fruit"
    })
    @Prop({ type: Number, min: 0 })
        qualityProductChanceLimit: number

    @Field(() => Int, {
        description: "The maximum harvest quantity of the fruit"
    })
    @Prop({ type: Number, required: true })
        maxHarvestQuantity: number

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
}

export const FruitSchemaClass = SchemaFactory.createForClass(FruitSchema)
