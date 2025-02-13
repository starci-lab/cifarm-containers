import { ObjectType, Field, Int, Float } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { CropCurrentState } from "../enums"
import { AbstractSchema } from "./abstract"

export type SeedGrowthInfoDocument = HydratedDocument<SeedGrowthInfoSchema>;

@ObjectType()
@Schema({ timestamps: true })
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

    @Field(() => String)
    @Prop({ type: String, required: true })
        cropKey: string

    @Field(() => String)
    @Prop({ type: String, enum: CropCurrentState, default: CropCurrentState.Normal })
        currentState: CropCurrentState

    @Field(() => Boolean)
    @Prop({ type: Boolean, default: false })
        isFertilized: boolean
}
export const SeedGrowthInfoSchemaClass = SchemaFactory.createForClass(SeedGrowthInfoSchema)