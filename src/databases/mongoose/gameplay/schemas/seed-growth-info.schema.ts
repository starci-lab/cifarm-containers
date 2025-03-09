import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Schema as MongooseSchema } from "mongoose"
import { CROP } from "../constants"
import { CropCurrentState } from "../enums"
import { AbstractSchema } from "./abstract"
import { CropSchema } from "./crop.schema"

@ObjectType()
@Schema({ timestamps: true, autoCreate: false  })
export class SeedGrowthInfoSchema extends AbstractSchema {
    
    @Field(() => Int)
    @Prop({ type: Number, default: 0 })
        currentStage: number

    @Field(() => Float)
    @Prop({ type: Number, default: 0 })
        currentStageTimeElapsed: number

    @Field(() => Int)
    @Prop({ type: Number, default: 1 })
        currentPerennialCount: number

    @Field(() => Int)
    @Prop({ type: Number })
        harvestQuantityRemaining: number

    @Field(() => Int)
    @Prop({ type: Number, default: 0 })
        harvestCount: number

    @Field(() => Boolean)
    @Prop({ type: Boolean, default: false })
        isQuality: boolean

    @Field(() => ID)
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: CropSchema.name })
    [CROP]: CropSchema | string

    @Field(() => String)
    @Prop({ type: String, enum: CropCurrentState, default: CropCurrentState.Normal })
        currentState: CropCurrentState

    @Field(() => Boolean)
    @Prop({ type: Boolean, default: false })
        isFertilized: boolean
    
    @Field(() => [ID])
    @Prop({ type: [MongooseSchema.Types.ObjectId], required: false, default: [] })
        thieves: Array<MongooseSchema.Types.ObjectId>
}
export const SeedGrowthInfoSchemaClass = SchemaFactory.createForClass(SeedGrowthInfoSchema)

