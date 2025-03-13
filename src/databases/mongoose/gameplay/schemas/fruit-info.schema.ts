import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Schema as MongooseSchema } from "mongoose"
import { CropCurrentState } from "../enums"
import { AbstractSchema } from "./abstract"
import { FRUIT } from "../constants"
import { FruitSchema } from "./fruit.schema"

@ObjectType()
@Schema({ timestamps: true, autoCreate: false })
export class FruitInfoSchema extends AbstractSchema {
    @Field(() => Int)
    @Prop({ type: Number, default: 0 })
        currentStage: number

    @Field(() => Float)
    @Prop({ type: Number, default: 0 })
        currentStageTimeElapsed: number

    @Field(() => Int)
    @Prop({ type: Number, default: 0 })
        harvestQuantityRemaining: number

    @Field(() => Int)
    @Prop({ type: Number, default: 0 })
        harvestCount: number

    @Field(() => Boolean)
    @Prop({ type: Boolean, default: false })
        isQuality: boolean

    @Field(() => String)
    @Prop({ type: String, enum: CropCurrentState, default: CropCurrentState.Normal })
        currentState: CropCurrentState

    @Field(() => [ID])
    @Prop({ type: [MongooseSchema.Types.ObjectId], required: false, default: [] })
        thieves: Array<MongooseSchema.Types.ObjectId>

    @Field(() => ID)
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: FruitSchema.name })
    [FRUIT]: FruitSchema | string
}
export const FruitInfoSchemaClass = SchemaFactory.createForClass(FruitInfoSchema)
