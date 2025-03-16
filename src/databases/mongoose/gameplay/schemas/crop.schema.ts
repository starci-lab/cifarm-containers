import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { CropId } from "../enums"
import { StaticAbstractSchema } from "./abstract"

@ObjectType({
    description: "The schema for crop"
})
@Schema({
    timestamps: true,
    collection: "crops",
})
export class CropSchema extends StaticAbstractSchema<CropId> {
    @Field(() => Int, {
        description: "The growth stage duration of the crop"
    })
    @Prop({ type: Number, required: true })
        growthStageDuration: number

    @Field(() => Int, {
        description: "The number of growth stages of the crop"
    })
    @Prop({ type: Number, required: true })
        growthStages: number

    @Field(() => Int, {
        description: "The price of the crop"
    })
    @Prop({ type: Number, required: true })
        price: number

    @Field(() => Int, {
        description: "The number of perennial crops"
    })
    @Prop({ type: Number, required: true, default: 1 })
        perennialCount: number

    @Field(() => Int, {
        description: "The unlock level of the crop"
    })
    @Prop({ type: Number, required: true, min: 1 })
        unlockLevel: number

    @Field(() => Int, {
        description: "The next growth stage after harvest"
    })
    @Prop({ type: Number, required: true })
        nextGrowthStageAfterHarvest: number

    @Field(() => Boolean, {
        description: "Whether the crop is available in the shop"
    })
    @Prop({ type: Boolean, required: true })
        availableInShop: boolean

    @Field(() => Int, {
        description: "The minimum harvest quantity of the crop"
    })
    @Prop({ type: Number, required: true })
        minHarvestQuantity: number

    @Field(() => Int, {
        description: "The maximum harvest quantity of the crop"
    })
    @Prop({ type: Number, required: true })
        maxHarvestQuantity: number

    @Field(() => Int, {
        description: "The basic harvest experiences of the crop"
    })
    @Prop({ type: Number, required: true })
        basicHarvestExperiences: number

    @Field(() => Int, {
        description: "The quality harvest experiences of the crop"
    })
    @Prop({ type: Number, required: true })
        qualityHarvestExperiences: number
}

export const CropSchemaClass = SchemaFactory.createForClass(CropSchema)
