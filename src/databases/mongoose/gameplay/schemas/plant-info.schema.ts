import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Schema as MongooseSchema, Types } from "mongoose"
import { CROP, FLOWER } from "../constants"
import {
    PlantCurrentState,
    FirstCharLowerCasePlantCurrentState,
    FirstCharLowerCasePlantType,
    PlantType
} from "../enums"
import { AbstractSchema } from "./abstract"
import { CropSchema } from "./crop.schema"
import { FlowerSchema } from "./flower.schema"

@ObjectType({
    description: "The schema for tracking plant growth information"
})
@Schema({ timestamps: true, autoCreate: false })
export class PlantInfoSchema extends AbstractSchema {
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
        description: "The number of times the crop has been harvested",
        defaultValue: 0
    })
    @Prop({ type: Number, default: 0 })
        harvestCount: number

    @Field(() => Boolean, {
        description: "Whether the crop will produce quality products"
    })
    @Prop({ type: Boolean, default: false })
        isQuality: boolean

    @Field(() => ID, {
        description: "The crop type being grown",
        nullable: true
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: CropSchema.name, required: false })
    [CROP]: CropSchema | Types.ObjectId

    @Field(() => ID, {
        description: "The flower type being grown",
        nullable: true
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: FlowerSchema.name, required: false })
    [FLOWER]: FlowerSchema | Types.ObjectId

    @Field(() => FirstCharLowerCasePlantCurrentState, {
        description: "The current state of the plant (normal, withered, etc.)"
    })
    @Prop({ type: String, enum: PlantCurrentState, default: PlantCurrentState.Normal })
        currentState: PlantCurrentState

    @Field(() => Boolean, {
        description: "Whether the crop has been fertilized"
    })
    @Prop({ type: Boolean, default: false })
        isFertilized: boolean

    @Field(() => [ID], {
        description: "The list of users who have stolen from this crop"
    })
    @Prop({ type: [MongooseSchema.Types.ObjectId], required: false, default: [] })
        thieves: Array<Types.ObjectId>

    @Field(() => FirstCharLowerCasePlantType, {
        description: "The type of plant"
    })
    @Prop({ type: String, enum: PlantType, default: PlantType.Crop })
        plantType: PlantType
}
export const PlantInfoSchemaClass = SchemaFactory.createForClass(PlantInfoSchema)
