import { ObjectType, Field, Int, Float, ID } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { CropCurrentState } from "../enums"
import { AbstractSchema } from "./abstract"
import { CropSchema } from "./crop.schema"
import { Schema as MongooseSchema } from "mongoose"

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
    @Prop({ type: Number, default: 0 })
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
        crop: CropSchema | string

    @Field(() => String)
    @Prop({ type: String, enum: CropCurrentState, default: CropCurrentState.Normal })
        currentState: CropCurrentState

    @Field(() => Boolean)
    @Prop({ type: Boolean, default: false })
        isFertilized: boolean
}
export const SeedGrowthInfoSchemaClass = SchemaFactory.createForClass(SeedGrowthInfoSchema)