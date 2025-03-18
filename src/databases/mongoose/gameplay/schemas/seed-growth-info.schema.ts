import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Schema as MongooseSchema } from "mongoose"
import { CROP } from "../constants"
import { CropCurrentState, FirstCharLowerCaseCropCurrentState } from "../enums"
import { AbstractSchema } from "./abstract"
import { CropSchema } from "./crop.schema"

@ObjectType({
    description: "The schema for tracking seed growth information"
})
@Schema({ timestamps: true, autoCreate: false  })
export class SeedGrowthInfoSchema extends AbstractSchema {
    
    @Field(() => Int, {
        description: "The current growth stage of the seed"
    })
    @Prop({ type: Number, default: 0 })
        currentStage: number

    @Field(() => Float, {
        description: "The time elapsed in the current growth stage"
    })
    @Prop({ type: Number, default: 0 })
        currentStageTimeElapsed: number

    @Field(() => Int, {
        description: "The current perennial count for perennial crops"
    })
    @Prop({ type: Number, default: 1 })
        currentPerennialCount: number

    @Field(() => Int, {
        description: "The remaining quantity that can be harvested"
    })
    @Prop({ type: Number, default: 0 })
        harvestQuantityRemaining: number

    @Field(() => Int, {
        description: "The number of times the crop has been harvested"
    })
    @Prop({ type: Number, default: 0 })
        harvestCount: number

    @Field(() => Boolean, {
        description: "Whether the crop will produce quality products"
    })
    @Prop({ type: Boolean, default: false })
        isQuality: boolean

    @Field(() => ID, {
        description: "The crop type being grown"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: CropSchema.name })
    [CROP]: CropSchema | string

    @Field(() => FirstCharLowerCaseCropCurrentState, {
        description: "The current state of the crop (normal, withered, etc.)"
    })
    @Prop({ type: String, enum: CropCurrentState, default: CropCurrentState.Normal })
        currentState: CropCurrentState

    @Field(() => Boolean, {
        description: "Whether the crop has been fertilized"
    })
    @Prop({ type: Boolean, default: false })
        isFertilized: boolean
    
    @Field(() => [ID], {
        description: "The list of users who have stolen from this crop"
    })
    @Prop({ type: [MongooseSchema.Types.ObjectId], required: false, default: [] })
        thieves: Array<MongooseSchema.Types.ObjectId>
}
export const SeedGrowthInfoSchemaClass = SchemaFactory.createForClass(SeedGrowthInfoSchema)

