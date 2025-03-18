import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { CropId, LowerCaseCropId } from "../enums"
import { AbstractSchema } from "./abstract"

@ObjectType({
    description: "The crop schema"
})
@Schema({
    timestamps: true,
    collection: "crops",
})
export class CropSchema extends AbstractSchema {
    @Field(() => LowerCaseCropId, {
        description: "The display ID of the crop"
    })
    @Prop({ type: String, enum: CropId, required: true, unique: true })
        displayId: CropId

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
